const express = require('express');
const router = express.Router();
const missionController = require('../controllers/missionController');

router.get('/', missionController.listMissions);
router.get('/leaderboard', missionController.getLeaderboard);

module.exports = router;
