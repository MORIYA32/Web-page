const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

// GET /api/content
router.get('/', contentController.getContent.bind(contentController));

// POST /api/content/:id/like
router.post('/:id/like', contentController.likeContent.bind(contentController));

// GET /api/content/:id/ratings
router.get('/:id/ratings', contentController.getRatings.bind(contentController));

module.exports = router;