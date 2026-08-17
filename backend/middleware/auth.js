const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');

// 1. Protect routes: Verify that the user is logged in
exports.protect = async (req, res, next) => {
  let token;

  // Check if token is in Authorization header (Bearer <token>) or in Cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token found
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please log in first.',
    });
  }

  try {
    // Verify token using our JWT_SECRET
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'shopsphere_fallback_secret_key'
    );

    // Find the user in database
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this session no longer exists or is inactive.',
      });
    }

    req.user = user;

    // If the user is a vendor, automatically attach their store details
    if (user.role === 'vendor') {
      const vendor = await Vendor.findOne({ user: user._id });
      req.vendor = vendor;
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.',
    });
  }
};

// 2. Authorize roles: Only allow specific roles (e.g. 'admin', 'vendor')
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access Forbidden: Role '${req.user.role}' is not allowed to access this resource.`,
      });
    }
    next();
  };
};