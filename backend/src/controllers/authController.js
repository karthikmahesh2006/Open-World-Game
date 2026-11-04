const authService = require('../services/authService');
const progressService = require('../services/progressService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return sendError(res, 'Username, email, and password are required', 400);
    }
    const result = await authService.registerPlayer({ username, email, password });
    const progress = await progressService.getOrCreateProgress(result.player._id);
    return sendSuccess(res, { player: result.player, progress, token: result.token }, 'Player registered', 201);
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return sendError(res, 'Username/email and password are required', 400);
    }
    const result = await authService.loginPlayer({ usernameOrEmail, password });
    const progress = await progressService.getOrCreateProgress(result.player._id);
    return sendSuccess(res, { player: result.player, progress, token: result.token }, 'Login successful');
  } catch (err) {
    return next(err);
  }
}

async function getProfile(req, res, next) {
  try {
    const player = await authService.getPlayerById(req.user.id);
    const progress = await progressService.getOrCreateProgress(req.user.id);
    return sendSuccess(res, { player, progress }, 'Profile retrieved');
  } catch (err) {
    return next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    const { settings, lastKnownPosition } = req.body;
    const updated = await authService.updatePlayerSettings(req.user.id, settings, lastKnownPosition);
    return sendSuccess(res, { player: updated }, 'Player settings & position saved');
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, getProfile, updateSettings };
