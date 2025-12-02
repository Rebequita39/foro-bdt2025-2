const { query, transaction } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  // Crear nuevo usuario
  static async create(userData) {
    const { username, email, password, role = 'user' } = userData;
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const sql = `
      INSERT INTO users (username, email, password, role, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    
    const result = await query(sql, [username, email, hashedPassword, role]);
    return result.insertId;
  }

  // Buscar usuario por ID
  static async findById(id) {
    const sql = `
      SELECT id, username, email, avatar, role, bio, created_at
      FROM users
      WHERE id = ?
    `;
    
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  // Buscar usuario por email
  static async findByEmail(email) {
    const sql = `
      SELECT id, username, email, password, avatar, role, bio, created_at
      FROM users
      WHERE email = ?
    `;
    
    const results = await query(sql, [email]);
    return results[0] || null;
  }

  // Buscar usuario por username
  static async findByUsername(username) {
    const sql = `
      SELECT id, username, email, password, avatar, role, bio, created_at
      FROM users
      WHERE username = ?
    `;
    
    const results = await query(sql, [username]);
    return results[0] || null;
  }

  // Obtener todos los usuarios (con paginación)
  static async findAll(limit = 50, offset = 0) {
    const sql = `
      SELECT id, username, email, avatar, role, bio, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    return await query(sql, [limit, offset]);
  }

  // Actualizar perfil de usuario
  static async update(id, userData) {
    const { username, email, avatar, bio } = userData;
    
    // Construir query dinámicamente solo con campos proporcionados
    const updates = [];
    const values = [];
    
    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(avatar);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }
    
    if (updates.length === 0) {
      return await this.findById(id);
    }
    
    values.push(id);
    
    const sql = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = ?
    `;
    
    await query(sql, values);
    return await this.findById(id);
  }

  // Actualizar contraseña
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const sql = `
      UPDATE users
      SET password = ?
      WHERE id = ?
    `;
    
    await query(sql, [hashedPassword, id]);
  }

  // Actualizar rol (solo admin)
  static async updateRole(id, role) {
    const sql = `
      UPDATE users
      SET role = ?
      WHERE id = ?
    `;
    
    await query(sql, [role, id]);
  }

  // Eliminar usuario
  static async delete(id) {
    const sql = `DELETE FROM users WHERE id = ?`;
    await query(sql, [id]);
  }

  // Verificar contraseña
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Consulta avanzada: Usuarios con más posts
  static async getUsersWithPostCount() {
    const sql = `
      SELECT 
        u.id,
        u.username,
        u.avatar,
        u.role,
        COUNT(p.id) as post_count,
        MAX(p.created_at) as last_post_date
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      GROUP BY u.id, u.username, u.avatar, u.role
      ORDER BY post_count DESC
      LIMIT 10
    `;
    
    return await query(sql);
  }

  // Consulta avanzada: Buscar usuarios por término
  static async search(searchTerm) {
    const sql = `
      SELECT id, username, email, avatar, role, bio
      FROM users
      WHERE username LIKE ? OR email LIKE ?
      LIMIT 20
    `;
    
    const term = `%${searchTerm}%`;
    return await query(sql, [term, term]);
  }

  // Vista: Estadísticas de usuario
  static async getUserStats(userId) {
    const sql = `
      SELECT 
        u.username,
        u.created_at as member_since,
        COUNT(DISTINCT p.id) as total_posts,
        COUNT(DISTINCT c.id) as total_comments,
        COUNT(DISTINCT p.board_id) as boards_participated
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      LEFT JOIN comments c ON u.id = c.user_id
      WHERE u.id = ?
      GROUP BY u.id, u.username, u.created_at
    `;
    
    const results = await query(sql, [userId]);
    return results[0] || null;
  }

  // Verificar si el username o email ya existen
  static async checkExists(username, email) {
    const sql = `
      SELECT 
        CASE WHEN username = ? THEN 'username' 
             WHEN email = ? THEN 'email' 
        END as field_exists
      FROM users
      WHERE username = ? OR email = ?
      LIMIT 1
    `;
    
    const results = await query(sql, [username, email, username, email]);
    return results[0] || null;
  }
}

module.exports = User;