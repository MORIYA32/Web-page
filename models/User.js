const fs = require('fs-extra');
const path = require('path');

class User {
    constructor() {
        this.dataPath = path.join(__dirname, '../data/users.json');
        this.ensureDataFile();
    }

    async ensureDataFile() {
        try {
            await fs.ensureDir(path.dirname(this.dataPath));
            const exists = await fs.pathExists(this.dataPath);
            if (!exists) {
                await fs.writeJson(this.dataPath, []);
            }
        } catch (error) {
            console.error('Error ensuring users data file:', error);
        }
    }

    async getUsers() {
        try {
            return await fs.readJson(this.dataPath);
        } catch (error) {
            console.error('Error reading users:', error);
            return [];
        }
    }

    async saveUsers(users) {
        try {
            await fs.writeJson(this.dataPath, users, { spaces: 2 });
        } catch (error) {
            console.error('Error saving users:', error);
            throw error;
        }
    }

    async findByEmail(email) {
        const users = await this.getUsers();
        return users.find(user => user.email === email);
    }

    async findByUsername(username) {
        const users = await this.getUsers();
        return users.find(user => user.username === username);
    }

    async create(userData) {
        const users = await this.getUsers();
        const newUser = {
            id: Date.now(),
            email: userData.email,
            username: userData.username,
            password: userData.password, // In production, hash this!
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        await this.saveUsers(users);
        return newUser;
    }
}

module.exports = User;