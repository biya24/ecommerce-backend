const Product = require('../models/Product');

// @desc   Create a new product
// @route  POST /api/products/
// @access Private (Only vendors)
const createProduct = async (req, res) => {
    const { name, description, price, stock, category, images } = req.body;

    if (req.user.role !== 'vendor') {
        return res.status(403).json({ message: 'Only vendors can add products' });
    }

    const product = new Product({
        vendorId: req.user._id,
        name,
        description,
        price,
        stock,
        category,
        images,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
};

// @desc   Get all products
// @route  GET /api/products
// @access Public
const getProducts = async (req, res) => {
    const products = await Product.find();
    res.json(products);
};

// @desc   Get a product by ID
// @route  GET /api/products/:id
// @access Public
const getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

module.exports = { createProduct, getProducts, getProductById };
