const express = require('express');
const router = express.Router();
const { getProducts, getMyProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, requireApprovedVendor } = require('../middleware/auth');

// Public catalog
router.get('/', getProducts);

// Vendor Protected (Requires Approved Status)
router.get('/my-products', protect, requireApprovedVendor, getMyProducts);
router.post('/', protect, requireApprovedVendor, createProduct);
router.put('/:id', protect, requireApprovedVendor, updateProduct);
router.delete('/:id', protect, requireApprovedVendor, deleteProduct);

module.exports = router;