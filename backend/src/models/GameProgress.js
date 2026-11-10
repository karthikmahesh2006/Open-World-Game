const mongoose = require('mongoose');

const gameProgressSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    coins: { type: Number, default: 250 },
    splats: { type: Number, default: 0 },
    rooftopGoals: { type: Number, default: 0 },
    arcadeHighScore: { type: Number, default: 0 },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 28 }
    },
    inventory: { type: [String], default: ['Pro Paintball Marker', 'City Pass'] },
    completedMissions: { type: [String], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.models.GameProgress || mongoose.model('GameProgress', gameProgressSchema);
