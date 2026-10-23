const { verifyToken } = require('../utils/jwt');

function getTokenFromRequest(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  if (req.cookies && req.cookies.token) return req.cookies.token;
  return null;
}

function requireAuth(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ success: false, error: 'Authentication required' });
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired session' });
  }
}

function optionalAuth(req, res, next) {
  const token = getTokenFromRequest(req);
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      req.user = null;
    }
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
}

module.exports = { requireAuth, optionalAuth, requireAdmin };
