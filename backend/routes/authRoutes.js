const express = require('express');
const {
  register,
  login,
  getMe,
  updateDetails,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/update-details', protect, updateDetails);
router.put('/profile', protect, updateDetails);
router.get('/logout', logout);

module.exports = router;