const mongoose = require('mongoose'); 
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc   Process a payment
// @route  POST /api/payments
// @access Private (Only customers)
const processPayment = async (req, res) => {
    try {
        const { orderId, amount, paymentMethod } = req.body;

        const order = await Order.findById(new mongoose.Types.ObjectId(orderId));


        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.customerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only pay for your own orders' });
        }

        // // ✅ Fetch vendorId from the first product in the order
        // const product = await Product.findById(order.items[0].productId);
        // ✅ Convert productId to ObjectId before searching
        const productId = new mongoose.Types.ObjectId(order.items[0].productId);
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const payment = new Payment({
            orderId,
            customerId: req.user._id,
            vendorId: product.vendorId, // Assuming vendorId is linked in the product
            amount,
            paymentMethod,
            status: 'Success',
        });

        await payment.save();
        order.status = 'Paid';
        await order.save();

        res.status(201).json({ message: 'Payment successful', payment });
    } catch (error) {
        res.status(500).json({ message: 'Payment processing failed', error: error.message });
    }
};

module.exports = { processPayment };
