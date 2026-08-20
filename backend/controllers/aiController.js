const Product = require('../models/Product');
const Order = require('../models/Order');
const SubOrder = require('../models/SubOrder');
const jwt = require('jsonwebtoken');

// @desc    Intelligent AI Marketplace Assistant (Product Recommendations & Order Tracking)
// @route   POST /api/ai/chat
// @access  Public
exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const query = message.toLowerCase().trim();

    // 🔍 Extract User from Token if available
    let userId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        userId = decoded.id;
      } catch (e) {
        // Token invalid / guest
      }
    }

    // 1. Fetch Active Marketplace Products
    const products = await Product.find({ isActive: true, isApproved: true })
      .populate('vendor', 'storeName')
      .limit(10);

    // 2. Fetch Recent Customer Orders if logged in
    let recentOrders = [];
    if (userId) {
      recentOrders = await Order.find({ customer: userId })
        .populate('subOrders')
        .sort({ createdAt: -1 })
        .limit(3);
    }

    // 🧠 Contextual NLP Intelligence

    // A. Order Tracking Query
    if (query.includes('order') || query.includes('track') || query.includes('delivery') || query.includes('package') || query.includes('parcel')) {
      if (!userId) {
        return res.status(200).json({
          success: true,
          reply: 'To track your orders, please **Sign In** to your ShopSphere account! Once signed in, I can pull up your live parcel status and courier tracking numbers.',
        });
      }

      if (recentOrders.length === 0) {
        return res.status(200).json({
          success: true,
          reply: "You haven't placed any orders yet on ShopSphere! Browse our marketplace, add items to your cart, and checkout securely with Stripe to track your live orders.",
        });
      }

      const latest = recentOrders[0];
      const sub = latest.subOrders?.[0];
      const status = sub?.fulfillmentStatus || latest.paymentStatus;
      const tracking = sub?.trackingNumber ? `with tracking ID **${sub.trackingNumber}** via **${sub.shippingCarrier || 'BlueDart'}**` : 'currently being processed by the merchant';

      return res.status(200).json({
        success: true,
        reply: `📦 Your latest order **#${latest._id.toString().slice(-8).toUpperCase()}** (Total: ₹${latest.totalAmount?.toLocaleString('en-IN')}) is currently **${status.toUpperCase()}** ${tracking}.\n\nYou can also check the full timeline in the **"My Orders"** tab!`,
      });
    }

    // B. Product Recommendation Query
    if (query.includes('recommend') || query.includes('product') || query.includes('best') || query.includes('buy') || query.includes('keyboard') || query.includes('headphones') || query.includes('shoes') || query.includes('beauty') || query.includes('electronics') || query.includes('kitchen') || query.includes('mug')) {
      let filtered = products;
      if (query.includes('beauty')) filtered = products.filter((p) => p.category.includes('Beauty'));
      if (query.includes('kitchen') || query.includes('mug') || query.includes('knife')) filtered = products.filter((p) => p.category.includes('Kitchen'));
      if (query.includes('fashion') || query.includes('shoes') || query.includes('boot') || query.includes('hoodie')) filtered = products.filter((p) => p.category.includes('Fashion'));
      if (query.includes('electronics') || query.includes('keyboard') || query.includes('headphones')) filtered = products.filter((p) => p.category.includes('Electronics'));

      if (filtered.length > 0) {
        const list = filtered.slice(0, 3).map((p) => `• **${p.title}** by *${p.vendor?.storeName || 'Verified Merchant'}* — **₹${(p.discountPrice || p.price).toLocaleString('en-IN')}**`).join('\n');
        return res.status(200).json({
          success: true,
          reply: `✨ Here are top recommendations currently trending on ShopSphere:\n\n${list}\n\nAll items are backed by our Stripe Escrow Guarantee! Would you like details on any of these?`,
        });
      }
    }

    // C. Escrow & Stripe Payment Query
    if (query.includes('stripe') || query.includes('escrow') || query.includes('payment') || query.includes('safe') || query.includes('refund')) {
      return res.status(200).json({
        success: true,
        reply: '🔒 **ShopSphere Escrow Protection**: When you place an order, your 256-bit encrypted payment is securely held in escrow via Stripe. Funds are only credited to the vendor once your package is marked **Delivered**!',
      });
    }

    // D. Vendor Onboarding & SaaS Plans
    if (query.includes('vendor') || query.includes('sell') || query.includes('commission') || query.includes('saas') || query.includes('plan')) {
      return res.status(200).json({
        success: true,
        reply: '🏬 **Selling on ShopSphere**: Merchants can choose from 3 SaaS Tiers:\n• **Starter Tier**: Free listing (5.0% commission)\n• **Pro Merchant**: ₹999/mo (2.5% commission)\n• **Enterprise**: ₹2999/mo (1.0% commission)\n\nVendors can upgrade directly from their Vendor Portal!',
      });
    }

    // E. General Greeting & Fallback
    return res.status(200).json({
      success: true,
      reply: `Hello! 👋 I'm **SphereAI**, your 24/7 intelligent marketplace assistant.\n\nI can assist you with:\n1. 🔍 **Product Recommendations** (e.g. *"Show top electronics"*)\n2. 📦 **Live Order Tracking** (e.g. *"Track my order"*)\n3. 💳 **Stripe Escrow & Payout Questions**\n4. 💬 **Direct Vendor Chat Support**\n\nHow can I help your shopping experience today?`,
    });
  } catch (err) {
    console.error('AI Chat error:', err);
    return res.status(500).json({ success: false, message: 'AI Engine error' });
  }
};