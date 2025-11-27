const { query } = require('../config/database');

class Board {
  // Crear board
  static async create(boardData) {
    const { name, description, created_by } = boardData;
    
    const sql = `
      INSERT INTO boards (name, description, created_by, created_at)
      VALUES (?, ?, ?, NOW())
    `;
    
    const result = await query(sql, [name, description, created_by]);
    return result.insertId;
  }

  // Obtener board por ID
  static async findById(id) {
    const sql = `
      SELECT b.*, u.username as creator_username
      FROM boards b
      LEFT JOIN users u ON b.created_by = u.id
      WHERE b.id = ?
    `;
    
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  // Obtener todos los boards con conteo de posts
  static async findAll() {
    const sql = `
      SELECT 
        b.id,
        b.name,
        b.description,
        b.created_at,
        u.username as creator_username,
        COUNT(p.id) as post_count,
        MAX(p.created_at) as last_post_date
      FROM boards b
      LEFT JOIN users u ON b.created_by = u.id
      LEFT JOIN posts p ON b.id = p.board_id
      GROUP BY b.id, b.name, b.description, b.created_at, u.username
      ORDER BY b.created_at DESC
    `;
    
    return await query(sql);
  }

  // Actualizar board
  static async update(id, boardData) {
    const { name, description } = boardData;
    
    const sql = `
      UPDATE boards
      SET name = COALESCE(?, name),
          description = COALESCE(?, description)
      WHERE id = ?
    `;
    
    await query(sql, [name, description, id]);
    return await this.findById(id);
  }

  // Eliminar board
  static async delete(id) {
    const sql = `DELETE FROM boards WHERE id = ?`;
    await query(sql, [id]);
  }

  // Obtener posts de un board
  static async getPosts(boardId, limit = 50, offset = 0) {
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
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      INNER JOIN users u ON p.user_id = u.id
      WHERE p.board_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    return await query(sql, [boardId, limit, offset]);
  }
}

module.exports = Board;