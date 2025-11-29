const Board = require('../models/Board');

// Obtener todos los boards
const getAllBoards = async (req, res) => {
  try {
    const boards = await Board.findAll();
    
    res.json({
      success: true,
      boards
    });
  } catch (error) {
    console.error('Error al obtener boards:', error);
    res.status(500).json({ 
      error: 'Error al obtener boards.' 
    });
  }
};

// Obtener board por ID
const getBoardById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const board = await Board.findById(id);
    
    if (!board) {
      return res.status(404).json({ 
        error: 'Board no encontrado.' 
      });
    }
    
    res.json({
      success: true,
      board
    });
  } catch (error) {
    console.error('Error al obtener board:', error);
    res.status(500).json({ 
      error: 'Error al obtener board.' 
    });
  }
};

// Crear nuevo board (solo admin/moderator)
const createBoard = async (req, res) => {
  try {
    const { name, description } = req.body;
    const created_by = req.user.id;

    // Validaciones
    if (!name || !description) {
      return res.status(400).json({ 
        error: 'Nombre y descripción son requeridos.' 
      });
    }

    if (name.length < 3 || name.length > 100) {
      return res.status(400).json({ 
        error: 'El nombre debe tener entre 3 y 100 caracteres.' 
      });
    }

    // Crear board
    const boardId = await Board.create({
      name,
      description,
      created_by
    });

    const newBoard = await Board.findById(boardId);

    res.status(201).json({
      success: true,
      message: 'Board creado exitosamente.',
      board: newBoard
    });

  } catch (error) {
    console.error('Error al crear board:', error);
    res.status(500).json({ 
      error: 'Error al crear board.' 
    });
  }
};

// Actualizar board (solo admin/moderator)
const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Verificar que el board existe
    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).json({ 
        error: 'Board no encontrado.' 
      });
    }

    // Validaciones
    if (name && (name.length < 3 || name.length > 100)) {
      return res.status(400).json({ 
        error: 'El nombre debe tener entre 3 y 100 caracteres.' 
      });
    }

    // Actualizar board
    const updatedBoard = await Board.update(id, {
      name,
      description
    });

    res.json({
      success: true,
      message: 'Board actualizado exitosamente.',
      board: updatedBoard
    });

  } catch (error) {
    console.error('Error al actualizar board:', error);
    res.status(500).json({ 
      error: 'Error al actualizar board.' 
    });
  }
};

// Eliminar board (solo admin)
const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el board existe
    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).json({ 
        error: 'Board no encontrado.' 
      });
    }

    // Eliminar board
    await Board.delete(id);

    res.json({
      success: true,
      message: 'Board eliminado exitosamente.'
    });

  } catch (error) {
    console.error('Error al eliminar board:', error);
    res.status(500).json({ 
      error: 'Error al eliminar board.' 
    });
  }
};

// Obtener posts de un board
const getBoardPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    // Verificar que el board existe
    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).json({ 
        error: 'Board no encontrado.' 
      });
    }

    // Obtener posts del board
    const posts = await Board.getPosts(id, limit, offset);

    res.json({
      success: true,
      board: {
        id: board.id,
        name: board.name,
        description: board.description
      },
      posts,
      pagination: {
        limit,
        offset,
        count: posts.length
      }
    });

  } catch (error) {
    console.error('Error al obtener posts del board:', error);
    res.status(500).json({ 
      error: 'Error al obtener posts del board.' 
    });
  }
};

module.exports = {
  getAllBoards,
  getBoardById,
  createBoard,
  updateBoard,
  deleteBoard,
  getBoardPosts
};