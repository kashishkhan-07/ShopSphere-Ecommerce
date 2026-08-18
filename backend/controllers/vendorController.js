const Vendor = require('../models/Vendor');
const SubscriptionPlan = require('../models/SubscriptionPlan');

// @desc    Get all active vendors
// @route   GET /api/vendors
// @access  Public
exports.getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ isVerified: true })
      .populate('user', 'name avatar')
      .populate('subscriptionPlan');

    return res.status(200).json({
      success: true,
      count: vendors.length,
      vendors,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get vendor store by slug
// @route   GET /api/vendors/:slug
// @access  Public
exports.getVendorBySlug = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ storeSlug: req.params.slug })
      .populate('user', 'name avatar')
      .populate('subscriptionPlan');

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor store not found' });
    }

    return res.status(200).json({ success: true, vendor });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all available SaaS Subscription Plans
// @route   GET /api/vendors/plans
// @access  Public
exports.getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true });
    return res.status(200).json({ success: true, plans });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Upgrade Vendor SaaS Subscription Tier
// @route   POST /api/vendors/upgrade-plan
// @access  Private (Vendor)
exports.upgradePlan = async (req, res) => {
  try {
    const { planSlug } = req.body;
    const vendor = await Vendor.findOne({ user: req.user.id });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    const plan = await SubscriptionPlan.findOne({ slug: planSlug });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Subscription plan not found' });
    }

    vendor.subscriptionPlan = plan._id;
    vendor.commissionRate = plan.commissionRate;
    vendor.subscriptionStatus = 'active';
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: `Successfully upgraded to ${plan.name} Plan! Commission lowered to ${plan.commissionRate}%.`,
      vendor,
      plan,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};