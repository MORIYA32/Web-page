const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const axios = require('axios');
const Content = require('../models/Content');
const Submission = require('../models/Submission'); 

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session?.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session?.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden (admin only)' });
  }
  next();
}

let _bucket = null;
function getBucket() {
  if (!_bucket) {
    if (!mongoose.connection?.db) throw new Error('Mongo connection not ready');
    _bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: process.env.GRIDFS_BUCKET || 'uploads',
    });
  }
  return _bucket;
}
function saveBufferToGridFS(buffer, filename, contentType, metadata = {}) {
  return new Promise((resolve, reject) => {
    const bucket = getBucket();
    const up = bucket.openUploadStream(filename, { contentType, metadata });

    up.once('finish', () => resolve(up.id));
    up.once('error', reject);

    up.end(buffer);
  });
}


const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB || 200);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 },
});

async function fetchRatings({ title, year, imdbId }) {
  const key = process.env.OMDB_API_KEY;
  if (!key) return { imdb: null, rottenTomatoes: null };

  const params = { apikey: key };
  if (imdbId) params.i = String(imdbId).trim();
  else {
    params.t = String(title).trim();
    if (year) params.y = String(year);
  }

  try {
    const { data } = await axios.get('https://www.omdbapi.com/', { params });
    if (!data || data.Response === 'False') return { imdb: null, rottenTomatoes: null };

    let imdb = null;
    let rt = null;

    if (data.imdbRating && !isNaN(Number(data.imdbRating))) {
      imdb = Number(data.imdbRating);
    }
    if (Array.isArray(data.Ratings)) {
      const r = data.Ratings.find((r) => (r.Source || '').includes('Rotten'));
      if (r && typeof r.Value === 'string' && r.Value.endsWith('%')) {
        const num = Number(r.Value.replace('%', ''));
        if (!isNaN(num)) rt = num;
      }
    }
    return { imdb, rottenTomatoes: rt };
  } catch {
    return { imdb: null, rottenTomatoes: null };
  }
}

function csvToArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
  return String(val).split(',').map((s) => s.trim()).filter(Boolean);
}


router.post(
  '/content',
  requireAuth,
  requireAdmin,
  upload.fields([
    { name: 'poster', maxCount: 1 },
    { name: 'video',  maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        type = 'movie',
        year,
        genres,
        director,
        cast,
        description,
        imdbId,
        videoUrl,
      } = req.body || {};

      if (!title || !String(title).trim()) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const contentType = String(type) === 'series' ? 'series' : 'movie';
      const yearNum  = year ? Number(year) : undefined;
      const genresArr = csvToArray(genres);
      const castArr   = csvToArray(cast);

      // ==== GridFS ====
      let posterFileId = null;
      let videoFileId  = null;

      if (req.files?.poster?.[0]) {
        const p = req.files.poster[0];
        posterFileId = await saveBufferToGridFS(p.buffer, p.originalname, p.mimetype, { kind: 'poster' });
      }
      if (req.files?.video?.[0]) {
        const v = req.files.video[0];
        videoFileId = await saveBufferToGridFS(v.buffer, v.originalname, v.mimetype, { kind: 'video' });
      }

      if (contentType === 'movie' && !videoFileId && !videoUrl) {
        return res.status(400).json({ error: 'Movie requires either a video file or a videoUrl' });
      }

      // ==== Ratings ====
      const ratings = await fetchRatings({ title, year: yearNum, imdbId });

      // ==== Content doc ====
      const docData = {
        type: contentType,
        title: String(title).trim(),
        year: yearNum,
        genres: genresArr,
        director: director ? String(director).trim() : undefined,
        actors: castArr,
        description: description ? String(description).trim() : undefined,
        posterFileId: posterFileId || undefined,
        videoFileId:  videoFileId  || undefined,
        imdbId: imdbId ? String(imdbId).trim() : undefined,
        ratings,
        genre: genresArr,
        thumbnail: posterFileId ? `/api/files/${posterFileId}` : undefined,
        videoUrl:  videoFileId ? `/api/stream/video/${videoFileId}` : (videoUrl ? String(videoUrl).trim() : undefined),
        createdBy: req.session?.user?.id,
      };

      const created = await Content.create(docData);

      let submissionId = null;
      try {
        const sub = await Submission.create({
          status: 'published',
          submittedBy: req.session?.user?.id || null,
          contentId: created._id,
          payload: docData,
          client: { ip: req.ip, ua: req.headers['user-agent'] }
        });
        submissionId = sub._id;
      } catch (e) {
        console.warn('Submission archive failed:', e?.message || e);
      }

      return res.status(201).json({ ok: true, content: created.toJSON(), submissionId });
    } catch (err) {
      console.error('Admin add content error:', err);
      return res.status(500).json({ error: 'Failed to add content' });
    }
  }
);

module.exports = router;
