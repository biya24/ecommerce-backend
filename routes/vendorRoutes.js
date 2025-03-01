const express = require('express');
const { createVendor, getVendors } = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createVendor);
router.get('/', getVendors);

module.exports = router;
