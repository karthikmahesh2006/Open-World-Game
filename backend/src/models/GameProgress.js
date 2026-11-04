const mongoose = require('mongoose');

const GameProgressSchema = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
      unique: true
    },
    level: { type: Number, default: 1, min: 1 },
    xp: { type: Number, default: 0, min: 0 },
    coins: { type: Number, default: 250, min: 0 },
    stats: {
      paintballMatchesPlayed: { type: Number, default: 0 },
      paintballMatchesWon: { type: Number, default: 0 },
      totalPaintballSplats: { type: Number, default: 0 },
      rooftopFootballGoals: { type: Number, default: 0 },
      arcadeHighScore: { type: Number, default: 0 },
      buildingsVisited: [{ type: String }],
      vehiclesDriven: [{ type: String }],
      helicopterFlights: { type: Number, default: 0 }
    },
    inventory: [
      {
        itemId: { type: String, required: true },
        name: { type: String, required: true },
        category: { type: String, enum: ['marker', 'visor', 'outfit', 'vehicle_pass'], default: 'marker' },
        equipped: { type: Boolean, default: false },
        acquiredAt: { type: Date, default: Date.now }
      }
    ],
    missions: [
      {
        missionId: { type: String, required: true },
        progress: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
        claimed: { type: Boolean, default: false }
      }
    ],
    achievements: [
      {
        achievementId: { type: String, required: true },
        title: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now }
      }
    ],
    matchHistory: [
      {
        blueScore: Number,
        redScore: Number,
        playerSplats: Number,
        won: Boolean,
        playedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.models.GameProgress || mongoose.model('GameProgress', GameProgressSchema);
