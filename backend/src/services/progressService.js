const GameProgress = require('../models/GameProgress');
const LeaderboardEntry = require('../models/LeaderboardEntry');
const { getDbStatus } = require('../config/db');

const memoryProgress = new Map();

function createInitialProgressState(playerId) {
  return {
    player: playerId,
    level: 1,
    xp: 0,
    coins: 250,
    stats: {
      paintballMatchesPlayed: 0,
      paintballMatchesWon: 0,
      totalPaintballSplats: 0,
      rooftopFootballGoals: 0,
      arcadeHighScore: 0,
      buildingsVisited: ['Downtown Plaza'],
      vehiclesDriven: [],
      helicopterFlights: 0
    },
    inventory: [
      { itemId: 'marker_cyan_pro', name: 'Cyan Pro Splatter', category: 'marker', equipped: true },
      { itemId: 'visor_neon_blue', name: 'Neon Tactical Visor', category: 'visor', equipped: true },
      { itemId: 'pass_skyhawk', name: 'Sky-Hawk Chopper Pilot License', category: 'vehicle_pass', equipped: true }
    ],
    missions: [
      { missionId: 'splat_10', progress: 0, completed: false, claimed: false },
      { missionId: 'rooftop_goal_3', progress: 0, completed: false, claimed: false },
      { missionId: 'arcade_500', progress: 0, completed: false, claimed: false },
      { missionId: 'drive_all_vehicles', progress: 0, completed: false, claimed: false },
      { missionId: 'pilot_chopper', progress: 0, completed: false, claimed: false }
    ],
    achievements: [],
    matchHistory: []
  };
}

async function getOrCreateProgress(playerId) {
  if (getDbStatus()) {
    let prog = await GameProgress.findOne({ player: playerId });
    if (!prog) {
      prog = await GameProgress.create(createInitialProgressState(playerId));
    }
    return prog;
  }
  if (!memoryProgress.has(playerId)) {
    memoryProgress.set(playerId, createInitialProgressState(playerId));
  }
  return memoryProgress.get(playerId);
}

async function savePlayerProgress(playerId, payload) {
  const prog = await getOrCreateProgress(playerId);

  if (typeof payload.xpDelta === 'number') {
    prog.xp += payload.xpDelta;
    prog.level = Math.max(1, Math.floor(prog.xp / 250) + 1);
  }
  if (typeof payload.coinsDelta === 'number') {
    prog.coins = Math.max(0, prog.coins + payload.coinsDelta);
  }
  if (payload.stats) {
    const s = prog.stats;
    if (payload.stats.paintballMatchesPlayed) s.paintballMatchesPlayed += payload.stats.paintballMatchesPlayed;
    if (payload.stats.paintballMatchesWon) s.paintballMatchesWon += payload.stats.paintballMatchesWon;
    if (payload.stats.totalPaintballSplats) s.totalPaintballSplats += payload.stats.totalPaintballSplats;
    if (payload.stats.rooftopFootballGoals) s.rooftopFootballGoals += payload.stats.rooftopFootballGoals;
    if (payload.stats.arcadeHighScore && payload.stats.arcadeHighScore > s.arcadeHighScore) {
      s.arcadeHighScore = payload.stats.arcadeHighScore;
    }
    if (payload.stats.buildingVisited && !s.buildingsVisited.includes(payload.stats.buildingVisited)) {
      s.buildingsVisited.push(payload.stats.buildingVisited);
    }
    if (payload.stats.vehicleDriven && !s.vehiclesDriven.includes(payload.stats.vehicleDriven)) {
      s.vehiclesDriven.push(payload.stats.vehicleDriven);
    }
    if (payload.stats.helicopterFlights) {
      s.helicopterFlights += payload.stats.helicopterFlights;
    }
  }
  if (payload.matchRecord) {
    prog.matchHistory.unshift(payload.matchRecord);
    if (prog.matchHistory.length > 20) prog.matchHistory.pop();
  }

  if (getDbStatus() && typeof prog.save === 'function') {
    await prog.save();
  }
  return prog;
}

async function getTopLeaderboard(category = 'paintball_splats') {
  if (getDbStatus()) {
    return LeaderboardEntry.find({ category }).sort({ score: -1 }).limit(10);
  }
  return [
    { username: 'MetroChampion', category, score: 42 },
    { username: 'SkyHawkPilot', category, score: 35 },
    { username: 'VioletArcadePro', category, score: 28 }
  ];
}

module.exports = {
  getOrCreateProgress,
  savePlayerProgress,
  getTopLeaderboard
};
