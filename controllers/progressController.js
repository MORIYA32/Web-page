const Progress = require('../models/Progress');

class ProgressController {
    async updateProgress(req, res) {
        const { userId, contentId, season, episode, currentTime } = req.body;

        if (!userId || !contentId || !season || !episode) return res.status(400).json({ error: 'Missing fields' });

        try {
            await Progress.findOneAndUpdate(
                { userId, contentId, season, episode },
                { currentTime },
                { new: true, upsert: true }
            );
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    }

    async s(req, res) {
        const { userId, contentId, season, episode } = req.query;
        if (!userId || !contentId || !season || !episode) return res.status(400).json({ error: 'Missing fields' });

        try {
            const progress = await Progress.findOne({ userId, contentId, season, episode});
            res.json(progress || { currentTime: 0 });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    }
}

module.exports = ProgressController;
