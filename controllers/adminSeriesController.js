const Content = require('../models/Content');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;

function sanitizeFilename(str) {
  return String(str || '')
    .replace(/[^a-z0-9_\-\.]+/gi, '_')
    .toLowerCase();
}

class AdminSeriesController {
  async uploadSeries(req, res) {
    try {
      const {
        title = '',
        year = '',
        genres = '',
        cast = '',
        director = '',
        description = '',
        imdbId = '',
        seasonNumber = '1',
        episodeTitles = ''
      } = req.body || {};

      if (!title || !year) {
        return res.status(400).json({ error: 'title and year are required' });
      }

      const posterFile   = req.files?.poster?.[0]   || null;
      const episodeFiles = req.files?.episodes || [];

      if (!posterFile) {
        return res.status(400).json({ error: 'Poster image is required' });
      }
      if (episodeFiles.length === 0) {
        return res.status(400).json({ error: 'At least one episode MP4 is required' });
      }
      if (episodeFiles.length > 3) {
        return res.status(400).json({ error: 'Up to 3 episodes are allowed per upload' });
      }

      const maxBytes = Number(process.env.MAX_EPISODE_MB || 20) * 1024 * 1024;
      for (const ep of episodeFiles) {
        if (ep.mimetype !== 'video/mp4') {
          return res.status(400).json({ error: `Episode "${ep.originalname}" must be an MP4` });
        }
        if (ep.size > maxBytes) {
          return res.status(413).json({
            error: `Episode "${ep.originalname}" exceeds ${Math.floor(maxBytes / 1024 / 1024)}MB`
          });
        }
      }

      const picturesDir = path.resolve(__dirname, '..', 'views', 'pictures');
      const videosDir   = path.resolve(__dirname, '..', 'views', 'videos');
      await fsp.mkdir(picturesDir, { recursive: true });
      await fsp.mkdir(videosDir,   { recursive: true });

      const base = sanitizeFilename(`${title}-${Date.now()}`);

      const posterExt  = path.extname(posterFile.originalname || '.jpg') || '.jpg';
      const posterName = `${base}${posterExt}`;
      const posterAbs  = path.join(picturesDir, posterName);
      await fsp.writeFile(posterAbs, posterFile.buffer);
      const thumbnail  = `/${path.join('pictures', posterName).replace(/\\/g, '/')}`;

      let titlesArr = [];
      if (Array.isArray(episodeTitles)) {
        titlesArr = episodeTitles;
      } else if (typeof episodeTitles === 'string' && episodeTitles.trim()) {
        try {
          if (episodeTitles.trim().startsWith('[')) {
            titlesArr = JSON.parse(episodeTitles);
          } else {
            titlesArr = episodeTitles.split(',').map(s => s.trim());
          }
        } catch {
          titlesArr = [];
        }
      }

      const seasonNum   = Number(seasonNumber) || 1;
      const episodesOut = [];
      let idx = 0;

      for (const ep of episodeFiles) {
        idx += 1;
        const epBase    = `${base}-s${seasonNum}-e${idx}`;
        const videoExt  = path.extname(ep.originalname || '.mp4') || '.mp4';
        const videoName = `${epBase}${videoExt}`;
        const videoAbs  = path.join(videosDir, videoName);
        await fsp.writeFile(videoAbs, ep.buffer);
        const videoUrl  = `/${path.join('videos', videoName).replace(/\\/g, '/')}`;

        episodesOut.push({
          episodeNumber: idx,
          episodeTitle: titlesArr[idx - 1] || `Episode ${idx}`,
          videoUrl
        });
      }

      const genre  = String(genres || '').split(',').map(s => s.trim()).filter(Boolean);
      const actors = String(cast   || '').split(',').map(s => s.trim()).filter(Boolean);

      const last   = await Content.findOne().sort({ id: -1 }).select('id').lean();
      const nextId = (last?.id || 0) + 1;

      const doc = await Content.create({
        id: nextId,
        type: 'series',
        title: String(title).trim(),
        year: Number(year),
        genre,
        actors,
        thumbnail,
        trailerUrl: null,
        videoUrl: null,
        seasons: [
          {
            seasonNumber: seasonNum,
            episodes: episodesOut
          }
        ],
        likes: 0,
        likedBy: [],
        imdbId: imdbId ? String(imdbId).trim() : undefined,
        description: String(description || '').trim() + (director ? `\nDirector: ${director}` : '')
      });

      return res.status(201).json({ content: doc });
    } catch (err) {
      console.error('uploadSeries error:', err);
      return res.status(500).json({ error: 'Failed to create series' });
    }
  }
}

module.exports = new AdminSeriesController();
