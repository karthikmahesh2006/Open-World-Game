const { registerOrLoginPlayer } = require('../services/authService');
const { loadPlayerProgress } = require('../services/progressService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

async function loginOrRegister(req, res) {
  try {
    const { username, password } = req.body || {};
    if (!username) return sendError(res, 'Username is required', 400);
    const authData = await registerOrLoginPlayer({ username, password });
    const progress = await loadPlayerProgress(username);
    return sendSuccess(res, { ...authData, progress }, 'Authenticated');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
}

module.exports = { loginOrRegister };
