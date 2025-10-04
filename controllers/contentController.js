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
}

module.exports = new ContentController();