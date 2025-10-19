const Profile = require('../models/Profile');

class ProfileController {
    async getProfiles(req, res) {
        try {
            const { userId } = req.query;
            
            if (!userId) {
                return res.status(400).json({ error: 'User ID is required' });
            }
            
            const profiles = await Profile.find({ userId });
            res.json(profiles);
        } catch (error) {
            console.error('Get profiles error:', error);
            res.status(500).json({ error: 'Failed to fetch profiles' });
        }
    }

    async createProfile(req, res) {
        try {
            const { name, avatar, userId } = req.body;

            if (!userId) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            if (!name) {
                return res.status(400).json({ error: 'Profile name is required' });
            }

            if (name.trim().length < 1) {
                return res.status(400).json({ error: 'Profile name cannot be empty' });
            }

            // Create new profile
            const newProfile = await Profile.create({
                userId,
                name: name.trim(),
                avatar
            });
            
            console.log(`New profile created: ${newProfile.name} for user ${userId}`);
            
            res.status(201).json({ 
                message: 'Profile created successfully',
                profile: newProfile
            });

        } catch (error) {
            console.error('Create profile error:', error);
            res.status(500).json({ error: 'Failed to create profile' });
        }
    }

    async updateProfile(req, res) {
        try {
            const { profileId } = req.params;
            const { name, userId } = req.body;

            // Validation
            if (!userId) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            if (!name || name.trim().length < 1) {
                return res.status(400).json({ error: 'Profile name is required' });
            }

            // Find and update profile
            const profile = await Profile.findOne({ _id: profileId, userId });

            if (!profile) {
                return res.status(404).json({ error: 'Profile not found' });
            }

            profile.name = name.trim();
            await profile.save();

            console.log(`Profile updated: ${profile.name}`);

            res.json({ 
                message: 'Profile updated successfully',
                profile
            });

        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ error: 'Failed to update profile' });
        }
    }

    async deleteProfile(req, res) {
        try {
            const { profileId } = req.params;
            const { userId } = req.query;

            // Validation
            if (!userId) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            // Find and delete profile
            const profile = await Profile.findOneAndDelete({ _id: profileId, userId });

            if (!profile) {
                return res.status(404).json({ error: 'Profile not found' });
            }

            console.log(`Profile deleted: ${profile.name}`);

            res.json({ message: 'Profile deleted successfully' });

        } catch (error) {
            console.error('Delete profile error:', error);
            res.status(500).json({ error: 'Failed to delete profile' });
        }
    }
}

module.exports = new ProfileController();