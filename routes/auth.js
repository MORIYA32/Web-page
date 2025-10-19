const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

function requireAuth(req, res, next) {
  if (!req.session?.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}


router.post('/register', authController.register.bind(authController));

router.post('/login', authController.login.bind(authController));

router.post('/logout', authController.logout.bind(authController));

router.get('/whoami', authController.whoami.bind(authController));

router.delete('/user', requireAuth, authController.deleteUser.bind(authController));

module.exports = router;
