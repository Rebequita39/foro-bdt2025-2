const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const { authenticateToken } = require('../middleware/auth');

// Rutas públicas
router.get('/', postController.getAllPosts);
router.get('/search', postController.searchPosts);
router.get('/:id', postController.getPostById);
router.get('/user/:userId', postController.getUserPosts);

// Rutas protegidas (requieren autenticación)
router.post('/', 
  authenticateToken,
  postController.createPost
);

router.put('/:id', 
  authenticateToken,
  postController.updatePost
);

router.delete('/:id', 
  authenticateToken,
  postController.deletePost
);

// Rutas de comentarios
router.post('/:post_id/comments',
  authenticateToken,
  commentController.createComment
);

router.delete('/comments/:id',
  authenticateToken,
  commentController.deleteComment
);

module.exports = router;