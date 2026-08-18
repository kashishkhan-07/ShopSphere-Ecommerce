const express = require('express');
const {
  createPaymentIntent,
  confirmAndSplitOrder,
  getMyOrders,
  getVendorSubOrders,
  updateSubOrderStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Customer checkout & orders
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/confirm-and-split', protect, confirmAndSplitOrder);
router.get('/my-orders', protect, getMyOrders);

// Vendor fulfillment
router.get('/vendor-suborders', protect, authorize('vendor', 'admin'), getVendorSubOrders);
router.patch('/suborders/:id/status', protect, authorize('vendor', 'admin'), updateSubOrderStatus);

module.exports = router;