const Order = require('../models/Order');
const User = require('../models/User'); // ✅ Import User model to get customer email
const sendEmail = require('../config/email');
const Product = require('../models/Product');

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

        // ✅ Fetch customer details
        const customer = await User.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // ✅ Generate Order Items HTML
        let orderItemsHtml = "";
        items.forEach(item => {
            orderItemsHtml += `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.productId}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">$${item.price}</td>
                </tr>
            `;
        });

        // ✅ Define Order Confirmation Email with HTML Styling
        const emailSubject = "🎉 Order Confirmation - Thank You for Your Purchase!";
        const emailText = `Thank you for your order, ${customer.name}! Your order ID is ${createdOrder._id}. Total Amount: $${createdOrder.totalAmount}. We'll notify you when your order is shipped!`;

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
                <h2 style="color: #4CAF50; text-align: center;">Thank You for Your Order! 🎉</h2>
                <p>Hello <strong>${customer.name}</strong>,</p>
                <p>We have received your order <strong>(Order ID: ${createdOrder._id})</strong>.</p>
                <p><strong>Total Amount:</strong> $${createdOrder.totalAmount}</p>
                <h3>Order Details:</h3>
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="background-color: #4CAF50; color: white;">
                            <th style="border: 1px solid #ddd; padding: 8px;">Product ID</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderItemsHtml}
                    </tbody>
                </table>
                <p>📦 We will notify you when your order is shipped!</p>
                <p>For any inquiries, contact our support team.</p>
                <p style="font-size: 12px; color: #888; text-align: center;">Thank you for shopping with us! 🚀</p>
            </div>
        `;

        // ✅ Send email with HTML content
        await sendEmail(customer.email, emailSubject, emailText, emailHtml);

        res.status(201).json({ message: "Order placed successfully, confirmation email sent!", order: createdOrder });

    } catch (error) {
        console.error("Order Placement Error:", error);
        res.status(500).json({ message: 'Error placing order', error: error.message });
    }
};

// ✅ Get all orders (For admin/customers)
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

// ✅ Get all orders for the logged-in user
const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders", error: error.message });
    }
};

// ✅ Update order status (Shipped, Delivered, Canceled)
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        // ✅ Validate status
        const validStatuses = ["Pending", "Shipped", "Delivered", "Canceled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status update" });
        }

        const order = await Order.findById(orderId).populate('customerId', 'name email');
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.status = status;
        await order.save();

        // ✅ Fetch customer email
        const customerEmail = order.customerId.email;

        // ✅ Define email content
        let emailSubject = `Order ${status} Notification`;
        let emailText = `Hello ${order.customerId.name},\n\nYour order (ID: ${order._id}) has been updated to "${status}".`;

        let trackingUrl = `https://yourfrontend.vercel.app/track-order/${order._id}`;

        let emailHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
                <h2 style="color: #4CAF50;">Order ${status} Notification</h2>
                <p>Hello <strong>${order.customerId.name}</strong>,</p>
                <p>Your order <strong>(ID: ${order._id})</strong> has been updated to "<strong>${status}</strong>".</p>
        `;

        if (status === "Shipped") {
            emailText += `\n\nYour order is on its way! 🚚 Track your order here: ${trackingUrl}`;
            emailHtml += `
                <p>🚚 Your order is on its way! <a href="${trackingUrl}" style="color: #4CAF50; font-weight: bold;">Track your order here</a>.</p>
            `;
        } else if (status === "Delivered") {
            emailHtml += `<p>🎉 Your order has been successfully delivered!</p>`;
        } else if (status === "Canceled") {
            emailHtml += `<p>⚠️ Your order has been canceled. If this was a mistake, please contact support.</p>`;
        }

        emailHtml += `
                <p>Thank you for shopping with us!</p>
                <p style="font-size: 12px; color: #888;">If you have any questions, contact our support team.</p>
            </div>
        `;

        // ✅ Send email notification with both plain text & HTML
        await sendEmail(customerEmail, emailSubject, emailText, emailHtml);

        res.json({ message: `Order updated to ${status} and email sent!`, order });

    } catch (error) {
        console.error("Order Status Update Error:", error);
        res.status(500).json({ message: 'Error updating order status', error: error.message });
    }
};

const getAllOrdersAdmin = async (req, res) => {
    try {
        console.log("🔹 Admin fetching all orders:", req.user);

        const orders = await Order.find()
            .populate({
                path: "customerId", // ✅ Correct reference
                model: "User",
                select: "name email" // ✅ Populate only name & email
            })
            .populate({
                path: "items.productId", // ✅ Correct reference
                model: "Product",
                select: "name price"
            });

        if (!orders.length) {
            return res.status(404).json({ message: "No orders found" });
        }

        res.json(orders);
    } catch (error) {
        console.error("❌ Error fetching orders:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

module.exports = { getAllOrdersAdmin };

module.exports = { getUserOrders,placeOrder, getOrders, updateOrderStatus, getAllOrdersAdmin };
