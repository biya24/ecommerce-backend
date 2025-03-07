const express = require('express');
const { addReview, getProductReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, addReview);
router.get('/:productId', getProductReviews); // ✅ Public route to get product reviews

module.exports = router;
