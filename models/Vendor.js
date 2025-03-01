const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Vendor user
    storeName: { type: String, required: true },
    storeDescription: { type: String },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Vendor's products
    balance: { type: Number, default: 0 }, // Earnings balance
}, { timestamps: true });

module.exports = mongoose.model('Vendor', VendorSchema);
