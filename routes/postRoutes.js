const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
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

module.exports = router;