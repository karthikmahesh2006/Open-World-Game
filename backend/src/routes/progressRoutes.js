const express = require('express');
const { saveProgress, getProgress } = require('../controllers/progressController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();
router.post('/save', requireAuth, saveProgress);
router.get('/:username', getProgress);

module.exports = router;
