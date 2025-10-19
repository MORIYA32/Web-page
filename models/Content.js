const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const episodeSchema = new Schema(
  {
    episodeNumber: { type: Number, required: true, min: 1 },
    episodeTitle: { type: String, trim: true },
    videoFileId: { type: Types.ObjectId, default: null },
    videoUrl: { type: String, trim: true, default: null },
  },
  { _id: false, timestamps: false }
);

const seasonSchema = new Schema(
  {
    seasonNumber: { type: Number, required: true, min: 1 },
    episodes: { type: [episodeSchema], default: [] },
  },
  { _id: false, timestamps: false }
);

const contentSchema = new Schema(
  {
    externalId: { type: Number, index: true },

    type: { type: String, enum: ['movie', 'series'], required: true },

    title: { type: String, required: true, trim: true, index: true },

    year: { type: Number, required: true, min: 1888, max: 2100 },

    genres: {
      type: [String],
      default: [],
      set: (arr) =>
        Array.isArray(arr) ? arr.map(s => String(s).trim()).filter(Boolean) : [],
    },
    director: { type: String, trim: true },
    actors: {
      type: [String],
      default: [],
      set: (arr) =>
        Array.isArray(arr) ? arr.map(s => String(s).trim()).filter(Boolean) : [],
    },
    description: { type: String, trim: true },

    posterFileId: { type: Types.ObjectId, default: null },
    videoFileId: { type: Types.ObjectId, default: null },

    thumbnail: { type: String, trim: true, default: null },
    trailerUrl: { type: String, trim: true, default: null },
    videoUrl: { type: String, trim: true, default: null }, // לסרטים

    seasons: { type: [seasonSchema], default: [] },

    likes: { type: Number, default: 0 },

    imdbId: { type: String, trim: true, index: true },
    ratings: {
      imdb: { type: Number, default: null },           
      rottenTomatoes: { type: Number, default: null }, 
    },

    createdBy: { type: Types.ObjectId, ref: 'User' },

    genre: {
      type: [String],
      default: [],
      set: (arr) =>
        Array.isArray(arr) ? arr.map(s => String(s).trim()).filter(Boolean) : [],
    },
  },
  {
    timestamps: true,
  }
);

contentSchema.index({ type: 1, title: 1, year: 1 });
contentSchema.index(
  { title: 'text', description: 'text', actors: 'text', director: 'text' },
  { weights: { title: 10 } }
);

contentSchema.pre('save', function nextSave(next) {
  if ((!this.genre || this.genre.length === 0) && Array.isArray(this.genres) && this.genres.length) {
    this.genre = this.genres;
  }
  if ((!this.genres || this.genres.length === 0) && Array.isArray(this.genre) && this.genre.length) {
    this.genres = this.genre;
  }
  next();
});

contentSchema.pre('validate', function (next) {
  if (this.type === 'movie') {
    if (!this.videoFileId && !this.videoUrl) {
      return next(new Error('Movie must have videoFileId or videoUrl'));
    }
  } else if (this.type === 'series') {
    if (!this.seasons || this.seasons.length === 0) {
      return next(new Error('Series must have at least one season'));
    }
  }
  next();
});

contentSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    if (ret.posterFileId) ret.posterUrl = `/api/files/${ret.posterFileId}`;
    else if (ret.thumbnail) ret.posterUrl = ret.thumbnail;
    else ret.posterUrl = null;

    if (ret.type === 'movie') {
      if (ret.videoFileId) ret.resolvedVideoUrl = `/api/stream/video/${ret.videoFileId}`;
      else if (ret.videoUrl) ret.resolvedVideoUrl = ret.videoUrl;
      else ret.resolvedVideoUrl = null;
    }

    if (ret.type === 'series' && Array.isArray(ret.seasons)) {
      ret.seasons = ret.seasons.map((s) => ({
        ...s,
        episodes: (s.episodes || []).map((ep) => ({
          ...ep,
          resolvedVideoUrl: ep.videoFileId
            ? `/api/stream/video/${ep.videoFileId}`
            : (ep.videoUrl || null),
        })),
      }));
    }

    return ret;
  },
});

const Content = mongoose.model('Content', contentSchema, 'videoLibrary');
module.exports = Content;
