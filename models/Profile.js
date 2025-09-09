const fs = require('fs-extra');
const path = require('path');

class Profile {
    constructor() {
        this.dataPath = path.join(__dirname, '../data/profiles.json');
        this.ensureDataFile();
    }

    async ensureDataFile() {
        try {
            await fs.ensureDir(path.dirname(this.dataPath));
            const exists = await fs.pathExists(this.dataPath);
            if (!exists) {
                const defaultProfiles = [
                    {
                        id: 1,
                        name: "Tal",
                        avatar: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABdgqRu86LNrfFPuQ2Xhlz2NQehmsezXIx7HyVhyQXZ1wK8n97QjoJnDaiuKnWVnXclSIoqmrdlcXykFzFbnQP91p8rM-yxTFwQ.png?r=181"
                    },
                    {
                        id: 2,
                        name: "Moriya",
                        avatar: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABT8sUMuSqctHteshq7njO_5-LpEDZEJxml-D7fyKkuadlRmsdTGg4rzZEscPdpdHROTubpN_v4E8wlAi94qmetsgUeiZxjmz9A.png?r=5eb"
                    },
                    {
                        id: 3,
                        name: "Kids",
                        avatar: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABfBs_RmrXu6XN02hkLZzUgrqSOMFIx6LUk_-T4dG4Vgr7rwnmYyejpUUebFqmVDbnrwxESqJu6ml0q-G6KQVzRqKA42KmNEPkDmn.png?r=f55"
                    }
                ];
                await fs.writeJson(this.dataPath, defaultProfiles);
            }
        } catch (error) {
            console.error('Error ensuring profiles data file:', error);
        }
    }

    async getProfiles() {
        try {
            return await fs.readJson(this.dataPath);
        } catch (error) {
            console.error('Error reading profiles:', error);
            return [];
        }
    }

    async saveProfiles(profiles) {
        try {
            await fs.writeJson(this.dataPath, profiles, { spaces: 2 });
        } catch (error) {
            console.error('Error saving profiles:', error);
            throw error;
        }
    }

    async create(profileData) {
        const profiles = await this.getProfiles();
        const newProfile = {
            id: Math.max(...profiles.map(p => p.id), 0) + 1,
            name: profileData.name,
            avatar: profileData.avatar || "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABdgqRu86LNrfFPuQ2Xhlz2NQehmsezXIx7HyVhyQXZ1wK8n97QjoJnDaiuKnWVnXclSIoqmrdlcXykFzFbnQP91p8rM-yxTFwQ.png?r=181"
        };
        profiles.push(newProfile);
        await this.saveProfiles(profiles);
        return newProfile;
    }
}

module.exports = Profile;