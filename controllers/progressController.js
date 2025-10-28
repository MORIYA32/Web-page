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

    async getProfileProgress(req, res) {
        try {
            const { profileId } = req.query;

            if (!profileId) {
                return res.status(400).json({ error: 'Missing profileId' });
            }

            const progressRecords = await Progress.find({ profileId });
            const activityByDay = {};
            const today = new Date();

            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dateString = date.toISOString().split('T')[0];
                activityByDay[dateString] = 0;
            }
            progressRecords.forEach(record => {
                const recordDate = new Date(record.updatedAt).toISOString().split('T')[0];
                if (activityByDay.hasOwnProperty(recordDate)) {
                    activityByDay[recordDate] += 1;
                }
            });

            res.json(activityByDay);
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
