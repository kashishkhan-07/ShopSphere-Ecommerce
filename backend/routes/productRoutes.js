const express = require('express');
const router = express.Router();
const { getProducts, getMyProducts, createProduct } = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/my-products', protect, getMyProducts);
router.post('/', protect, createProduct);

module.exports = router;