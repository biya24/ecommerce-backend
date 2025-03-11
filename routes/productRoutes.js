const express = require('express');
const { createProduct, getProducts, getProductById } = require('../controllers/productController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const Product = require('../models/Product');  // ✅ Import the Product model

const router = express.Router();

// router.post('/', protect, createProduct);

// ✅ File upload - Stores image and returns URL
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log("Uploaded File:", req.file);

        res.json({ 
            message: "File uploaded successfully",
            imageUrl: req.file.path // ✅ Return Cloudinary image URL
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: error.message });
    }
});

// ✅ Create product - Includes image URL
router.post('/', protect, async (req, res) => {
    try {
        const { name, description, price, stock, category, vendorId, imageUrl } = req.body;

        const product = await Product.create({
            name,
            description,
            price,
            stock,
            category,
            vendorId,
            images: [imageUrl] // ✅ Store the uploaded image URL in the database
        });

        res.status(201).json(product);
    } catch (error) {
        console.error("Product Creation Error:", error);
        res.status(500).json({ message: error.message });
    }
});


router.get('/', getProducts);
router.get('/:id', getProductById);



module.exports = router;
