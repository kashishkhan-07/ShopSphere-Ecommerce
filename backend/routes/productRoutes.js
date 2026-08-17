const express = require('express');
const {
  getProducts,
  getProductBySlug,
  getMyVendorProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);

// Vendor-protected routes
router.get('/vendor/my-products', protect, authorize('vendor', 'admin'), getMyVendorProducts);
router.post('/', protect, authorize('vendor', 'admin'), createProduct);
router.put('/:id', protect, authorize('vendor', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteProduct);

module.exports = router;