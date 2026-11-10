const { savePlayerProgress, loadPlayerProgress } = require('../services/progressService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

async function saveProgress(req, res) {
  try {
    const saved = await savePlayerProgress(req.body || {});
    return sendSuccess(res, saved, 'Game progress saved');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
}

async function getProgress(req, res) {
  try {
    const username = req.params.username || req.query.username || 'MetroPilot';
    const data = await loadPlayerProgress(username);
    return sendSuccess(res, data, 'Game progress loaded');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
}

module.exports = { saveProgress, getProgress };
