const fs = require('fs-extra');
const path = require('path');

class Content {
    constructor() {
        this.dataPath = path.join(__dirname, '../data/content.json');
        this.ensureDataFile();
    }

    async ensureDataFile() {
        try {
            await fs.ensureDir(path.dirname(this.dataPath));
            const exists = await fs.pathExists(this.dataPath);
            if (!exists) {
                // Initialize with your existing movie data
                const defaultContent = [
                    {
                        id: 1,
                        title: "House",
                        year: 2011,
                        genre: "Medical, Drama",
                        type: "Series",
                        likes: 0,
                        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABaQHOcdLduCCDQnC_Q9s6jcc_Yg50dw8wEd4jxy33FQrkfeRk1xDuBLg4QyOx0QDJAFMPhhh_32qkBaAOD9RDpY3x6BsUW9R5n4.webp?r=8eb"
                    },
                    {
                        id: 2,
                        title: "Love Is Blind",
                        year: 2025,
                        genre: "Romantic, Reality",
                        type: "Series",
                        likes: 0,
                        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABdxIlxoppRCW0BN-_Bgj8o8poFsdrQCv2qjm_R8O52brppK99nKTT3U789ZhrQ2oEBo3xxqG7x8zUZI8LyPg2gQ5tmrggwWddgvE9wa7b_uEGo0DnR7JJX5Do8ahGyEJZJUh04AbD1lq5jlxB27sqBhIgXZCGA4F8ts9UJjfWPuUEdpsZabJVOewKXarudMp0Tgo46Ir02T09etCsUqNlUBHq-cF178v7NI.jpg?r=83d"
                    }
                    // Add more movies here...
                ];
                await fs.writeJson(this.dataPath, defaultContent);
            }
        } catch (error) {
            console.error('Error ensuring content data file:', error);
        }
    }

    async getContent() {
        try {
            return await fs.readJson(this.dataPath);
        } catch (error) {
            console.error('Error reading content:', error);
            return [];
        }
    }

    async saveContent(content) {
        try {
            await fs.writeJson(this.dataPath, content, { spaces: 2 });
        } catch (error) {
            console.error('Error saving content:', error);
            throw error;
        }
    }

    async findById(id) {
        const content = await this.getContent();
        return content.find(item => item.id === parseInt(id));
    }

    async updateLikes(id, increment = true) {
        const content = await this.getContent();
        const item = content.find(item => item.id === parseInt(id));
        
        if (item) {
            if (increment) {
                item.likes++;
            } else {
                item.likes = Math.max(0, item.likes - 1);
            }
            await this.saveContent(content);
            return item;
        }
        return null;
    }
}

module.exports = Content;