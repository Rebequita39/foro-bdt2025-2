const Post = require('../models/Post');
const Board = require('../models/Board');

// Función para validar URL de imagen
const isValidImageUrl = (url) => {
  if (!url) return true; // URL vacía es válida
  
  try {
    const urlObj = new URL(url);
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const pathname = urlObj.pathname.toLowerCase();
    
    return validExtensions.some(ext => pathname.endsWith(ext)) || 
           pathname.includes('/images/') ||
           urlObj.hostname.includes('imgur.com') ||
           urlObj.hostname.includes('i.redd.it') ||
           urlObj.hostname.includes('media.giphy.com') ||
           urlObj.hostname.includes('tenor.com') ||
           urlObj.hostname.includes('pinimg.com') ||
           urlObj.hostname.includes('discordapp.com') ||
           urlObj.hostname.includes('discordapp.net');
  } catch (e) {
    return false;
  }
};

// Obtener todos los posts
const getAllPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const posts = await Post.findAll(limit, offset);

    res.json({
      success: true,
      posts,
      pagination: {
        limit,
        offset,
        count: posts.length
      }
    });
  } catch (error) {
    console.error('Error al obtener posts:', error);
    res.status(500).json({ 
      error: 'Error al obtener posts.' 
    });
  }
};

// Obtener post por ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ 
        error: 'Post no encontrado.' 
      });
    }

    // Incrementar vistas
    await Post.incrementViews(id);

    // Obtener comentarios
    const comments = await Post.getComments(id);

    res.json({
      success: true,
      post: {
        ...post,
        views: post.views + 1
      },
      comments
    });

  } catch (error) {
    console.error('Error al obtener post:', error);
    res.status(500).json({ 
      error: 'Error al obtener post.' 
    });
  }
};

// Crear nuevo post
const createPost = async (req, res) => {
  try {
    const { title, content, board_id, image_url } = req.body;
    const user_id = req.user.id;

    // Validaciones
    if (!title || !content || !board_id) {
      return res.status(400).json({ 
        error: 'Título, contenido y board son requeridos.' 
      });
    }

    if (title.length < 3 || title.length > 200) {
      return res.status(400).json({ 
        error: 'El título debe tener entre 3 y 200 caracteres.' 
      });
    }

    if (content.length < 10) {
      return res.status(400).json({ 
        error: 'El contenido debe tener al menos 10 caracteres.' 
      });
    }

    // Validar URL de imagen si se proporcionó
    if (image_url && !isValidImageUrl(image_url)) {
      return res.status(400).json({ 
        error: 'La URL de imagen no es válida. Debe ser una URL directa a una imagen (jpg, png, gif, webp).' 
      });
    }

    // Verificar que el board existe
    const board = await Board.findById(board_id);
    if (!board) {
      return res.status(404).json({ 
        error: 'Board no encontrado.' 
      });
    }

    // Crear post
    const postId = await Post.create({
      title,
      content,
      user_id,
      board_id,
      image_url: image_url || null
    });

    const newPost = await Post.findById(postId);

    res.status(201).json({
      success: true,
      message: 'Post creado exitosamente.',
      post: newPost
    });

  } catch (error) {
    console.error('Error al crear post:', error);
    res.status(500).json({ 
      error: 'Error al crear post.' 
    });
  }
};

// Actualizar post
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, image_url } = req.body;
    const user_id = req.user.id;

    // Verificar que el post existe
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ 
        error: 'Post no encontrado.' 
      });
    }

    // Verificar permisos (dueño del post o admin/moderator)
    const isOwner = post.user_id === user_id;
    const isAdminOrMod = ['admin', 'moderator'].includes(req.user.role);

    if (!isOwner && !isAdminOrMod) {
      return res.status(403).json({ 
        error: 'No tienes permisos para editar este post.' 
      });
    }

    // Validaciones
    if (title && (title.length < 3 || title.length > 200)) {
      return res.status(400).json({ 
        error: 'El título debe tener entre 3 y 200 caracteres.' 
      });
    }

    if (content && content.length < 10) {
      return res.status(400).json({ 
        error: 'El contenido debe tener al menos 10 caracteres.' 
      });
    }

    // Validar URL de imagen si se proporcionó
    if (image_url && !isValidImageUrl(image_url)) {
      return res.status(400).json({ 
        error: 'La URL de imagen no es válida. Debe ser una URL directa a una imagen.' 
      });
    }

    // Actualizar post
    const updatedPost = await Post.update(id, {
      title,
      content,
      image_url: image_url !== undefined ? image_url : post.image
    });

    res.json({
      success: true,
      message: 'Post actualizado exitosamente.',
      post: updatedPost
    });

  } catch (error) {
    console.error('Error al actualizar post:', error);
    res.status(500).json({ 
      error: 'Error al actualizar post.' 
    });
  }
};

// Eliminar post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Verificar que el post existe
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ 
        error: 'Post no encontrado.' 
      });
    }

    // Verificar permisos
    const isOwner = post.user_id === user_id;
    const isAdminOrMod = ['admin', 'moderator'].includes(req.user.role);

    if (!isOwner && !isAdminOrMod) {
      return res.status(403).json({ 
        error: 'No tienes permisos para eliminar este post.' 
      });
    }

    // Eliminar post (las URLs externas no necesitan ser eliminadas)
    await Post.delete(id);

    res.json({
      success: true,
      message: 'Post eliminado exitosamente.'
    });

  } catch (error) {
    console.error('Error al eliminar post:', error);
    res.status(500).json({ 
      error: 'Error al eliminar post.' 
    });
  }
};

// Buscar posts
const searchPosts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ 
        error: 'El término de búsqueda debe tener al menos 2 caracteres.' 
      });
    }

    const posts = await Post.search(q);

    res.json({
      success: true,
      query: q,
      posts,
      count: posts.length
    });

  } catch (error) {
    console.error('Error al buscar posts:', error);
    res.status(500).json({ 
      error: 'Error al buscar posts.' 
    });
  }
};

// Obtener posts de un usuario
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const posts = await Post.findByUser(userId, limit, offset);

    res.json({
      success: true,
      user_id: userId,
      posts,
      pagination: {
        limit,
        offset,
        count: posts.length
      }
    });

  } catch (error) {
    console.error('Error al obtener posts del usuario:', error);
    res.status(500).json({ 
      error: 'Error al obtener posts del usuario.' 
    });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  searchPosts,
  getUserPosts
};