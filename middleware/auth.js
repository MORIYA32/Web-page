const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  try {
    const token = req.cookies?.auth;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
};
