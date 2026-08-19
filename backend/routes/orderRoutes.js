const express = require('express');
const {
  createPaymentIntent,
  confirmPayment,
  getMyOrders,
  getVendorSubOrders,
  updateSubOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/:id/confirm-payment', protect, confirmPayment);
router.get('/my-orders', protect, getMyOrders);
router.get('/vendor-suborders', protect, getVendorSubOrders);
router.patch('/suborders/:id/status', protect, updateSubOrderStatus);
router.patch('/:id/cancel', protect, cancelOrder);

module.exports = router;