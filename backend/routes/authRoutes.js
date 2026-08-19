const express = require('express');
const { register, login, getMe, logout, demoLogin, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.get('/logout', logout);

module.exports = router;