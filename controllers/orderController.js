const Order = require('../models/Order');

// @desc   Place a new order
// @route  POST /api/orders
// @access Private (Only customers)
const placeOrder = async (req, res) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({ message: 'Only customers can place orders' });
        }

        const { items, totalAmount } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in the order' });
        }

        const order = new Order({
            customerId: req.user._id,
            items,
            totalAmount,
            status: 'Pending',
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error placing order', error: error.message });
    }
};

// @desc   Get all orders (for customers and admins)
// @route  GET /api/orders
// @access Private
const getOrders = async (req, res) => {
    try {
        let orders;

        if (req.user.role === 'admin') {
            orders = await Order.find().populate('customerId', 'name email');
        } else {
            orders = await Order.find({ customerId: req.user._id });
        }

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};

module.exports = { placeOrder, getOrders };
