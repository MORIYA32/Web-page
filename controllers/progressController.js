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

    async getProfileActivityByDay(req, res) {
        const { profileId } = req.query;
        if (!profileId) return res.status(400).json({ error: 'Missing profileId' });

        if (!await doesProfileIdBelongToUser(req.user.id, profileId)) {
            return res.status(400).json({ error: 'Profile Id does not belong to user' });
        }

        try {
            const progressRecords = await Progress.find({ profileId });

            const activityByDay = {};

            // We'll count each episode once per day
            progressRecords.forEach(record => {
                const date = new Date(record.updatedAt).toISOString().split('T')[0];

                if (!activityByDay[date]) activityByDay[date] = new Set();

                // store episode identifier (season+episode) in the set
                const episodeKey = `${record.season}-${record.episode}`;
                activityByDay[date].add(episodeKey);
            });

            // Convert sets to counts
            const result = {};
            for (const date in activityByDay) {
                result[date] = activityByDay[date].size;
            }

            res.json(result);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    }




}

async function doesProfileIdBelongToUser(userId, profileId) {
    const profile = await Profile.findOne({ _id: profileId, userId });
    return !!profile;
}

module.exports = ProgressController;
