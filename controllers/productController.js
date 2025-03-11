const Product = require('../models/Product');

// @desc   Create a new product
// @route  POST /api/products/
// @access Private (Only vendors)
const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category, vendorId, imageUrl } = req.body;

        // ✅ Validate required fields
        if (!name || !price || !stock || !category || !vendorId || !imageUrl) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const product = await Product.create({
            name,
            description,
            price,
            stock,
            category,
            vendorId,
            images: [imageUrl] // ✅ Store image URL in the array
        });

        res.status(201).json(product);
    } catch (error) {
        console.error("Product Creation Error:", error);
        res.status(500).json({ message: "Failed to create product" });
    }
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
