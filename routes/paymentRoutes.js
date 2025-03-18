const express = require("express");
const Stripe = require("stripe");
require("dotenv").config();
const { updateOrderAfterPayment } = require("../controllers/paymentController");




const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
});

router.post("/pay", async (req, res) => {
    try {
        const { orderId, amount, currency } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" }); // ✅ Ensure order ID is present
        }

        if (!amount || !currency) {
            return res.status(400).json({ message: "Amount and Currency are required" }); // ✅ Check for missing fields
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: "Your Order",
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: "http://localhost:5173/cart",
            metadata: { orderId }, // ✅ Store Order ID in metadata
        });

        res.json({ url: session.url, session_id: session.id });

    } catch (error) {
        console.error("Stripe Payment Error:", error);
        res.status(500).json({ message: "Payment failed", error: error.message });
    }
});


// ✅ Endpoint to confirm payment success and update order

router.post("/success", updateOrderAfterPayment);
// router.post("/success", async (req, res) => {
//     try {
//         const { session_id } = req.body;

//         if (!session_id) {
//             return res.status(400).json({ message: "Session ID is required" });
//         }

//         // ✅ Retrieve session details from Stripe
//         const session = await stripe.checkout.sessions.retrieve(session_id);

//         if (session.payment_status !== "paid") {
//             return res.status(400).json({ message: "Payment not completed" });
//         }

//         const orderId = session.metadata.order_id; // Ensure you send order_id in metadata

//         // ✅ Find and update the order status
//         const order = await Order.findById(orderId);
//         if (!order) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         order.status = "Paid";
//         await order.save();

//         res.json({ message: "Order status updated successfully", order });
//     } catch (error) {
//         console.error("Order Update Error:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });


module.exports = router;
