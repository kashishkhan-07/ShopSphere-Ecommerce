const express = require('express');
const router = express.Router();
const {
  getVendorProfile,
  updateVendorProfile,
  getAllVendors,
  getPendingVendors,
  approveVendor,
  rejectVendor,
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');

// Public route
router.get('/', getAllVendors);

// Vendor Protected routes
router.get('/me', protect, getVendorProfile);
router.put('/me', protect, updateVendorProfile);

// Admin Protected routes
router.get('/pending', protect, authorize('admin'), getPendingVendors);
router.patch('/:id/approve', protect, authorize('admin'), approveVendor);
router.patch('/:id/reject', protect, authorize('admin'), rejectVendor);

module.exports = router;