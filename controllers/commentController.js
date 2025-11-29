const Comment = require('../models/Comment');
const Post = require('../models/Post');

// Crear comentario
const createComment = async (req, res) => {
  try {
    const { post_id } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;

    // Validaciones
    if (!content || content.trim().length < 3) {
      return res.status(400).json({ 
        error: 'El comentario debe tener al menos 3 caracteres.' 
      });
    }

    // Verificar que el post existe
    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(404).json({ 
        error: 'Publicación no encontrada.' 
      });
    }

    // Crear comentario
    const commentId = await Comment.create({
      content: content.trim(),
      post_id,
      user_id
    });

    const newComment = await Comment.findById(commentId);

    res.status(201).json({
      success: true,
      message: 'Comentario creado exitosamente.',
      comment: newComment
    });

  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({ 
      error: 'Error al crear comentario.' 
    });
  }
};

// Eliminar comentario
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Verificar que el comentario existe
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ 
        error: 'Comentario no encontrado.' 
      });
    }

    // Verificar permisos
    const isOwner = comment.user_id === user_id;
    const isAdminOrMod = ['admin', 'moderator'].includes(req.user.role);

    if (!isOwner && !isAdminOrMod) {
      return res.status(403).json({ 
        error: 'No tienes permisos para eliminar este comentario.' 
      });
    }

    // Eliminar comentario
    await Comment.delete(id);

    res.json({
      success: true,
      message: 'Comentario eliminado exitosamente.'
    });

  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    res.status(500).json({ 
      error: 'Error al eliminar comentario.' 
    });
  }
};

module.exports = {
  createComment,
  deleteComment
};