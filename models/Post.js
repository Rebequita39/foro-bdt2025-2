const { query } = require('../config/database');

class Post {
  // Crear post
  static async create(postData) {
    const { title, content, user_id, board_id, image } = postData;
    
    const sql = `
      INSERT INTO posts (title, content, user_id, board_id, image, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await query(sql, [title, content, user_id, board_id, image || null]);
    return result.insertId;
  }

  // Obtener post por ID
  static async findById(id) {
    const sql = `
      SELECT 
        p.*,
        u.username,
        u.avatar,
        u.role,
        b.name as board_name
      FROM posts p
      INNER JOIN users u ON p.user_id = u.id
      INNER JOIN boards b ON p.board_id = b.id
      WHERE p.id = ?
    `;
    
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  // Obtener todos los posts con paginación
  static async findAll(limit = 50, offset = 0) {
    const sql = `
      SELECT 
        p.id,
        p.title,
        p.content,
        p.image,
        p.views,
        p.created_at,
        p.updated_at,
        u.id as user_id,
        u.username,
        u.avatar,
        u.role,
        b.id as board_id,
        b.name as board_name,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      INNER JOIN users u ON p.user_id = u.id
      INNER JOIN boards b ON p.board_id = b.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    return await query(sql, [limit, offset]);
  }

  // Actualizar post
  static async update(id, postData) {
    const { title, content, image } = postData;
    
    const sql = `
      UPDATE posts
      SET title = COALESCE(?, title),
          content = COALESCE(?, content),
          image = COALESCE(?, image),
          updated_at = NOW()
      WHERE id = ?
    `;
    
    await query(sql, [title, content, image, id]);
    return await this.findById(id);
  }

  // Eliminar post
  static async delete(id) {
    const sql = `DELETE FROM posts WHERE id = ?`;
    await query(sql, [id]);
  }

  // Incrementar vistas
  static async incrementViews(id) {
    const sql = `
      UPDATE posts
      SET views = views + 1
      WHERE id = ?
    `;
    
    await query(sql, [id]);
  }

  // Obtener posts por usuario
  static async findByUser(userId, limit = 50, offset = 0) {
    const sql = `
      SELECT 
        p.id,
        p.title,
        p.content,
        p.image,
        p.views,
        p.created_at,
        b.name as board_name,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      INNER JOIN boards b ON p.board_id = b.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    return await query(sql, [userId, limit, offset]);
  }

  // Buscar posts por término
  static async search(searchTerm, limit = 20) {
    const sql = `
      SELECT 
        p.id,
        p.title,
        p.content,
        p.created_at,
        u.username,
        b.name as board_name
      FROM posts p
      INNER JOIN users u ON p.user_id = u.id
      INNER JOIN boards b ON p.board_id = b.id
      WHERE p.title LIKE ? OR p.content LIKE ?
      ORDER BY p.created_at DESC
      LIMIT ?
    `;
    
    const term = `%${searchTerm}%`;
    return await query(sql, [term, term, limit]);
  }

  // Obtener comentarios de un post
  static async getComments(postId) {
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

module.exports = Post;