const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
});

//  auth middlewares to protect admin-only creation
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /api/content/user-likes
router.get('/user-likes', contentController.getUserLikes.bind(contentController));

router.post(
  '/',
  authenticate,                       
  requireAdmin,                       
  upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'video', maxCount: 1 }]),
  contentController.createContent.bind(contentController)
);

// GET /api/content
router.get('/', contentController.getContent.bind(contentController));

// POST /api/content/:id/like
router.post('/:id/like', contentController.likeContent.bind(contentController));

// GET /api/content/:id/ratings
router.get('/:id/ratings', contentController.getRatings.bind(contentController));

module.exports = router;
