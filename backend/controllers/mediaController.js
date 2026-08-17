const { getAuthParams } = require('../config/imagekit');

// @desc    Get ImageKit upload authentication signature for frontend direct upload
// @route   GET /api/media/imagekit-auth
// @access  Private (Authenticated users/vendors)
exports.getImageKitAuth = async (req, res, next) => {
  try {
    const authParams = getAuthParams();
    res.status(200).json({
      success: true,
      auth: {
        ...authParams,
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
      },
    });
  } catch (err) {
    next(err);
  }
};