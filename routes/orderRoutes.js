const express = require('express');
const { placeOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, placeOrder);
router.get('/', protect, getOrders);
router.put('/:orderId/status', protect, updateOrderStatus); //route for updating order status


module.exports = router;
