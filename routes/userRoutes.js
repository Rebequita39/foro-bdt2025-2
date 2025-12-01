const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rutas públicas - no requieren autenticación
router.get('/', userController.getAllUsers);
router.get('/search', userController.searchUsers);
router.get('/top', userController.getTopUsers);
router.get('/:id', userController.getUserById);

module.exports = router;