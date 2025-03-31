const express = require('express');
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
// ✅ Get Single Order
router.get("/:id", protect, getOrderById);
// ✅ Admin Delete Order
router.delete("/:id/admin", protect, adminOnly, deleteOrderByAdmin);

router.put('/:orderId/status', protect, updateOrderStatus); //route for updating order status

router.get("/vendor", protect, async (req, res) => {
    try {
        console.log("Authenticated Vendor ID:", req.user._id); // ✅ Debugging

        // Step 1: Find products that belong to the vendor
        const vendorProducts = await Product.find({ vendorId: req.user._id }).select("_id");
        const vendorProductIds = vendorProducts.map((product) => product._id); // Extract product IDs

        console.log("Vendor's Products:", vendorProductIds); // ✅ Debugging

        // Step 2: Find orders containing vendor's products
        const sales = await Order.find({ "items.productId": { $in: vendorProductIds } })
            .populate("customerId", "name email"); // ✅ Populate customer details

        console.log("Sales Fetched:", sales); // ✅ Debugging
        res.json(sales);
    } catch (error) {
        console.error("Error fetching sales:", error.message);
        res.status(500).json({ message: "Failed to fetch sales" });
    }
});




module.exports = router;
