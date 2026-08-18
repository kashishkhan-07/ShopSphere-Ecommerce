const User = require('../models/User');
const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');
const slugify = require('slugify');

// Helper: Sends JWT token response with cookie
const sendTokenResponse = (user, statusCode, res, extraData = {}) => {
  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'shopsphere_super_jwt_secret_dev_key_2026_secure',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );

  const options = {
    expires: new Date(
      Date.now() + (process.env.COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  return res
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
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&bold=true`,
        addresses: user.addresses || [],
        vendorProfile: user.vendorProfile,
      },
      ...extraData,
    });
};

// @desc    Register a new user (Customer or Vendor)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      street,
      city,
      state,
      postalCode,
      storeName,
      storeDescription
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please Sign In.',
      });
    }

    const assignedRole = role === 'vendor' ? 'vendor' : 'customer';

    // Format address if provided
    const addresses = [];
    if (street || city) {
      addresses.push({
        fullName: name,
        street: street || '',
        city: city || '',
        state: state || '',
        postalCode: postalCode || '',
        phone: phone || '',
        country: 'India',
        isDefault: true,
      });
    }

    // 1. Create user with phone and address
    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      phone: phone || '',
      addresses,
    });

    let vendor = null;

    // 2. If registering as vendor, create store profile
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

    return sendTokenResponse(user, 201, res, { vendor });
  } catch (err) {
    console.error('Register error details:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error during registration',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.',
      });
    }

    let vendor = null;
    if (user.role === 'vendor') {
      vendor = await Vendor.findOne({ user: user._id });
    }

    return sendTokenResponse(user, 200, res, { vendor });
  } catch (err) {
    console.error('Login error details:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error during login',
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let vendor = null;
    if (user.role === 'vendor') {
      vendor = await Vendor.findOne({ user: user._id }).populate('subscriptionPlan');
    }

    return res.status(200).json({
      success: true,
      user,
      vendor,
    });
  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving profile',
    });
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Public
exports.logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  return res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
};

// @desc    1-Click Demo Login (Auto-heals & handles existing data)
// @route   POST /api/auth/demo-login
// @access  Public
exports.demoLogin = async (req, res) => {
  try {
    const { role } = req.body;
    const targetRole = role === 'admin' ? 'admin' : role === 'vendor' ? 'vendor' : 'customer';
    const targetEmail =
      targetRole === 'admin'
        ? 'admin@shopsphere.com'
        : targetRole === 'vendor'
        ? 'techzone@shopsphere.com'
        : 'customer@shopsphere.com';

    let user = await User.findOne({ email: targetEmail });

    // If user does not exist, create it safely
    if (!user) {
      user = await User.create({
        name: targetRole === 'admin' ? 'Super Admin' : targetRole === 'vendor' ? 'Vikram Mehta' : 'Rohan Sharma',
        email: targetEmail,
        password: 'password123',
        role: targetRole,
      });
    }

    let vendor = null;
    if (targetRole === 'vendor') {
      vendor = await Vendor.findOne({ user: user._id });
      if (!vendor) {
        const uniqueSlug = 'techzone-hub-' + Math.random().toString(36).substring(2, 6);
        vendor = await Vendor.create({
          user: user._id,
          storeName: 'TechZone Hub',
          storeSlug: uniqueSlug,
          description: 'Premier authorized retailer for audio gear & computing accessories.',
          isVerified: true,
          commissionRate: 5.0,
          wallet: { availableBalance: 12500, pendingBalance: 4200, totalEarnings: 58000 },
        });
        user.vendorProfile = vendor._id;
        await user.save();
      }
    }

    return sendTokenResponse(user, 200, res, { vendor });
  } catch (err) {
    console.error('Demo login critical error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error during demo login',
    });
  }
};