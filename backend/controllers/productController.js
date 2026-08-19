const Product = require('../models/Product');
const Vendor = require('../models/Vendor');

// @desc    1. Get all active products with search, category & vendor filtering
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const query = { isActive: true, isApproved: true };

    // Flexible Category Filter (Case-insensitive)
    if (req.query.category && req.query.category !== 'All') {
      query.category = { $regex: new RegExp(req.query.category.trim(), 'i') };
    }

    // Vendor store filter
    if (req.query.vendor) {
      query.vendor = req.query.vendor;
    }

    // Text search
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { brand: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (req.query.sort === 'price-low') sortOption = { price: 1 };
    if (req.query.sort === 'price-high') sortOption = { price: -1 };
    if (req.query.sort === 'rating') sortOption = { rating: -1 };

    const products = await Product.find(query)
      .populate('vendor', 'storeName storeSlug logo isVerified')
      .sort(sortOption);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error fetching products',
    });
  }
};

// @desc    2. Get single product by slug or ID
// @route   GET /api/products/:slug
// @access  Public
exports.getProductBySlug = async (req, res) => {
  try {
    const isId = req.params.slug.match(/^[0-9a-fA-F]{24}$/);
    const query = isId ? { _id: req.params.slug } : { slug: req.params.slug };

    const product = await Product.findOne(query).populate('vendor', 'storeName storeSlug logo isVerified rating');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({ success: true, product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    3. Get Vendor's own products
// @route   GET /api/products/vendor/my-products
// @access  Private (Vendor)
exports.getVendorProducts = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor store profile not found' });
    }

    const products = await Product.find({ vendor: vendor._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    4. Create a new product (Vendor only with SaaS limit check)
// @route   POST /api/products
// @access  Private (Vendor)
exports.createProduct = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id }).populate('subscriptionPlan');
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor store profile not found' });
    }

    // SaaS Plan limit check
    const currentCount = await Product.countDocuments({ vendor: vendor._id });
    const maxAllowed = vendor.subscriptionPlan?.maxProducts || 15;

    if (currentCount >= maxAllowed) {
      return res.status(403).json({
        success: false,
        message: `Your current SaaS plan limit (${maxAllowed} products) is reached. Please upgrade to Pro Tier!`,
      });
    }

    // Default category fallback images if image URL is empty
    let imageUrl = req.body.images?.[0]?.url;
    if (!imageUrl || imageUrl.includes('shopspheredemo')) {
      switch (req.body.category) {
        case 'Beauty & Wellness':
          imageUrl = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500';
          break;
        case 'Fashion & Apparel':
          imageUrl = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500';
          break;
        case 'Home & Kitchen':
          imageUrl = 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500';
          break;
        default:
          imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';
      }
    }

    const product = await Product.create({
      ...req.body,
      vendor: vendor._id,
      images: [{ url: imageUrl }],
    });

    return res.status(201).json({
      success: true,
      message: 'Product listed successfully!',
      product,
    });
  } catch (err) {
    console.error('Create product error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    5. Delete Product
// @route   DELETE /api/products/:id
// @access  Private (Vendor / Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check ownership if vendor
    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ user: req.user.id });
      if (!vendor || product.vendor.toString() !== vendor._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};