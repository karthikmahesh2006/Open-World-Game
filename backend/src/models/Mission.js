const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    xpReward: { type: Number, default: 150 },
    coinReward: { type: Number, default: 75 }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Mission || mongoose.model('Mission', missionSchema);
