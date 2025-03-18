const Product = require('../models/Product');
const mongoose = require('mongoose'); 

// @desc   Create a new product
// @route  POST /api/products/
// @access Private (Only vendors)
// const createProduct = async (req, res) => {
//     try {
//         const { name, description, price, stock, category, vendorId, imageUrl } = req.body;

//         // ✅ Validate required fields
//         if (!name || !price || !stock || !category || !vendorId || !imageUrl) {
//             return res.status(400).json({ message: "All fields are required" });
//         }

//         const product = await Product.create({
//             name,
//             description,
//             price,
//             stock,
//             category,
//             vendorId,
//             images: [imageUrl] // ✅ Store image URL in the array
//         });

//         res.status(201).json(product);
//     } catch (error) {
//         console.error("Product Creation Error:", error);
//         res.status(500).json({ message: "Failed to create product" });
//     }
// };

const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category, imageUrl } = req.body;

        if (!req.user || req.user.role !== "vendor") {
            return res.status(403).json({ message: "Only vendors can add products" });
        }

        const product = await Product.create({
            name,
            description,
            price,
            stock,
            category,
            vendorId: req.user._id, // ✅ Assign vendor ID from auth
            images: [imageUrl],
        });

        res.status(201).json(product);
    } catch (error) {
        console.error("Product Creation Error:", error);
        res.status(500).json({ message: error.message });
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
// const getProductById = async (req, res) => {
//     const product = await Product.findById(req.params.id);

//     if (product) {
//         res.json(product);
//     } else {
//         res.status(404).json({ message: 'Product not found' });
//     }
// };

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ If "id" is not a valid ObjectId, return early
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



const getVendorProducts = async (req, res) => {
    try {
        console.log("Vendor ID from request:", req.user ? req.user._id : "No user found");

        if (!req.user || !req.user._id) {
            return res.status(400).json({ message: "Vendor ID is required" });
        }

        // ✅ Ensure vendorId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
            return res.status(400).json({ message: "Invalid Vendor ID format" });
        }

        const products = await Product.find({ vendorId: req.user._id });

        if (!products.length) {
            return res.status(404).json({ message: "No products found for this vendor" });
        }

        res.json(products);
    } catch (error) {
        console.error("Error fetching vendor products:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};




const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.vendorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized: You can only delete your own products" });
        }

        await product.deleteOne();
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting product:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


module.exports = { createProduct, getProducts, getProductById, getVendorProducts, deleteProduct };
