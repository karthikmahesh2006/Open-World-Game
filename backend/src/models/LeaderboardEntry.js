const mongoose = require('mongoose');

const LeaderboardEntrySchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    username: { type: String, required: true },
    category: {
      type: String,
      enum: ['paintball_splats', 'arcade_highscore', 'rooftop_goals'],
      required: true
    },
    score: { type: Number, required: true },
    recordedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.LeaderboardEntry || mongoose.model('LeaderboardEntry', LeaderboardEntrySchema);
