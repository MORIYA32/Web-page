const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, try again soon' }
});

const registerLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/register', registerLimiter, authController.register.bind(authController));
router.post('/login', loginLimiter, authController.login.bind(authController));
router.get('/whoami', authController.whoami.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.delete('/user', authenticate, authController.deleteUser.bind(authController));

module.exports = router;
