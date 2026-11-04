const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 28
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    avatarConfig: {
      skinColor: { type: Number, default: 0xfde68a },
      shirtColor: { type: Number, default: 0x0284c7 },
      pantsColor: { type: Number, default: 0x0f172a },
      visorColor: { type: Number, default: 0x22d3ee }
    },
    settings: {
      mouseSensitivity: { type: Number, default: 1.0, min: 0.1, max: 3.0 },
      invertYAxis: { type: Boolean, default: false },
      requireClickToLook: { type: Boolean, default: false },
      sfxEnabled: { type: Boolean, default: true },
      cameraMode: { type: String, enum: ['third', 'first'], default: 'third' }
    },
    lastKnownPosition: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 28 },
      yaw: { type: Number, default: 3.14159 },
      zone: { type: String, default: 'Downtown Plaza' }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Player || mongoose.model('Player', PlayerSchema);
