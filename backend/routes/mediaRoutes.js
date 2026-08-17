const express = require('express');
const { getImageKitAuth } = require('../controllers/mediaController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get temporary authentication token for client-side direct ImageKit uploads
router.get('/imagekit-auth', protect, getImageKitAuth);

module.exports = router;