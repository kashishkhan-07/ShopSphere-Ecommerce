const express = require('express');
const {
  getProducts,
  getProductBySlug,
  getVendorProducts,
  createProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProducts);
router.get('/vendor/my-products', protect, authorize('vendor', 'admin'), getVendorProducts);
router.get('/:slug', getProductBySlug);
router.post('/', protect, authorize('vendor', 'admin'), createProduct);
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteProduct);

module.exports = router;