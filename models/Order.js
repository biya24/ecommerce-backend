const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    deliveryAddress: {
        fullName: { type: String, required: true },
        houseName: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        district: { type: String, required: true },
        pin: { type: String, required: true },
        mobile: { type: String, required: true },
        addressType: { type: String, enum: ["home", "work"], required: true }
    },
    status: { type: String, enum: ['Pending', 'Shipped', 'Delivered', 'Canceled', 'Paid', , 'Returned'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);

