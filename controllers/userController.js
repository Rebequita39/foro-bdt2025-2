const User = require('../models/User');

// Obtener todos los usuarios (con paginación)
const getAllUsers = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(parseInt(req.query.limit, 10) || 50, 100));
    const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);

    const users = await User.findAll(limit, offset);

    res.json({
      success: true,
      users,
      pagination: {
        limit,
        offset,
        count: users.length
      }
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ 
      error: 'Error al obtener usuarios.' 
    });
  }
};

// Obtener usuario por ID (perfil público)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado.' 
      });
    }

    // Obtener estadísticas del usuario
    const stats = await User.getUserStats(id);

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
        bio: user.bio,
        created_at: user.created_at
      },
      stats
    });

  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ 
      error: 'Error al obtener usuario.' 
    });
  }
};

// Buscar usuarios por término
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ 
        error: 'El término de búsqueda debe tener al menos 2 caracteres.' 
      });
    }

    const users = await User.search(q.trim());

    res.json({
      success: true,
      query: q,
      users,
      count: users.length
    });

  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    res.status(500).json({ 
      error: 'Error al buscar usuarios.' 
    });
  }
};

// Obtener usuarios con más posts (leaderboard)
const getTopUsers = async (req, res) => {
  try {
    const users = await User.getUsersWithPostCount();

    res.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Error al obtener top usuarios:', error);
    res.status(500).json({ 
      error: 'Error al obtener usuarios destacados.' 
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  searchUsers,
  getTopUsers
};