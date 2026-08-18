const express = require('express');
const {
  getVendors,
  getVendorBySlug,
  getSubscriptionPlans,
  upgradePlan,
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getVendors);
router.get('/plans', getSubscriptionPlans);
router.get('/:slug', getVendorBySlug);
router.post('/upgrade-plan', protect, authorize('vendor', 'admin'), upgradePlan);

module.exports = router;