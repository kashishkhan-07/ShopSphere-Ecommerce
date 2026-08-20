const Vendor = require('../models/Vendor');
const User = require('../models/User');

// @desc    Get Current Logged In Vendor Profile
// @route   GET /api/vendors/me
// @access  Private (Vendor Only)
const getVendorProfile = async (req, res) => {
  try {
    let vendor = await Vendor.findOne({ user: req.user.id }).populate('user', 'name email phone');

    if (!vendor) {
      const user = await User.findById(req.user.id);
      const storeName = user.storeName || `${user.name} Store`;
      const storeSlug = (storeName + '-' + Date.now()).toLowerCase().replace(/[^a-z0-9]/g, '-');

      vendor = await Vendor.create({
        user: req.user.id,
        storeName,
        storeSlug,
        description: `Official storefront for ${user.name}`,
        vendorStatus: 'pending',
        isVerified: false,
      });
    }

    return res.status(200).json({ success: true, vendor });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update Vendor Store Profile (Store Name, Logo, Description)
// @route   PUT /api/vendors/me
// @access  Private (Vendor Only)
const updateVendorProfile = async (req, res) => {
  try {
    const { storeName, description, logo } = req.body;
    const updateFields = {};
    if (storeName) updateFields.storeName = storeName;
    if (description) updateFields.description = description;
    if (logo) updateFields.logo = logo;

    const vendor = await Vendor.findOneAndUpdate(
      { user: req.user.id },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    return res.status(200).json({ success: true, message: 'Store profile updated successfully!', vendor });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get All Vendors
// @route   GET /api/vendors
// @access  Public
const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().populate('user', 'name email phone avatar');
    return res.status(200).json({ success: true, count: vendors.length, vendors });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get Pending Vendor Applications
// @route   GET /api/vendors/pending
// @access  Private (Admin Only)
const getPendingVendors = async (req, res) => {
  try {
    const pendingVendors = await Vendor.find({ vendorStatus: 'pending' }).populate('user', 'name email phone createdAt');
    return res.status(200).json({ success: true, count: pendingVendors.length, vendors: pendingVendors });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Approve Vendor Application
// @route   PATCH /api/vendors/:id/approve
// @access  Private (Admin Only)
const approveVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor application not found' });
    }

    vendor.vendorStatus = 'approved';
    vendor.isVerified = true;
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: `Vendor "${vendor.storeName}" has been approved successfully!`,
      vendor,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Reject Vendor Application
// @route   PATCH /api/vendors/:id/reject
// @access  Private (Admin Only)
const rejectVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor application not found' });
    }

    vendor.vendorStatus = 'rejected';
    vendor.isVerified = false;
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: `Vendor "${vendor.storeName}" application has been rejected.`,
      vendor,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getVendorProfile,
  updateVendorProfile,
  getAllVendors,
  getPendingVendors,
  approveVendor,
  rejectVendor,
};