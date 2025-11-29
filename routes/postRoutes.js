const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateToken } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// Rutas públicas
router.get('/', postController.getAllPosts);
router.get('/search', postController.searchPosts);
router.get('/:id', postController.getPostById);
router.get('/user/:userId', postController.getUserPosts);

// Rutas protegidas (requieren autenticación)
router.post('/', 
  authenticateToken,
  uploadSingle('image'),
  postController.createPost
);

router.put('/:id', 
  authenticateToken,
  uploadSingle('image'),
  postController.updatePost
);

router.delete('/:id', 
  authenticateToken,
  postController.deletePost
);

module.exports = router;