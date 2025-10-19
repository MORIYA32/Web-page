const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.get('/', profileController.getProfiles.bind(profileController));

router.post('/', profileController.createProfile.bind(profileController));

router.put('/:profileId', profileController.updateProfile.bind(profileController));

router.delete('/:profileId', profileController.deleteProfile.bind(profileController));

module.exports = router;