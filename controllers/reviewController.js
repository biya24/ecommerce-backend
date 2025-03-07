const mongoose = require('mongoose');  // ✅ Import mongoose
const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc   Add a review for a product
// @route  POST /api/reviews
// @access Private (Only customers)
const addReview = async (req, res) => {
    try {
        console.log("Request Body:", req.body); // ✅ Debugging log

        if (req.user.role !== 'customer') {
            return res.status(403).json({ message: 'Only customers can add reviews' });
        }

        const { productId, rating, comment } = req.body;

        if (!productId || !rating) {
            return res.status(400).json({ message: 'Product ID and rating are required' });
        }

        // Check if the product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Create review
        const review = new Review({
            customerId: req.user._id,
            productId,
            rating,
            comment,
        });

        await review.save();
        res.status(201).json({ message: 'Review added successfully', review });

    } catch (error) {
        res.status(500).json({ message: 'Error adding review', error: error.message });
    }
};


// @desc   Get reviews for a product
// @route  GET /api/reviews/:productId
// @access Public
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        
        // ✅ Debugging: Log received productId
        console.log("Fetching reviews for product:", productId);

        // ✅ Convert productId to ObjectId
        const reviews = await Review.find({ productId: new mongoose.Types.ObjectId(productId) })
            .populate('customerId', 'name');

        if (reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this product' });
        }

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
};


module.exports = { addReview, getProductReviews };
