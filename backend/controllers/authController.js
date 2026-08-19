const User = require('../models/User');
const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');

// Helper: Send JWT Token Response
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'shopsphere_secret_key_2026',
    { expiresIn: '30d' }
  );

  return res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      addresses: user.addresses || [],
    },
  });
};

// @desc    1. Register User (Supports Customer & Vendor Store Creation)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, storeName } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: cleanEmail });
    if (user) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: password.trim(),
      role: role || 'customer',
      phone: phone || '',
    });

    // If registered as Vendor, auto-create Vendor profile
    if (user.role === 'vendor') {
      const slug = (storeName || `${name} Store`).toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
      await Vendor.create({
        user: user._id,
        storeName: storeName || `${name}'s Store`,
        storeSlug: slug,
        description: `Official marketplace storefront for ${name}.`,
        commissionRate: 5.0,
        isVerified: true,
      });
    }

    return sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
// @desc    2. Login User
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(cleanPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    return sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    3. Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let vendor = null;

    if (user && user.role === 'vendor') {
      vendor = await Vendor.findOne({ user: user._id });
    }

    return res.status(200).json({
      success: true,
      user,
      vendor,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    4. Update User Details / Profile & Address
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, phone, avatar, address } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name.trim();
    if (phone !== undefined) fieldsToUpdate.phone = phone.trim();
    if (avatar) fieldsToUpdate.avatar = avatar.trim();

    if (address && address.street) {
      fieldsToUpdate.addresses = [
        {
          fullName: address.fullName || name || req.user.name,
          street: address.street.trim(),
          city: address.city?.trim() || '',
          state: address.state?.trim() || '',
          postalCode: address.postalCode?.trim() || '',
          phone: address.phone?.trim() || phone || req.user.phone || '',
          country: address.country || 'India',
          isDefault: true,
        },
      ];
    }

    const user = await User.findByIdAndUpdate(userId, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        addresses: user.addresses || [],
      },
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    5. Logout User
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};