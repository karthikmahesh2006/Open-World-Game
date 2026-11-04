const mongoose = require('mongoose');

const MissionSchema = new mongoose.Schema(
  {
    missionId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['paintball', 'exploration', 'arcade', 'football', 'vehicles'],
      required: true
    },
    statKey: { type: String, required: true },
    targetValue: { type: Number, required: true, min: 1 },
    rewardXp: { type: Number, required: true, default: 100 },
    rewardCoins: { type: Number, required: true, default: 50 }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Mission || mongoose.model('Mission', MissionSchema);
