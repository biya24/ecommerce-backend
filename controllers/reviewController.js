const Review = require('../models/Review');

// @desc   Add a review for a product
// @route  POST /api/reviews
// @access Private (Only customers)
const addReview = async (req, res) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({ message: 'Only customers can add reviews' });
        }

        const { productId, rating, comment } = req.body;

        if (!productId || !rating) {
            return res.status(400).json({ message: 'Product ID and rating are required' });
        }

        const review = new Review({
            customerId: req.user._id,
            productId,
            rating,
            comment,
        });

        const createdReview = await review.save();
        res.status(201).json(createdReview);
    } catch (error) {
        res.status(500).json({ message: 'Error adding review', error: error.message });
    }
};

module.exports = { addReview };
