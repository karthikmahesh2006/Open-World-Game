const Mission = require('../models/Mission');
const progressService = require('../services/progressService');
const { getDbStatus } = require('../config/db');
const { sendSuccess } = require('../utils/responseHelper');

const DEFAULT_MISSIONS = [
  {
    missionId: 'splat_10',
    title: 'Arena Sharpshooter',
    description: 'Tag 10 Red AI Bots in the Outskirts Paintball Arena.',
    category: 'paintball',
    statKey: 'totalPaintballSplats',
    targetValue: 10,
    rewardXp: 200,
    rewardCoins: 120
  },
  {
    missionId: 'rooftop_goal_3',
    title: 'Violet Terrace Striker',
    description: 'Score 3 goals on the Violet Tower Rooftop Football Ground.',
    category: 'football',
    statKey: 'rooftopFootballGoals',
    targetValue: 3,
    rewardXp: 180,
    rewardCoins: 100
  },
  {
    missionId: 'arcade_500',
    title: '7th Floor Arcade Wizard',
    description: 'Score 500+ points on any 7th Floor Neon Arcade cabinet.',
    category: 'arcade',
    statKey: 'arcadeHighScore',
    targetValue: 500,
    rewardXp: 150,
    rewardCoins: 90
  },
  {
    missionId: 'pilot_chopper',
    title: 'Sky-Hawk Aviator',
    description: 'Take off in the Sky-Hawk Helicopter from a topmost rooftop helipad.',
    category: 'vehicles',
    statKey: 'helicopterFlights',
    targetValue: 1,
    rewardXp: 120,
    rewardCoins: 80
  }
];

async function listMissions(req, res, next) {
  try {
    if (getDbStatus()) {
      const dbMissions = await Mission.find({});
      if (dbMissions.length > 0) {
        return sendSuccess(res, { missions: dbMissions }, 'Missions loaded');
      }
    }
    return sendSuccess(res, { missions: DEFAULT_MISSIONS }, 'Missions loaded');
  } catch (err) {
    return next(err);
  }
}

async function getLeaderboard(req, res, next) {
  try {
    const category = req.query.category || 'paintball_splats';
    const entries = await progressService.getTopLeaderboard(category);
    return sendSuccess(res, { leaderboard: entries }, 'Leaderboard retrieved');
  } catch (err) {
    return next(err);
  }
}

module.exports = { listMissions, getLeaderboard, DEFAULT_MISSIONS };
