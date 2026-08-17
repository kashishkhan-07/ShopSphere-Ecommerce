const User = require('../models/User');
const Vendor = require('../models/Vendor');
const slugify = require('slugify');

// Helper: Sends JWT token response with secure cookie
const sendTokenResponse = (user, statusCode, res, extraData = {}) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + (process.env.COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses,
        vendorProfile: user.vendorProfile,
      },
      ...extraData,
    });
};

// @desc    Register new Customer or Vendor
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, storeName, storeDescription } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const assignedRole = role === 'vendor' ? 'vendor' : 'customer';

    // 1. Create User
    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
    });

    let vendor = null;

    // 2. If registering as vendor, automatically initialize their store
    if (assignedRole === 'vendor') {
      const generatedStoreName = storeName || `${name}'s Store`;
      const storeSlug = slugify(generatedStoreName, { lower: true, strict: true }) + '-' + Math.random().toString(36).substring(2, 6);

      vendor = await Vendor.create({
        user: user._id,
        storeName: generatedStoreName,
        storeSlug,
        description: storeDescription || `Welcome to ${generatedStoreName} on ShopSphere.`,
      });

      user.vendorProfile = vendor._id;
      await user.save();
    }

    sendTokenResponse(user, 201, res, { vendor });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Check for user (include password field)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify password with bcrypt
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    let vendor = null;
    if (user.role === 'vendor') {
      vendor = await Vendor.findOne({ user: user._id });
    }

    sendTokenResponse(user, 200, res, { vendor });
  } catch (err) {
    next(err);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let vendor = null;

    if (user.role === 'vendor') {
      vendor = await Vendor.findOne({ user: user._id }).populate('subscriptionPlan');
    }

    res.status(200).json({
      success: true,
      user,
      vendor,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user & clear cookie
// @route   GET /api/auth/logout
// @access  Public
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
};

// @desc    1-Click Demo Login Switcher (For quick testing)
// @route   POST /api/auth/demo-login
// @access  Public
exports.demoLogin = async (req, res, next) => {
  try {
    const { role } = req.body; // 'admin', 'vendor', 'customer'
    const targetEmail =
      role === 'admin'
        ? 'admin@shopsphere.com'
        : role === 'vendor'
        ? 'techzone@shopsphere.com'
        : 'customer@shopsphere.com';

    let user = await User.findOne({ email: targetEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Demo user for role '${role}' not found. Please run seed script first.`,
      });
    }

    let vendor = null;
    if (user.role === 'vendor') {
      vendor = await Vendor.findOne({ user: user._id }).populate('subscriptionPlan');
    }

    sendTokenResponse(user, 200, res, { vendor });
  } catch (err) {
    next(err);
  }
};