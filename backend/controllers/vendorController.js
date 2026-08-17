const Vendor = require('../models/Vendor');
const Product = require('../models/Product');

// @desc    Get public vendor storefront with all listed products
// @route   GET /api/vendors/store/:slug
// @access  Public
exports.getStoreBySlug = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ storeSlug: req.params.slug, isActive: true })
      .select('-bankAccount -stripeAccountId');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Store not found',
      });
    }

    const products = await Product.find({ vendor: vendor._id, isActive: true, isApproved: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      vendor,
      products,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get authenticated vendor's dashboard metrics
// @route   GET /api/vendors/my-store
// @access  Private (Vendor only)
exports.getMyStore = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id })
      .populate('subscriptionPlan');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor store profile not found',
      });
    }

    const productCount = await Product.countDocuments({ vendor: vendor._id });

    res.status(200).json({
      success: true,
      vendor,
      stats: {
        totalProducts: productCount,
        availableBalance: vendor.wallet.availableBalance,
        pendingBalance: vendor.wallet.pendingBalance,
        totalEarnings: vendor.wallet.totalEarnings,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update store branding & bank details
// @route   PUT /api/vendors/my-store
// @access  Private (Vendor only)
exports.updateMyStore = async (req, res, next) => {
  try {
    const { storeName, description, logo, banner, bankAccount } = req.body;

    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found',
      });
    }

    if (storeName) vendor.storeName = storeName;
    if (description) vendor.description = description;
    if (logo) vendor.logo = logo;
    if (banner) vendor.banner = banner;
    if (bankAccount) vendor.bankAccount = { ...vendor.bankAccount, ...bankAccount };

    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Store settings updated successfully',
      vendor,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit KYC documents for admin review
// @route   POST /api/vendors/kyc
// @access  Private (Vendor only)
exports.submitKyc = async (req, res, next) => {
  try {
    const { businessRegistrationNumber, taxId, documentUrl } = req.body;

    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found',
      });
    }

    vendor.kyc = {
      businessRegistrationNumber,
      taxId,
      documentUrl,
      status: 'pending',
      rejectionReason: '',
    };

    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'KYC documents submitted successfully. Admin review pending.',
      kyc: vendor.kyc,
    });
  } catch (err) {
    next(err);
  }
};