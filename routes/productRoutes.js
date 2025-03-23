const express = require('express');
const { createProduct, getProducts, getProductById, getVendorProducts, deleteProduct, adminGetAllProducts, deleteProductByAdmin } = require("../controllers/productController");
const upload = require('../middleware/uploadMiddleware');
const { protect, vendorOnly, adminOnly } = require("../middleware/authMiddleware");
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
// router.post('/', protect, async (req, res) => {
//     try {
//         const { name, description, price, stock, category, vendorId, imageUrl } = req.body;

//         const product = await Product.create({
//             name,
//             description,
//             price,
//             stock,
//             category,
//             vendorId,
//             images: [imageUrl] // ✅ Store the uploaded image URL in the database
//         });

//         res.status(201).json(product);
//     } catch (error) {
//         console.error("Product Creation Error:", error);
//         res.status(500).json({ message: error.message });
//     }
// });

router.get("/admin", protect, adminOnly, adminGetAllProducts);

router.post("/", protect, vendorOnly, upload.single("image"), createProduct);
router.get('/', getProducts);
router.get("/vendor", protect, vendorOnly, getVendorProducts);
router.get('/:id', getProductById);

// ✅ Admin: Get all products
// router.get("/admin", protect, adminOnly, adminGetAllProducts);




router.delete("/:id", protect, vendorOnly, deleteProduct);



router.delete("/:id/admin", protect, adminOnly, deleteProductByAdmin); // ✅ Admin delete product




module.exports = router;
