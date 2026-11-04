const { verifyToken } = require('../utils/tokenUtils');
const { sendError } = require('../utils/responseHelper');

function protectRoute(req, res, next) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authorization token required', 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (err) {
    return sendError(res, 'Invalid or expired token', 401);
  }
}

module.exports = { protectRoute };
