const axios = require('axios');
const Content = require('../models/Content');

class ContentController {
  async getContent(req, res) {
    try {
      const content = await Content.find();
      res.json(content);
    } catch (error) {
      console.error('Get content error:', error);
      res.status(500).json({ error: 'Failed to fetch content' });
    }
  }

  async likeContent(req, res) {
    try {
      const { id } = req.params;
      const { increment = true } = req.body;

      const content = await Content.findById(id);
      if (!content) {
        return res.status(404).json({ error: 'Content not found' });
      }

      if (increment) {
        content.likes++;
      } else {
        content.likes = Math.max(0, content.likes - 1);
      }

      await content.save();

      console.log(
        `Content ${increment ? 'liked' : 'unliked'}: ${content.title} (${content.likes} likes)`
      );

      res.json({
        message: 'Like updated successfully',
        content
      });
    } catch (error) {
      console.error('Like content error:', error);
      res.status(500).json({ error: 'Failed to update like' });
    }
  }

  async getRatings(req, res) {
    try {
      const { id } = req.params;
      const doc = await Content.findById(id);
      if (!doc) {
        return res.status(404).json({ error: 'Content not found' });
      }

      if (doc.ratings && (doc.ratings.imdb != null || doc.ratings.rottenTomatoes != null)) {
        return res.json({
          ratings: {
            imdb: doc.ratings.imdb,
            rottenTomatoes: doc.ratings.rottenTomatoes,
          },
        });
      }

      const key = process.env.OMDB_API_KEY;
      if (!key) {
        return res.json({ ratings: null });
      }

      const params = { apikey: key };
      if (doc.imdbId) {
        params.i = String(doc.imdbId).trim();
      } else {
        params.t = String(doc.title).trim();
        if (doc.year) params.y = String(doc.year);
        if (doc.type) params.type = doc.type; 
      }

      const { data } = await axios.get('https://www.omdbapi.com/', { params });
      if (!data || data.Response === 'False') {
        return res.json({ ratings: null });
      }

      const imdb =
        data.imdbRating && data.imdbRating !== 'N/A' ? Number(data.imdbRating) : null;

      let rt = null;
      if (Array.isArray(data.Ratings)) {
        const entry =
          data.Ratings.find(r => r.Source === 'Rotten Tomatoes') ||
          data.Ratings.find(r => (r.Source || '').includes('Rotten'));
        if (entry?.Value?.endsWith('%')) {
          const n = Number(entry.Value.replace('%', ''));
          rt = Number.isFinite(n) ? n : null;
        }
      }

      doc.imdbId = data.imdbID || doc.imdbId || null;
      doc.ratings = {
        imdb,
        rottenTomatoes: rt,
        updatedAt: new Date(),
        sourceRaw: data || null,
      };
      await doc.save();

      return res.json({ ratings: { imdb, rottenTomatoes: rt } });
    } catch (error) {
      console.error('Get ratings error:', error);
      res.status(500).json({ error: 'Failed to fetch ratings' });
    }
  }
}

module.exports = new ContentController();
