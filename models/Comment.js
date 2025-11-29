const { query } = require('../config/database');

class Comment {
  // Crear comentario
  static async create(commentData) {
    const { content, post_id, user_id } = commentData;
    
    const sql = `
      INSERT INTO comments (content, post_id, user_id, created_at)
      VALUES (?, ?, ?, NOW())
    `;
    
    const result = await query(sql, [content, post_id, user_id]);
    return result.insertId;
  }

  // Obtener comentario por ID
  static async findById(id) {
    const sql = `
      SELECT 
        c.*,
        u.username,
        u.avatar,
        u.role
      FROM comments c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `;
    
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  // Eliminar comentario
  static async delete(id) {
    const sql = `DELETE FROM comments WHERE id = ?`;
    await query(sql, [id]);
  }

  // Obtener comentarios de un post
  static async findByPost(postId) {
    const sql = `
      SELECT 
        c.id,
        c.content,
        c.created_at,
        u.id as user_id,
        u.username,
        u.avatar,
        u.role
      FROM comments c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `;
    
    return await query(sql, [postId]);
  }
}

module.exports = Comment;