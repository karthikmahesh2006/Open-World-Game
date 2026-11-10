const { verifyToken } = require('../utils/tokenUtils');
const { sendError } = require('../utils/responseHelper');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    req.user = { id: 'guest', username: 'GuestPilot' };
    return next();
  }
  try {
    req.user = verifyToken(token);
    return next();
  } catch (err) {
    return sendError(res, 'Invalid or expired token', 401);
  }
}

module.exports = { requireAuth };
