const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: false, trim: true },
    passwordHash: { type: String, required: true },
    avatarColor: { type: String, default: '#0284c7' }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Player || mongoose.model('Player', playerSchema);
