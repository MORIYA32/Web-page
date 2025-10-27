const mongoose = require('mongoose');

const { Schema } = mongoose;

const watchedSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },
    contentId: {
      type: Schema.Types.ObjectId,
      ref: "Content",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["movie", "episode"],
      required: true,
    },
    seasonNumber: Number,
    episodeNumber: Number,
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

watchedSchema.index(
  { userId: 1, profileId: 1, contentId: 1, type: 1, seasonNumber: 1, episodeNumber: 1 },
  { unique: true }
);

const Watched = mongoose.model("Watched", watchedSchema);
module.exports = { Watched };
