const { Watched } = require('../models/Watched');
const mongoose = require('mongoose');
const { doesProfileIdBelongToUser } = require("./profileController");
const { info, warn, error } = require("../utils/logger");

class WatchedController {
  async markAsWatchedRestApi(req, res) {
    const { profileId, contentId, type, seasonNumber, episodeNumber, completed } = req.body;
    if (!doesProfileIdBelongToUser(req.user.id, profileId)) {
      return res.status(400).json({ error: 'Profile Id does not belong to user' });
    }
    this.markAsWatched(
      req.user.id,
      profileId,
      contentId,
      type,
      seasonNumber,
      episodeNumber,
      completed
    );
    
    return res.status(200).json({ message: 'Marked as watched' });
  }

  async markAsWatched(
    userId,
    profileId,
    contentId,
    type,
    seasonNumber,
    episodeNumber,
    completed = true
  ) {
    if (!["movie", "episode"].includes(type)) {
      throw new Error("Invalid type: must be 'movie' or 'episode'");
    }

    const filter = {
      userId: new mongoose.Types.ObjectId(userId),
      profileId: new mongoose.Types.ObjectId(profileId),
      contentId: new mongoose.Types.ObjectId(contentId),
      type,
    };

    if (type === "episode") {
      if (seasonNumber == null || episodeNumber == null)
        throw new Error("seasonNumber and episodeNumber required for episode");
      filter.seasonNumber = seasonNumber;
      filter.episodeNumber = episodeNumber;
    }

    return await Watched.findOneAndUpdate(
      filter,
      { $set: { completed } },
      { upsert: true, }
    );
  }

  async getWatchedListRestApi(req, res) {
    const { profileId } = req.query;
    if (!doesProfileIdBelongToUser(req.user.id, profileId)) {
      return res.status(400).json({ error: 'Profile Id does not belong to user' });
    }
    try {
      const watched = await Watched.find({ userId: req.user.id, profileId });
      res.json(watched);
    } catch (err) {
      error("Error fetching watched documents:", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = WatchedController;
