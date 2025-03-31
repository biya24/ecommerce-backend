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
        // Fetch all orders
        const orders = await Order.find();

        // Extract unique product IDs from all orders
        const productIds = orders.flatMap(order => order.items.map(item => item.productId));

        // Fetch products with their vendorId
        const products = await Product.find({ _id: { $in: productIds } }).select("_id vendorId");

        // Create a mapping of productId to vendorId
        const productVendorMap = {};
        products.forEach(product => {
            productVendorMap[product._id.toString()] = product.vendorId.toString();
        });

        // Filter orders where any item's product's vendorId matches the logged-in vendor's ID
        const vendorSales = orders.filter(order =>
            order.items.some(item => productVendorMap[item.productId.toString()] === req.user._id.toString())
        );

        res.json(vendorSales);
    } catch (error) {
        console.error("Error fetching vendor sales:", error);
        res.status(500).json({ message: "Failed to fetch sales" });
    }
});






module.exports = router;
