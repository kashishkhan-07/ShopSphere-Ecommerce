const Vendor = require('../models/Vendor');
const User = require('../models/User');

// @desc    Get Current Logged In Vendor Profile (Auto-Creates if missing)
// @route   GET /api/vendors/me
// @access  Private (Vendor Only)
const getVendorProfile = async (req, res) => {
  try {
    let vendor = await Vendor.findOne({ user: req.user.id }).populate('subscriptionPlan');

    // If Vendor Profile does not exist yet for this user, create it automatically!
    if (!vendor) {
      const user = await User.findById(req.user.id);
      const storeName = user.storeName || (user.name.endsWith('Store') || user.name.endsWith('Tech') ? user.name : `${user.name} Store`);
      const storeSlug = storeName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();

      vendor = await Vendor.create({
        user: req.user.id,
        storeName: storeName,
        storeSlug: storeSlug,
        description: `Official marketplace storefront for ${user.name}.`,
        logo: user.avatar || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200',
        commissionRate: 5.0,
        isVerified: true,
        wallet: { availableBalance: 0, pendingBalance: 0 },
      });
    }

    return res.status(200).json({ success: true, vendor });
  } catch (err) {
    console.error('Get Vendor Profile Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get All Vendors
// @route   GET /api/vendors
// @access  Public
const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ isVerified: true }).populate('user', 'name email phone avatar');
    return res.status(200).json({ success: true, count: vendors.length, vendors });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getVendorProfile,
  getAllVendors,
};