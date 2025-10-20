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
            const { userId } = req.body;
            
            if (!userId) {
                return res.status(400).json({ error: 'userId is required' });
            }
            
            const content = await Content.findById(id);
            
            if (!content) {
                return res.status(404).json({ error: 'Content not found' });
            }
            
            // Initialize likedBy array if it doesn't exist
            if (!content.likedBy) {
                content.likedBy = [];
            }
            
            const hasLiked = content.likedBy.includes(userId);
            
            if (hasLiked) {
                // Unlike: remove user from likedBy array
                content.likedBy = content.likedBy.filter(uid => uid !== userId);
                content.likes = Math.max(0, content.likes - 1);
            } else {
                // Like: add user to likedBy array
                content.likedBy.push(userId);
                content.likes += 1;
            }
            
            await content.save();
            
            console.log(`Content ${!hasLiked ? 'liked' : 'unliked'}: ${content.title} (${content.likes} likes)`);
            
            res.json({ 
                message: 'Like updated successfully',
                likes: content.likes,
                userHasLiked: !hasLiked
            });
        } catch (error) {
            console.error('Error updating like:', error);
            res.status(500).json({ error: 'Failed to update like' });
        }
    }

    async getUserLikes(req, res) {
        try {
            const { userId } = req.query;
            
            if (!userId) {
                return res.status(400).json({ error: 'userId is required' });
            }
            
            const likedContent = await Content.find({ 
                likedBy: userId 
            }).select('_id');
            
            const likedIds = likedContent.map(content => content._id.toString());
            
            res.json({ likedIds });
        } catch (error) {
            console.error('Error fetching user likes:', error);
            res.status(500).json({ error: 'Server error' });
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