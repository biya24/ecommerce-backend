const express = require('express');
const { createProduct, getProducts, getProductById } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);

module.exports = router;
