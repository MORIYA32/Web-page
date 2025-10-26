const Progress = require('../models/Progress');
const Profile = require('../models/Profile');

class ProgressController {
    async updateProgress(req, res) {
        const { profileId, contentId, season, episode, currentTime } = req.body;

        if (!profileId, !contentId || !season || !episode) return res.status(400).json({ error: 'Missing fields' });

        if (!doesProfileIdBelongToUser(req.user.id, profileId)) {
            return res.status(400).json({ error: 'Profile Id does not belong to user' });
        }

        try {
            await Progress.findOneAndUpdate(
                { userId: req.user.id, profileId, contentId, season, episode },
                { currentTime },
                { new: true, upsert: true }
            );
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    }

    async getCurrentProgress(req, res) {
        console.log("GET PROG")
        const { profileId, contentId, season, episode } = req.query;
        if (!profileId, !contentId || !season || !episode) return res.status(400).json({ error: 'Missing fields' });

        if (!doesProfileIdBelongToUser(req.user.id, profileId)) {
            return res.status(400).json({ error: 'Profile Id does not belong to user' });
        }

        try {
            const progress = await Progress.findOne({ userId: req.user.id, profileId, contentId, season, episode});
            res.json(progress || { currentTime: 0 });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    }
}

async function doesProfileIdBelongToUser(userId, profileId) {
    const profile = await Profile.findOne({ _id: profileId, userId });
    return !!profile;
}

module.exports = ProgressController;
