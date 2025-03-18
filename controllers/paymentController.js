const mongoose = require('mongoose'); 
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Product = require('../models/Product');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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

const createCheckoutSession = async (req, res) => {
    try {
        const { orderId } = req.body; // ✅ Get orderId from request

        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" });
        }

        // ✅ Find the order in the database
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // ✅ Create a Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            success_url: "http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url: "http://localhost:5173/cart",
            metadata: {
                orderId: order._id.toString(), // ✅ Store Order ID in metadata
            },
            line_items: order.items.map(item => ({
                price_data: {
                    currency: "cad",
                    product_data: {
                        name: item.productId, // ✅ Replace with actual product name if needed
                    },
                    unit_amount: item.price * 100, // Convert to cents
                },
                quantity: item.quantity,
            })),
        });

        res.json({ url: session.url, session_id: session.id }); // ✅ Send session URL back to frontend
    } catch (error) {
        console.error("❌ Stripe Session Error:", error);
        res.status(500).json({ message: "Payment failed", error: error.message });
    }
};

// @desc   Handle successful payment & update order
// @route  POST /api/payments/success
// @access Public (Stripe Webhook)
const updateOrderAfterPayment = async (req, res) => {
    try {
        const { session_id } = req.body;

        if (!session_id) {
            return res.status(400).json({ message: "Session ID is required" });
        }

        // ✅ Retrieve session details from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status !== "paid") {
            return res.status(400).json({ message: "Payment not completed" });
        }

        const orderId = session.metadata.orderId; // ✅ Get orderId from Stripe metadata

        // ✅ Find and update the order status
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.status = "Paid"; // ✅ Update order status to "Paid"
        await order.save();

        res.json({ message: "Order status updated successfully", order });
    } catch (error) {
        console.error("Order Update Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { processPayment, createCheckoutSession ,updateOrderAfterPayment };
