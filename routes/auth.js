const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', authController.register.bind(authController));

// POST /api/auth/login  
router.post('/login', authController.login.bind(authController));

// DELETE /api/auth/user
router.delete('/user', authController.deleteUser.bind(authController));

module.exports = router;