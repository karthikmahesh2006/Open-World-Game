const bcrypt = require('bcryptjs');
const Player = require('../models/Player');
const GameProgress = require('../models/GameProgress');
const { getDbStatus } = require('../config/db');
const { signToken } = require('../utils/tokenUtils');

const memoryPlayers = new Map();

async function registerOrLoginPlayer({ username, password = 'default_password' }) {
  const cleanName = String(username || 'MetroPilot').trim().slice(0, 24);
  if (getDbStatus()) {
    let player = await Player.findOne({ username: cleanName });
    if (!player) {
      const passwordHash = await bcrypt.hash(password, 8);
      player = await Player.create({ username: cleanName, passwordHash });
      await GameProgress.findOneAndUpdate(
        { username: cleanName },
        { $setOnInsert: { username: cleanName, level: 1, xp: 0, coins: 250 } },
        { upsert: true, new: true }
      );
    }
    const token = signToken({ id: player._id.toString(), username: cleanName });
    return { token, player: { id: player._id.toString(), username: cleanName } };
  }

  if (!memoryPlayers.has(cleanName)) {
    memoryPlayers.set(cleanName, { id: `mem_${Date.now()}`, username: cleanName });
  }
  const memUser = memoryPlayers.get(cleanName);
  const token = signToken(memUser);
  return { token, player: memUser };
}

module.exports = { registerOrLoginPlayer };
