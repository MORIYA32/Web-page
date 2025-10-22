const express = require('express');
const multer = require('multer');
const { authenticate, requireAdmin } = require('../middleware/auth');
const adminSeries = require('../controllers/adminSeriesController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.MAX_EPISODE_MB || 20) * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'episodes') {
      if (file.mimetype !== 'video/mp4') {
        return cb(new Error('Episodes must be MP4 files'));
      }
    }
    if (file.fieldname === 'poster') {
      if (!/^image\/(png|jpe?g|webp)$/i.test(file.mimetype)) {
        return cb(new Error('Poster must be an image (jpg/png/webp)'));
      }
    }
    cb(null, true);
  }
});

router.post(
  '/series',
  authenticate,
  requireAdmin,
  upload.fields([
    { name: 'episodes', maxCount: 3 },   
    { name: 'poster',   maxCount: 1 }
  ]),
  adminSeries.uploadSeries
);

module.exports = router;
