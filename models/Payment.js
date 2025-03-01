const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String },
    status: { type: String, enum: ['Success', 'Failed', 'Pending'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
