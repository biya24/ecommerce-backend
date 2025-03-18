const express = require('express');
const {getUserOrders, placeOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, placeOrder);
router.get('/', protect, getOrders);
router.put('/:orderId/status', protect, updateOrderStatus); //route for updating order status

// ✅ Fetch logged-in user's orders
router.get("/my-orders", protect, getUserOrders);


module.exports = router;
