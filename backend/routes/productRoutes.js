const express = require('express');
const router = express.Router();
const { getProducts, getMyProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');

// Public catalog & marketplace endpoints
router.get('/', getProducts);

// Vendor product operations
router.get('/my-products', getMyProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;