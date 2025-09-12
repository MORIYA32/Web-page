const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// GET /api/profiles
router.get('/', profileController.getProfiles.bind(profileController));

// POST /api/profiles
router.post('/', profileController.createProfile.bind(profileController));

module.exports = router;