const Content = require("../models/Content");

const path = require("path");
const fs = require("fs");
const { info, warn, error } = require("../utils/logger");
const fsp = fs.promises;

function sanitizeFilename(str) {
  return String(str || "")
    .replace(/[^a-z0-9_\-\.]+/gi, "_")
    .toLowerCase();
}

class ContentController {
  async getContent(req, res) {
    try {
      const content = await Content.find();
      res.json(content);
    } catch (err) {
      error("Get content error:", err.message);
      res.status(500).json({ error: "Failed to fetch content" });
    }
  }

  async likeContent(req, res) {
    try {
      const { id } = req.params;
      const { selectedProfileId } = req.body;

      if (!selectedProfileId) {
        return res.status(400).json({ error: "profileId is required" });
      }

      const content = await Content.findById(id);

      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }

      if (typeof content.likes !== "number") content.likes = 0;
      if (!Array.isArray(content.likedBy)) content.likedBy = [];

      const hasLiked = content.likedBy.some(
        (uid) => uid.toString() === selectedProfileId.toString()
      );

      if (hasLiked) {
        content.likedBy = content.likedBy.filter(
          (uid) => uid.toString() !== selectedProfileId.toString()
        );
        content.likes = Math.max(0, content.likes - 1);
      } else {
        content.likedBy.push(selectedProfileId);
        content.likes += 1;
      }

      await content.save();

      info(`Content like updated`, {
        contentId: content._id,
        title: content.title,
        profileId: selectedProfileId,
        totalLikes: content.likes,
        userHasLiked: hasLiked,
        likedBy: content.likedBy,
      });

      res.json({
        message: "Like updated successfully",
        likes: content.likes,
        userHasLiked: !hasLiked,
      });
    } catch (err) {
      error("Error updating like:", err.message);
      res.status(500).json({ error: "Failed to update like" });
    }
  }

  async getUserLikes(req, res) {
    try {
      const profileId = req.query.profileId;

      if (!profileId) {
        return res.status(400).json({ error: "profileId is required" });
      }

      const likedContent = await Content.find({
        likedBy: profileId,
      }).select("_id");

      const likedIds = likedContent.map((content) => content._id.toString());

      res.json({ likedIds });
    } catch (err) {
      error("Error fetching user likes:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  }

  async getRatings(req, res) {
    try {
      const { id } = req.params;
      const content = await Content.findById(id);
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }

      const omdbApiKey = process.env.OMDB_API_KEY;
      if (!omdbApiKey) {
        return res.json({ ratings: null });
      }

      let data;

      if (content.imdbId) {
        const resp = await fetch(
          `http://www.omdbapi.com/?i=${content.imdbId}&apikey=${omdbApiKey}`
        );
        data = await resp.json();
      } else {
        const params = new URLSearchParams({
          t: String(content.title || ""),
          y: String(content.year || ""),
          type: String(content.type || ""),
          apikey: omdbApiKey,
        });
        const resp = await fetch(
          `http://www.omdbapi.com/?${params.toString()}`
        );
        data = await resp.json();

        if (data && data.Response === "True" && data.imdbID) {
          content.imdbId = data.imdbID;
          await content.save().catch(() => {});
        }
      }

      if (!data || data.Response === "False") {
        return res.json({ ratings: null });
      }

      const ratings = {
        imdb:
          data.imdbRating && data.imdbRating !== "N/A" ? data.imdbRating : null,
        rottenTomatoes: null,
      };

      if (Array.isArray(data.Ratings)) {
        const rt = data.Ratings.find((r) => r.Source === "Rotten Tomatoes");
        if (rt) ratings.rottenTomatoes = rt.Value;
      }

      return res.json({ ratings });
    } catch (err) {
      error("Get ratings error:", err.message);
      return res.status(500).json({ error: "Failed to fetch ratings" });
    }
  }

  async createContent(req, res) {
    try {
      const {
        title = "",
        year = "",
        type = "movie",
        genres = "",
        director = "",
        cast = "",
        description = "",
        imdbId = "",
      } = req.body || {};

      if (!title || !year || !type) {
        return res
          .status(400)
          .json({ error: "title, year and type are required" });
      }

      const posterFile = req.files?.poster?.[0] || null;
      const videoFile = req.files?.video?.[0] || null;

      if (!posterFile) {
        return res.status(400).json({ error: "Poster image is required" });
      }
      if (type === "movie" && !videoFile) {
        return res
          .status(400)
          .json({ error: "MP4 video is required for movies" });
      }
      if (videoFile && videoFile.mimetype !== "video/mp4") {
        return res.status(400).json({ error: "Video must be an MP4 file" });
      }

      const picturesDir = path.resolve(__dirname, "..", "views", "pictures");
      const videosDir = path.resolve(__dirname, "..", "views", "videos");
      await fsp.mkdir(picturesDir, { recursive: true });
      await fsp.mkdir(videosDir, { recursive: true });

      const base = sanitizeFilename(`${title}-${Date.now()}`);

      const posterExt =
        path.extname(posterFile.originalname || ".jpg") || ".jpg";
      const posterName = `${base}${posterExt}`;
      const posterAbs = path.join(picturesDir, posterName);
      await fsp.writeFile(posterAbs, posterFile.buffer);
      const thumbnail = `/${path
        .join("pictures", posterName)
        .replace(/\\/g, "/")}`;

      let videoUrl = null;
      if (videoFile) {
        const videoExt =
          path.extname(videoFile.originalname || ".mp4") || ".mp4";
        const videoName = `${base}${videoExt}`;
        const videoAbs = path.join(videosDir, videoName);
        await fsp.writeFile(videoAbs, videoFile.buffer);
        videoUrl = `/${path.join("videos", videoName).replace(/\\/g, "/")}`;
      }

      const genre = String(genres || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const actors = String(cast || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const last = await Content.findOne().sort({ id: -1 }).select("id").lean();
      const nextId = (last?.id || 0) + 1;

      const doc = await Content.create({
        id: nextId,
        type: String(type).trim(),
        title: String(title).trim(),
        year: Number(year),
        genre,
        actors,
        thumbnail,
        videoUrl,
        seasons: [],
        imdbId: imdbId ? String(imdbId).trim() : undefined,
        likes: 0,
        likedBy: [],

        description: String(description || "").trim(),
      });

      return res.status(201).json({ content: doc });
    } catch (err) {
      error("createContent error:", err.message);
      if (err && err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(413)
          .json({ error: "File too large (max 20MB per file)" });
      }
      return res.status(500).json({ error: "Failed to create content" });
    }
  }
}

module.exports = new ContentController();
