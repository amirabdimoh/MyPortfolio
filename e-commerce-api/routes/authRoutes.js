const express = require('express');
const { register, login, getMe, logout, changePassword, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.use(protect);
router.get('/me', getMe);
router.put('/password', changePassword);
router.put('/profile', updateProfile);
router.post('/logout', logout);

module.exports = router;
