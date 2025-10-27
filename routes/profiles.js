const express = require('express');
const router = express.Router();
const { profileController } = require('../controllers/profileController');

// GET /api/profiles
router.get('/', profileController.getProfiles.bind(profileController));

// POST /api/profiles
router.post('/', profileController.createProfile.bind(profileController));

// PUT /api/profiles/:profileId
router.put('/:profileId', profileController.updateProfile.bind(profileController));

// DELETE /api/profiles/:profileId
router.delete('/:profileId', profileController.deleteProfile.bind(profileController));

module.exports = router;