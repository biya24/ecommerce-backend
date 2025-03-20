const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ✅ Reference 'User' instead of 'Vendor'
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { type: String },
    images: [{ type: String }], // URLs for product images
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
