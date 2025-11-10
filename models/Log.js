const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  level: { type: String, enum: ["info", "warn", "error"], default: "info" },
  message: { type: String, required: true },
  meta: { type: Object },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Log", logSchema);
