const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

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

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function pickContentType(file, fallback = 'application/octet-stream') {
  if (file?.contentType) return file.contentType;
  const name = (file?.filename || '').toLowerCase();
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.webp')) return 'image/webp';
  if (name.endsWith('.gif')) return 'image/gif';
  if (name.endsWith('.mp4')) return 'video/mp4';
  return fallback;
}

router.get('/files/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid file id' });

    const _id = new mongoose.Types.ObjectId(id);
    const bucket = getBucket();

    const file = await bucket.find({ _id }).next();
    if (!file) return res.status(404).json({ error: 'File not found' });

    const ctype = pickContentType(file, 'application/octet-stream');
    res.set({
      'Content-Type': ctype,
      'Content-Length': file.length,
      'Last-Modified': file.uploadDate?.toUTCString?.() || new Date().toUTCString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Accept-Ranges': 'bytes',
      ...(req.query.dl ? { 'Content-Disposition': `attachment; filename="${encodeURIComponent(file.filename || 'file')}"` } : {})
    });

    const dl = bucket.openDownloadStream(_id);
    dl.on('error', (e) => {
      console.error('GridFS download error:', e?.message || e);
      if (!res.headersSent) res.status(500).json({ error: 'Stream failed' });
      else res.end();
    });
    dl.pipe(res);
  } catch (err) {
    console.error('GET /api/files/:id error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

router.get('/stream/video/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid video id' });

    const _id = new mongoose.Types.ObjectId(id);
    const bucket = getBucket();

    const file = await bucket.find({ _id }).next();
    if (!file) return res.status(404).json({ error: 'Video not found' });

    const total = file.length;
    const range = req.headers.range;
    const contentType = pickContentType(file, 'video/mp4');

    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!m) return res.status(416).set('Content-Range', `bytes */${total}`).end();

      let start = m[1] ? parseInt(m[1], 10) : 0;
      let end = m[2] ? parseInt(m[2], 10) : total - 1;

      if (isNaN(start) || isNaN(end) || start > end || start >= total) {
        return res.status(416).set('Content-Range', `bytes */${total}`).end();
      }
      end = Math.min(end, total - 1);

      const chunkSize = (end - start) + 1;

      res.status(206).set({
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      });

      const stream = bucket.openDownloadStream(_id, { start, end: end + 1 });
      stream.on('error', (e) => {
        console.error('GridFS range stream error:', e?.message || e);
        if (!res.headersSent) res.status(500).end();
        else res.end();
      });
      stream.pipe(res);
    } else {
      res.status(200).set({
        'Content-Length': total,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
      });

      const stream = bucket.openDownloadStream(_id);
      stream.on('error', (e) => {
        console.error('GridFS full stream error:', e?.message || e);
        if (!res.headersSent) res.status(500).end();
        else res.end();
      });
      stream.pipe(res);
    }
  } catch (err) {
    console.error('GET /api/stream/video/:id error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

module.exports = router;
