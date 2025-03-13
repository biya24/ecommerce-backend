const User = require('../models/User'); // ✅ Import User model
const bcrypt = require('bcryptjs'); // ✅ Hash passwords
const generateToken = require('../utils/generateToken');

// @desc   Register new user
// @route  POST /api/users/signup
// @access Public

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role = "customer" } = req.body;

        console.log("🟢 Step 1: Received Plain Password ->", password);

        // ✅ DO NOT hash the password manually, let the schema handle it
        const user = await User.create({
            name,
            email,
            password, // ❌ No bcrypt.hash() here!
            role,
        });

        console.log("🟢 Step 2: Hashed Password Stored in MongoDB ->", user.password);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc   Login user
// @route  POST /api/users/login
// @access Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            console.log("❌ User not found:", email);
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // ✅ Debugging: Compare password
        console.log("🟢 Step 4: Entered Password from Frontend ->", password);
        console.log("🟢 Step 5: Hashed Password from MongoDB ->", user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("🟢 Step 6: Password Match Result ->", isMatch);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};





// @desc   Get user profile
// @route  GET /api/users/profile
// @access Private
const getUserProfile = async (req, res) => {
    try {
        // ✅ Use `req.user._id` instead of `req.user.id`
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { registerUser, loginUser, getUserProfile };
