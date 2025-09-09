const Profile = require('../models/Profile');

class ProfileController {
    constructor() {
        this.profileModel = new Profile();
    }

    async getProfiles(req, res) {
        try {
            const profiles = await this.profileModel.getProfiles();
            res.json(profiles);
        } catch (error) {
            console.error('Get profiles error:', error);
            res.status(500).json({ error: 'Failed to fetch profiles' });
        }
    }

    async createProfile(req, res) {
        try {
            const { name, avatar } = req.body;

            // Validation
            if (!name) {
                return res.status(400).json({ error: 'Profile name is required' });
            }

            if (name.trim().length < 1) {
                return res.status(400).json({ error: 'Profile name cannot be empty' });
            }

            // Create new profile
            const newProfile = await this.profileModel.create({ name: name.trim(), avatar });
            
            console.log(`✅ New profile created: ${newProfile.name}`);
            
            res.status(201).json({ 
                message: 'Profile created successfully',
                profile: newProfile
            });

        } catch (error) {
            console.error('Create profile error:', error);
            res.status(500).json({ error: 'Failed to create profile' });
        }
    }
}

module.exports = new ProfileController();