const Profile = require('../models/Profile');

const MAX_PROFILES_PER_USER = Number(process.env.MAX_PROFILES_PER_USER || 5);

class ProfileController {
  async getProfiles(req, res) {
    try {
      const userId = req.userId || req.query.userId; 
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
      const userId = req.userId || req.body.userId; 
      const { name, avatar } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      if (!name || name.trim().length < 1) {
        return res.status(400).json({ error: 'Profile name is required' });
      }

      const count = await Profile.countDocuments({ userId });
      if (count >= MAX_PROFILES_PER_USER) {
        return res.status(400).json({
          error: 'You have reached the limit of 5 profiles per user.',
          message: `You can have up to ${MAX_PROFILES_PER_USER} profiles per user.`,
          limit: MAX_PROFILES_PER_USER
        });
      }

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
      if (error?.name === 'ProfileLimitError') {
        return res.status(400).json({
          error: 'Max profile per user',
          message: error.message,
          limit: MAX_PROFILES_PER_USER
        });
      }
      console.error('Create profile error:', error);
      res.status(500).json({ error: 'Failed to create profile' });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.userId || req.body.userId; 
      const { profileId } = req.params;
      const { name } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      if (!name || name.trim().length < 1) {
        return res.status(400).json({ error: 'Profile name is required' });
      }

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
      const userId = req.userId || req.query.userId; 
      const { profileId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

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
