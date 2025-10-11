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

            console.log(`Content ${increment ? 'liked' : 'unliked'}: ${content.title} (${content.likes} likes)`);

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
            const content = await Content.findById(id);
            
            if (!content) {
                return res.status(404).json({ error: 'Content not found' });
            }

            if (!content.imdbId) {
                return res.json({ ratings: null });
            }

            const omdbApiKey = process.env.OMDB_API_KEY;
            const response = await fetch(`http://www.omdbapi.com/?i=${content.imdbId}&apikey=${omdbApiKey}`);
            const data = await response.json();

            if (data.Response === 'False') {
                return res.json({ ratings: null });
            }

            const ratings = {
                imdb: data.imdbRating !== 'N/A' ? data.imdbRating : null,
                rottenTomatoes: null
            };

            if (data.Ratings && Array.isArray(data.Ratings)) {
                const rtRating = data.Ratings.find(r => r.Source === 'Rotten Tomatoes');
                if (rtRating) {
                    ratings.rottenTomatoes = rtRating.Value;
                }
            }

            res.json({ ratings });

        } catch (error) {
            console.error('Get ratings error:', error);
            res.status(500).json({ error: 'Failed to fetch ratings' });
        }
    }
}

module.exports = new ContentController();