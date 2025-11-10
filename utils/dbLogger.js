const Log = require("../models/Log");

async function logToDB(level, message, meta = {}) {
  try {
    const logEntry = new Log({ level, message, meta });
    await logEntry.save();
  } catch (err) {
    console.error("Failed to log to DB:", err);
  }
}

exports.logToDB = logToDB;
