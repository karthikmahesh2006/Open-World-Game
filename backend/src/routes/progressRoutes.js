const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { protectRoute } = require('../middleware/authMiddleware');

router.get('/', protectRoute, progressController.getProgress);
router.post('/save', protectRoute, progressController.saveProgress);
router.post('/paintball-match', protectRoute, progressController.recordPaintballMatch);

module.exports = router;
