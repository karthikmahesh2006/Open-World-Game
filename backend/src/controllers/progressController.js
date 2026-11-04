const progressService = require('../services/progressService');
const { sendSuccess } = require('../utils/responseHelper');

async function getProgress(req, res, next) {
  try {
    const progress = await progressService.getOrCreateProgress(req.user.id);
    return sendSuccess(res, { progress }, 'Game progress loaded');
  } catch (err) {
    return next(err);
  }
}

async function saveProgress(req, res, next) {
  try {
    const progress = await progressService.savePlayerProgress(req.user.id, req.body);
    return sendSuccess(res, { progress }, 'Game progress saved');
  } catch (err) {
    return next(err);
  }
}

async function recordPaintballMatch(req, res, next) {
  try {
    const { blueScore, redScore, playerSplats } = req.body;
    const won = Number(blueScore) >= Number(redScore);
    const progress = await progressService.savePlayerProgress(req.user.id, {
      xpDelta: won ? 150 : 60,
      coinsDelta: won ? 100 : 35,
      stats: {
        paintballMatchesPlayed: 1,
        paintballMatchesWon: won ? 1 : 0,
        totalPaintballSplats: Number(playerSplats) || 0
      },
      matchRecord: {
        blueScore: Number(blueScore) || 0,
        redScore: Number(redScore) || 0,
        playerSplats: Number(playerSplats) || 0,
        won
      }
    });
    return sendSuccess(res, { progress }, 'Paintball match recorded');
  } catch (err) {
    return next(err);
  }
}

module.exports = { getProgress, saveProgress, recordPaintballMatch };
