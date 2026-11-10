const Mission = require('../models/Mission');
const { savePlayerProgress } = require('../services/progressService');
const { getDbStatus } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHelper');

const DEFAULT_MISSIONS = [
  { code: 'arena_10', title: 'Arena Sharpshooter', description: 'Tag 10 Red AI Bots in Paintball', xpReward: 200, coinReward: 100 },
  { code: 'rooftop_goal', title: 'Terrace Striker', description: 'Score on the Violet Tower Rooftop Pitch or Metro Stadium', xpReward: 180, coinReward: 90 },
  { code: 'arcade_play', title: 'Arcade Wizard', description: 'Play any 7th Floor Neon Arcade Cabinet', xpReward: 150, coinReward: 75 },
  { code: 'sky_pool_swim', title: 'Sky Pool Swimmer', description: 'Swim in the Metro Royal Hotel 9F Rooftop Pool', xpReward: 140, coinReward: 70 },
  { code: 'city_fleet', title: 'City Fleet Operator', description: 'Pilot the Sky-Hawk Helicopter & Emergency Vehicles', xpReward: 120, coinReward: 60 }
];

async function listMissions(req, res) {
  try {
    if (getDbStatus()) {
      const docs = await Mission.find().lean();
      if (docs && docs.length > 0) return sendSuccess(res, docs);
    }
    return sendSuccess(res, DEFAULT_MISSIONS);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
}

async function completeMission(req, res) {
  try {
    const { username, xp = 150, coins = 300 } = req.body || {};
    const updated = await savePlayerProgress({ username, xp, coins });
    return sendSuccess(res, updated, 'Mission reward granted');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
}

module.exports = { listMissions, completeMission };
