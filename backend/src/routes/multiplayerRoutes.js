const express = require('express');
const {
  syncPlayerState,
  getOnlinePlayers,
  leaveMultiplayer
} = require('../controllers/multiplayerController');

const router = express.Router();
router.post('/sync', syncPlayerState);
router.get('/players', getOnlinePlayers);
router.post('/leave', leaveMultiplayer);

module.exports = router;
