const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Rutas públicas
router.get('/', boardController.getAllBoards);
router.get('/:id', boardController.getBoardById);
router.get('/:id/posts', boardController.getBoardPosts);

// Rutas protegidas (solo admin y moderator)
router.post('/', 
  authenticateToken, 
  authorizeRole('admin', 'moderator'),
  boardController.createBoard
);

router.put('/:id', 
  authenticateToken, 
  authorizeRole('admin', 'moderator'),
  boardController.updateBoard
);

router.delete('/:id', 
  authenticateToken, 
  authorizeRole('admin'),
  boardController.deleteBoard
);

module.exports = router;