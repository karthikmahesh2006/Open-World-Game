const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    splats: { type: Number, default: 0 },
    xp: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.models.LeaderboardEntry || mongoose.model('LeaderboardEntry', leaderboardSchema);
