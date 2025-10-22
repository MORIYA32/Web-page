const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
    episodeNumber: Number,
    videoUrl: String,
    episodeTitle: String
});

const seasonSchema = new mongoose.Schema({
    seasonNumber: Number,
    episodes: [episodeSchema]
});

const contentSchema = new mongoose.Schema({
    id: Number,
    type: {
        type: String,
        enum: ['movie', 'series'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    genre: [String],
    actors: [String],
    thumbnail: String,
    trailerUrl: String,
    videoUrl: String, 
    seasons: [seasonSchema], 
    likes: {
        type: Number,
        default: 0
    },
    likedBy: [{
        type: String  
    }],
    imdbId: String,

    
    description: { type: String, default: '' }
}, {
    timestamps: true
});

const Content = mongoose.model('Content', contentSchema, 'videoLibrary');

module.exports = Content;
