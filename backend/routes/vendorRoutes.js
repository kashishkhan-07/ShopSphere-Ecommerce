const express = require('express');
const router = express.Router();
const { getVendorProfile, getAllVendors } = require('../controllers/vendorController');
const { protect } = require('../middleware/auth');

router.get('/me', protect, getVendorProfile);
router.get('/', getAllVendors);

module.exports = router;