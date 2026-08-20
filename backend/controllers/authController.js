const User = require('../models/User');
const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, storeName } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email address already registered' });
    }

    const userRole = role === 'vendor' ? 'vendor' : 'customer';

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: userRole,
    });

    let vendor = null;
    if (userRole === 'vendor') {
      const finalStoreName = storeName || `${name} Store`;
      const storeSlug = (finalStoreName + '-' + Date.now()).toLowerCase().replace(/[^a-z0-9]/g, '-');

      vendor = await Vendor.create({
        user: user._id,
        storeName: finalStoreName,
        storeSlug: storeSlug,
        description: `Official marketplace storefront for ${name}.`,
        isVerified: false,
        vendorStatus: 'pending',
      });
    }

    const token = generateToken(user._id);

    if (userRole === 'vendor') {
      return res.status(201).json({
        success: true,
        message: 'Registration successful. Your vendor account is pending approval by the administrator.',
        token,
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          vendorStatus: 'pending',
        },
      });
    }

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    let vendorStatus = null;
    if (user.role === 'vendor') {
      const vendor = await Vendor.findOne({ user: user._id });
      vendorStatus = vendor ? vendor.vendorStatus : 'pending';
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses,
        phone: user.phone,
        vendorStatus,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let vendorStatus = null;
    if (user.role === 'vendor') {
      const vendor = await Vendor.findOne({ user: user._id });
      vendorStatus = vendor ? vendor.vendorStatus : 'pending';
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses,
        phone: user.phone,
        vendorStatus,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const fieldsToUpdate = {
      name: req.body.name || user.name,
      phone: req.body.phone || user.phone,
      avatar: req.body.avatar || user.avatar,
    };

    if (req.body.address) {
      fieldsToUpdate.addresses = [
        {
          fullName: req.body.address.fullName || req.body.name || user.name,
          phone: req.body.address.phone || req.body.phone || user.phone || '9876543210',
          street: req.body.address.street || '',
          city: req.body.address.city || '',
          state: req.body.address.state || '',
          postalCode: req.body.address.postalCode || '',
          country: req.body.address.country || 'India',
        },
      ];
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, { $set: fieldsToUpdate }, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Update details error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateDetails,
};