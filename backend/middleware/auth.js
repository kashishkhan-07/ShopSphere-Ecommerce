const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

// 🔒 Security Requirement: Strict Backend Enforcement for Approved Vendors Only
exports.requireApprovedVendor = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') return next(); // Admins bypass vendor status check

    if (req.user.role !== 'vendor') {
      return res.status(403).json({ success: false, message: 'Vendor access required' });
    }

    let vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(403).json({
        success: false,
        vendorStatus: 'pending',
        message: 'Your vendor account is pending approval by the administrator.',
      });
    }

    if (vendor.vendorStatus === 'pending') {
      return res.status(403).json({
        success: false,
        vendorStatus: 'pending',
        message: 'Your vendor account is pending approval by the administrator.',
      });
    }

    if (vendor.vendorStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        vendorStatus: 'rejected',
        message: 'Your vendor application has been rejected by the administrator.',
      });
    }

    req.vendor = vendor;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};