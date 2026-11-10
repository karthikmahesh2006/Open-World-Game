const GameProgress = require('../models/GameProgress');
const LeaderboardEntry = require('../models/LeaderboardEntry');
const { getDbStatus } = require('../config/db');

const memoryProgress = new Map();

async function savePlayerProgress(payload) {
  const username = String(payload.username || 'MetroPilot').trim().slice(0, 24);
  const update = {
    username,
    level: Number(payload.level) || 1,
    xp: Number(payload.xp) || 0,
    coins: Number(payload.coins) || 250,
    splats: Number(payload.splats) || 0,
    rooftopGoals: Number(payload.rooftopGoals) || 0,
    arcadeHighScore: Number(payload.arcadeHighScore) || 0,
    position: payload.position || { x: 0, y: 0, z: 28 }
  };

  if (getDbStatus()) {
    const doc = await GameProgress.findOneAndUpdate(
      { username },
      { $set: update },
      { upsert: true, new: true }
    );
    await LeaderboardEntry.findOneAndUpdate(
      { username },
      { $set: { username, splats: update.splats, xp: update.xp } },
      { upsert: true }
    );
    return doc;
  }

  memoryProgress.set(username, { ...update, updatedAt: new Date().toISOString() });
  return memoryProgress.get(username);
}

async function loadPlayerProgress(username) {
  const cleanName = String(username || 'MetroPilot').trim();
  if (getDbStatus()) {
    const doc = await GameProgress.findOne({ username: cleanName });
    if (doc) return doc;
  }
  return (
    memoryProgress.get(cleanName) || {
      username: cleanName,
      level: 1,
      xp: 0,
      coins: 250,
      splats: 0,
      rooftopGoals: 0,
      arcadeHighScore: 0,
      position: { x: 0, y: 0, z: 28 }
    }
  );
}

module.exports = { savePlayerProgress, loadPlayerProgress };
