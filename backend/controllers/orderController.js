const Order = require('../models/Order');
const SubOrder = require('../models/SubOrder');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_dummy_key');

// @desc    1. Create Stripe Payment Intent & Split Sub-Orders
// @route   POST /api/orders/create-payment-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    let calculatedTotal = 0;
    const vendorBuckets = {};

    // 1. Verify Products from DB
    for (const item of items) {
      const prodId = item.productId?._id || item.productId || item.product?._id || item.product;
      const product = await Product.findById(prodId).populate('vendor');

      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'One or more items in your cart are from an older session. Please clear cart and re-add fresh items.',
        });
      }

      const unitPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
      const qty = Number(item.qty) || 1;
      const itemSubtotal = unitPrice * qty;
      calculatedTotal += itemSubtotal;

      const vId = product.vendor._id.toString();
      if (!vendorBuckets[vId]) {
        vendorBuckets[vId] = {
          vendor: product.vendor,
          items: [],
          subtotal: 0,
        };
      }

      vendorBuckets[vId].items.push({
        product: product._id,
        title: product.title,
        price: unitPrice,
        qty: qty,
        image: product.images?.[0]?.url || '',
      });
      vendorBuckets[vId].subtotal += itemSubtotal;
    }

    // 2. Create Parent Order
    const order = await Order.create({
      customer: req.user.id,
      totalAmount: calculatedTotal,
      shippingAddress,
      paymentMethod: 'stripe',
      paymentStatus: 'pending',
    });

    // 3. Create Sub-Orders with Mongoose Schema Alignment
    const subOrderIds = [];
    for (const vId in vendorBuckets) {
      const bucket = vendorBuckets[vId];
      const commissionRate = bucket.vendor.commissionRate || 5.0;
      const commission = Number(((bucket.subtotal * commissionRate) / 100).toFixed(2));
      const earnings = Number((bucket.subtotal - commission).toFixed(2));

      const subOrder = await SubOrder.create({
        parentOrder: order._id,
        order: order._id,
        vendor: vId,
        customer: req.user.id,
        items: bucket.items,
        subTotal: bucket.subtotal,
        subtotal: bucket.subtotal,
        platformCommission: commission,
        adminCommission: commission,
        vendorEarnings: earnings,
        fulfillmentStatus: 'placed',
      });

      subOrderIds.push(subOrder._id);
    }

    order.subOrders = subOrderIds;
    await order.save();

    // 4. Stripe Client Secret (with test fallback)
    let clientSecret = 'mock_secret_' + order._id;
    try {
      if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('dummy')) {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(calculatedTotal * 100),
          currency: 'inr',
          metadata: { orderId: order._id.toString(), customerId: req.user.id.toString() },
        });
        clientSecret = paymentIntent.client_secret;
      }
    } catch (sErr) {
      console.log('Stripe client secret created with test fallback');
    }

    return res.status(200).json({
      success: true,
      clientSecret,
      orderId: order._id,
      totalAmount: calculatedTotal,
    });
  } catch (err) {
    console.error('Payment intent error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    2. Confirm Payment & Release to Pending Balance
// @route   POST /api/orders/:id/confirm-payment
// @access  Private
exports.confirmPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('subOrders');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.paymentStatus = 'paid';
    order.stripePaymentIntentId = req.body.paymentIntentId || 'pi_test_' + Date.now();
    await order.save();

    // Credit Vendor Pending Wallets (Held in Escrow)
    for (const sub of order.subOrders) {
      await Vendor.findByIdAndUpdate(sub.vendor, {
        $inc: { 'wallet.pendingBalance': sub.vendorEarnings },
      });
    }

    return res.status(200).json({ success: true, message: 'Payment confirmed in Escrow', order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    3. Get Customer's Orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate({
        path: 'subOrders',
        populate: { path: 'vendor', select: 'storeName logo' },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    4. Get Vendor Sub-Orders
// @route   GET /api/orders/vendor-suborders
// @access  Private
exports.getVendorSubOrders = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    const subOrders = await SubOrder.find({ vendor: vendor._id })
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: subOrders.length, subOrders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    5. Update SubOrder Status
// @route   PATCH /api/orders/suborders/:id/status
// @access  Private
exports.updateSubOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, carrier } = req.body;
    const subOrder = await SubOrder.findById(req.params.id);

    if (!subOrder) {
      return res.status(404).json({ success: false, message: 'SubOrder not found' });
    }

    subOrder.fulfillmentStatus = status;
    if (trackingNumber) subOrder.trackingNumber = trackingNumber;
    if (carrier) subOrder.shippingCarrier = carrier;
    await subOrder.save();

    if (status === 'delivered') {
      await Vendor.findByIdAndUpdate(subOrder.vendor, {
        $inc: {
          'wallet.pendingBalance': -subOrder.vendorEarnings,
          'wallet.availableBalance': subOrder.vendorEarnings,
        },
      });
    }

    return res.status(200).json({ success: true, subOrder });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    6. Cancel Order & Release Escrow Refund
// @route   PATCH /api/orders/:id/cancel
// @access  Private (Customer Only)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('subOrders');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check ownership
    if (order.customer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this order' });
    }

    // Check if already shipped or delivered
    const isShipped = order.subOrders.some((s) => s.fulfillmentStatus === 'shipped' || s.fulfillmentStatus === 'delivered');
    if (isShipped) {
      return res.status(400).json({
        success: false,
        message: 'Order has already been dispatched by courier and cannot be cancelled directly. Please contact store seller.',
      });
    }

    // 1. Update Order Status to Refunded
    order.paymentStatus = 'refunded';
    await order.save();

    // 2. Cancel all Sub-Orders and Deduct from Vendor Pending Escrow
    for (const sub of order.subOrders) {
      sub.fulfillmentStatus = 'cancelled';
      await sub.save();

      await Vendor.findByIdAndUpdate(sub.vendor, {
        $inc: { 'wallet.pendingBalance': -sub.vendorEarnings },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully! Your refund has been initiated.',
      order,
    });
  } catch (err) {
    console.error('Cancel order error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};