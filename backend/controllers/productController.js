const Product = require('../models/Product');
const Vendor = require('../models/Vendor');

// @desc    Get All Products
// @route   GET /api/products
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

// @desc    Get Products for Current Vendor
// @route   GET /api/products/my-products
const getMyProducts = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user?.id });
    if (!vendor) {
      return res.status(200).json({ success: true, count: 0, products: [] });
    }

    const products = await Product.find({ vendor: vendor._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: products.length, products });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create New Product
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const { title, name, description, category, brand, price, discountPrice, stock, image, store } = req.body;
    const storeName = store || brand || 'Vendor Store';

    let vendorObj;
    if (req.user?.id) {
      vendorObj = await Vendor.findOne({ user: req.user.id });
    }

    const product = await Product.create({
      vendor: vendorObj ? vendorObj._id : undefined,
      title: title || name,
      description,
      category: category || 'Fashion',
      brand: storeName,
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

// @desc    Update Vendor Product (Edit)
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { title, name, description, category, brand, price, discountPrice, stock, image } = req.body;
    const updateData = {};

    if (title || name) updateData.title = title || name;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    if (brand) updateData.brand = brand;
    if (price !== undefined) updateData.price = Number(price);
    if (discountPrice !== undefined) updateData.discountPrice = Number(discountPrice);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (image) updateData.images = [{ url: image }];

    product = await Product.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true });

    return res.status(200).json({ success: true, message: 'Product updated successfully!', product });
  } catch (err) {
    console.error('Update Product Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete Vendor Product
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();

    return res.status(200).json({ success: true, message: 'Product deleted successfully!' });
  } catch (err) {
    console.error('Delete Product Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getProducts,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};