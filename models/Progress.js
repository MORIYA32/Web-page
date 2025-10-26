const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    profileId: { type: String, required: true },
    contentId: { type: String, required: true },
    season: { type: Number, required: true },
    episode: { type: Number, required: true },
    currentTime: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
