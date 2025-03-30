const express = require('express');
const {getUserOrders, placeOrder, getOrders, updateOrderStatus, getAllOrdersAdmin, getOrderById, deleteOrderByAdmin } = require('../controllers/orderController');
const { protect, adminOnly} = require('../middleware/authMiddleware');

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




module.exports = router;
