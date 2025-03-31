const express = require('express');
const mongoose = require("mongoose");
const {getUserOrders, placeOrder, getOrders, updateOrderStatus, getAllOrdersAdmin, getOrderById, deleteOrderByAdmin } = require('../controllers/orderController');
const { protect, adminOnly} = require('../middleware/authMiddleware');
const Order = require("../models/Order");
const Product = require("../models/Product");

const router = express.Router();

router.post('/', protect, placeOrder);
router.get('/', protect, getOrders);
router.get("/admin", protect, adminOnly, getAllOrdersAdmin);
// ✅ Fetch logged-in user's orders
router.get("/my-orders", protect, getUserOrders);

router.get("/vendor", protect, async (req, res) => {
    try {
        const vendorId = req.user._id; // ✅ Get logged-in vendor's ID

        // 1️⃣ Fetch vendor's products
        const vendorProducts = await Product.find({ vendorId }).select("_id");

        // 2️⃣ Extract product IDs
        const vendorProductIds = vendorProducts.map(product => product._id);

        // 3️⃣ Fetch orders that contain vendor's products, and populate buyer details
        const vendorOrders = await Order.find({
            "items.productId": { $in: vendorProductIds }
        }).populate("customerId", "name email"); // ✅ Populate buyer details

        res.json(vendorOrders);
    } catch (error) {
        console.error("Error fetching vendor sales:", error);
        res.status(500).json({ message: "Failed to fetch sales", error: error.message });
    }
});

// ✅ Get Single Order
router.get("/:id", protect, getOrderById);
// ✅ Admin Delete Order
router.delete("/:id/admin", protect, adminOnly, deleteOrderByAdmin);

router.put('/:orderId/status', protect, updateOrderStatus); //route for updating order status








module.exports = router;
