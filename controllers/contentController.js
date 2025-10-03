const Content = require('../models/Content');

class ContentController {
    constructor() {
        this.contentModel = new Content();
    }

    async getContent(req, res) {
        try {
            const content = await this.contentModel.getContent();
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

            const updatedContent = await this.contentModel.updateLikes(id, increment);
            
            if (!updatedContent) {
                return res.status(404).json({ error: 'Content not found' });
            }

            console.log(`Content ${increment ? 'liked' : 'unliked'}: ${updatedContent.title} (${updatedContent.likes} likes)`);

            res.json({ 
                message: 'Like updated successfully',
                content: updatedContent
            });

        } catch (error) {
            console.error('Like content error:', error);
            res.status(500).json({ error: 'Failed to update like' });
        }
    }
}

module.exports = new ContentController();