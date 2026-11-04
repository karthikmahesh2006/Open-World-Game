const bcrypt = require('bcryptjs');
const Player = require('../models/Player');
const GameProgress = require('../models/GameProgress');
const { getDbStatus } = require('../config/db');
const { generateToken } = require('../utils/tokenUtils');

// Fallback memory store when local MongoDB daemon is not running
const memoryPlayers = new Map();

const DEFAULT_INVENTORY = [
  { itemId: 'marker_cyan_pro', name: 'Cyan Pro Splatter', category: 'marker', equipped: true },
  { itemId: 'visor_neon_blue', name: 'Neon Tactical Visor', category: 'visor', equipped: true },
  { itemId: 'pass_skyhawk', name: 'Sky-Hawk Chopper Pilot License', category: 'vehicle_pass', equipped: true }
];

async function registerPlayer({ username, email, password }) {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  if (getDbStatus()) {
    const existing = await Player.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const error = new Error('Username or email already registered');
      error.statusCode = 400;
      throw error;
    }
    const player = await Player.create({ username, email, passwordHash });
    const progress = await GameProgress.create({
      player: player._id,
      inventory: DEFAULT_INVENTORY
    });
    const token = generateToken({ id: String(player._id), username: player.username });
    return { player, progress, token };
  }

  // Fallback in-memory registration
  for (const p of memoryPlayers.values()) {
    if (p.email === email || p.username === username) {
      const error = new Error('Username or email already registered');
      error.statusCode = 400;
      throw error;
    }
  }
  const id = 'mem_' + Date.now();
  const player = {
    _id: id,
    username,
    email,
    passwordHash,
    avatarConfig: { skinColor: 0xfde68a, shirtColor: 0x0284c7, pantsColor: 0x0f172a, visorColor: 0x22d3ee },
    settings: { mouseSensitivity: 1.0, invertYAxis: false, requireClickToLook: false, sfxEnabled: true, cameraMode: 'third' },
    lastKnownPosition: { x: 0, y: 0, z: 28, yaw: Math.PI, zone: 'Downtown Plaza' }
  };
  memoryPlayers.set(id, player);
  const token = generateToken({ id, username });
  return { player, token };
}

async function loginPlayer({ usernameOrEmail, password }) {
  if (getDbStatus()) {
    const player = await Player.findOne({
      $or: [{ email: usernameOrEmail.toLowerCase() }, { username: usernameOrEmail }]
    });
    if (!player || !(await bcrypt.compare(password, player.passwordHash))) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }
    const token = generateToken({ id: String(player._id), username: player.username });
    return { player, token };
  }

  for (const p of memoryPlayers.values()) {
    if (p.email === usernameOrEmail.toLowerCase() || p.username === usernameOrEmail) {
      const valid = await bcrypt.compare(password, p.passwordHash);
      if (!valid) break;
      const token = generateToken({ id: p._id, username: p.username });
      return { player: p, token };
    }
  }
  const error = new Error('Invalid credentials');
  error.statusCode = 401;
  throw error;
}

async function getPlayerById(id) {
  if (getDbStatus()) {
    return Player.findById(id).select('-passwordHash');
  }
  return memoryPlayers.get(id) || null;
}

async function updatePlayerSettings(id, settings, lastKnownPosition) {
  if (getDbStatus()) {
    const update = {};
    if (settings) update.settings = settings;
    if (lastKnownPosition) update.lastKnownPosition = lastKnownPosition;
    return Player.findByIdAndUpdate(id, { $set: update }, { new: true }).select('-passwordHash');
  }
  const p = memoryPlayers.get(id);
  if (p) {
    if (settings) p.settings = { ...p.settings, ...settings };
    if (lastKnownPosition) p.lastKnownPosition = { ...p.lastKnownPosition, ...lastKnownPosition };
  }
  return p;
}

module.exports = {
  registerPlayer,
  loginPlayer,
  getPlayerById,
  updatePlayerSettings
};
