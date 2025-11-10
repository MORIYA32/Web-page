const {logToDB} = require('./dbLogger')

function log(level, message, meta = {}) {
    console.log(`[${level.toUpperCase()}] ${message}`, meta);
    logToDB(level, message, meta);
}

module.exports = {
  info: (msg, meta = {}) => log("info", msg, meta),
  warn: (msg, meta = {}) => log("warn", msg, meta),
  error: (msg, meta = {}) => log("error", msg, meta),
};
