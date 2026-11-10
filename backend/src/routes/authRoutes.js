const express = require('express');
const { loginOrRegister } = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();
router.post('/login', loginOrRegister);
router.post('/register', loginOrRegister);
router.get('/me', requireAuth, (req, res) => res.json({ status: 'ok', user: req.user }));

module.exports = router;
