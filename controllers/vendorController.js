const Vendor = require('../models/Vendor');
const User = require('../models/User');

// @desc   Create a vendor profile
// @route  POST /api/vendors/
// @access Private (Only logged-in users)
const createVendor = async (req, res) => {
    const { storeName, storeDescription } = req.body;

    // Check if the user is already a vendor
    if (req.user.role !== 'vendor') {
        return res.status(403).json({ message: 'Only vendors can create a store' });
    }

    const vendor = new Vendor({
        userId: req.user._id,
        storeName,
        storeDescription,
        products: [],
    });

    const createdVendor = await vendor.save();
    res.status(201).json(createdVendor);
};

// @desc   Get all vendors
// @route  GET /api/vendors
// @access Public
const getVendors = async (req, res) => {
    const vendors = await Vendor.find();
    res.json(vendors);
};

module.exports = { createVendor, getVendors };
