const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const SubscriptionPlan = require('../models/SubscriptionPlan');

// @desc    Get all products (Search, category & price filters, sorting, pagination)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const { keyword, category, minPrice, maxPrice, vendor, sort, page = 1, limit = 12 } = req.query;

    const query = { isActive: true, isApproved: true };

    // Search by keyword
    if (keyword) {
      query.$text = { $search: keyword };
    }

    // Filter by Category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by Vendor
    if (vendor) {
      query.vendor = vendor;
    }

    // Filter by Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sorting options
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };

    // Pagination calculation
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('vendor', 'storeName storeSlug logo isVerified rating')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      products,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('vendor', 'storeName storeSlug logo description rating numReviews isVerified');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get products belonging to the logged-in vendor
// @route   GET /api/products/vendor/my-products
// @access  Private (Vendor only)
exports.getMyVendorProducts = async (req, res, next) => {
  try {
    const vendor = req.vendor;
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found for this account',
      });
    }

    const products = await Product.find({ vendor: vendor._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new product (Vendor only)
// @route   POST /api/products
// @access  Private (Vendor only)
exports.createProduct = async (req, res, next) => {
  try {
    const vendor = req.vendor;
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile required to create products',
      });
    }

    // SaaS Feature Gating: Enforce max product limit based on vendor's plan
    if (vendor.subscriptionPlan) {
      const plan = await SubscriptionPlan.findById(vendor.subscriptionPlan);
      if (plan && plan.maxProducts !== -1) {
        const currentCount = await Product.countDocuments({ vendor: vendor._id });
        if (currentCount >= plan.maxProducts) {
          return res.status(403).json({
            success: false,
            message: `Product limit reached for ${plan.name} (${plan.maxProducts} max). Please upgrade to Pro or Enterprise.`,
          });
        }
      }
    }

    const {
      title,
      description,
      category,
      brand,
      price,
      discountPrice,
      stock,
      images,
      attributes,
    } = req.body;

    const product = await Product.create({
      vendor: vendor._id,
      title,
      description,
      category,
      brand: brand || 'Generic',
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      stock: Number(stock),
      images: images && images.length > 0 ? images : [{ url: 'https://ik.imagekit.io/shopspheredemo/default-product.png' }],
      attributes: attributes || [],
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Vendor only)
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Ensure product belongs to this vendor
    if (
      product.vendor.toString() !== req.vendor._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this product',
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Vendor only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (
      product.vendor.toString() !== req.vendor._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};