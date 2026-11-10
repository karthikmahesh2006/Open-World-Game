const express = require('express');
const { listMissions, completeMission } = require('../controllers/missionController');

const router = express.Router();
router.get('/', listMissions);
router.post('/complete', completeMission);

module.exports = router;
