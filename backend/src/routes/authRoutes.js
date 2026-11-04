const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protectRoute } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', protectRoute, authController.getProfile);
router.put('/settings', protectRoute, authController.updateSettings);

module.exports = router;
