const express = require('express');
const {
  getStoreBySlug,
  getMyStore,
  updateMyStore,
  submitKyc,
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public store details
router.get('/store/:slug', getStoreBySlug);

// Vendor-private operations
router.get('/my-store', protect, authorize('vendor'), getMyStore);
router.put('/my-store', protect, authorize('vendor'), updateMyStore);
router.post('/kyc', protect, authorize('vendor'), submitKyc);

module.exports = router;