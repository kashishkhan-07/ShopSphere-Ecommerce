const Product = require('../models/Product');
const Vendor = require('../models/Vendor');

// @desc    Get All Products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, sort } = req.query;
    let query = { isActive: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    let productQuery = Product.find(query).populate('vendor', 'storeName logo commissionRate rating');

    if (sort === 'price-low') productQuery = productQuery.sort({ price: 1 });
    else if (sort === 'price-high') productQuery = productQuery.sort({ price: -1 });
    else if (sort === 'rating') productQuery = productQuery.sort({ rating: -1 });
    else productQuery = productQuery.sort({ createdAt: -1 });

    const products = await productQuery;
    return res.status(200).json({ success: true, count: products.length, products });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get Products for Current Logged In Vendor
// @route   GET /api/products/my-products
// @access  Private (Vendor Only)
const getMyProducts = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(200).json({ success: true, count: 0, products: [] });
    }

    const products = await Product.find({ vendor: vendor._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: products.length, products });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create New Product (Vendor Only)
// @route   POST /api/products
// @access  Private (Vendor Only)
const createProduct = async (req, res) => {
  try {
    let vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      vendor = await Vendor.create({
        user: req.user.id,
        storeName: `${req.user.name} Store`,
        storeSlug: (`${req.user.name}-store-` + Date.now()).toLowerCase().replace(/\s+/g, '-'),
        description: `Official storefront for ${req.user.name}`,
        commissionRate: 5.0,
      });
    }

    const { title, description, category, brand, price, discountPrice, stock, image } = req.body;

    const product = await Product.create({
      vendor: vendor._id,
      title,
      description,
      category: category || 'Electronics',
      brand: brand || vendor.storeName,
      price: Number(price),
      discountPrice: Number(discountPrice) || 0,
      stock: Number(stock) || 10,
      images: [{ url: image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' }],
      isActive: true,
      isApproved: true,
    });

    return res.status(201).json({ success: true, product });
  } catch (err) {
    console.error('Create Product Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getProducts,
  getMyProducts,
  createProduct,
};