const User = require('../models/User'); // ✅ Import User model
const bcrypt = require('bcryptjs'); // ✅ Hash passwords
const generateToken = require('../utils/generateToken');
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// @desc   Register new user
// @route  POST /api/users/signup
// @access Public

// const registerUser = async (req, res) => {
//     try {
//         const { name, email, password, role = "customer" } = req.body;

//         console.log("🟢 Step 1: Received Plain Password ->", password);

//         // ✅ DO NOT hash the password manually, let the schema handle it
//         const user = await User.create({
//             name,
//             email,
//             password, // ❌ No bcrypt.hash() here!
//             role,
//         });

//         console.log("🟢 Step 2: Hashed Password Stored in MongoDB ->", user.password);

//         res.status(201).json({
//             _id: user._id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             token: generateToken(user._id),
//         });

//     } catch (error) {
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// };

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const normalizedEmail = email.toLowerCase();
        let user = await User.findOne({ email: normalizedEmail });

        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        // ✅ Hash password before saving
        //const salt = await bcrypt.genSalt(10);
       // const hashedPassword = await bcrypt.hash(password, salt);

        // ✅ Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");

        user = new User({
            name,
            email: normalizedEmail,
            password, // ✅ Store hashed password
            role,
            verificationToken,
        });

        await user.save();

        // ✅ Send verification email
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        await sendVerificationEmail(user.email, verificationLink);

        res.status(201).json({
            message: "Registration successful! A verification email has been sent. Please check your inbox.",
        });

    } catch (error) {
        console.error("❌ Registration Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

  
  // ✅ Email sending function
  const sendVerificationEmail = async (email, link) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Bazario Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verify Your Email - Bazario",
            html: `
                <p>Hi,</p>
                <p>Thank you for registering on Bazario! Please verify your email by clicking the link below:</p>
                <a href="${link}" style="background-color:#4CAF50; color:white; padding:10px; text-decoration:none; display:inline-block; border-radius:5px;">Verify Email</a>
                <p>If you did not register, please ignore this email.</p>
            `,
        });

        console.log("✅ Verification email sent to:", email);
    } catch (error) {
        console.error("❌ Error sending verification email:", error);
    }
};


const verifyEmail = async (req, res) => {
    const { token } = req.params;
    console.log("Received token:", token);  // ✅ Debugging line

    try {
        // Find user by verification token
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Mark user as verified
        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        res.json({ message: "Email successfully verified!" });
    } catch (error) {
        console.error("Email verification error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const resendVerificationEmail = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found." });

        if (user.isVerified) return res.status(400).json({ message: "Email is already verified." });

        // Generate new token
        user.verificationToken = crypto.randomBytes(32).toString("hex");
        await user.save();

        // **Use correct frontend URL**
        const frontendUrl = process.env.FRONTEND_URL || "https://bazario-frontend.vercel.app";
        const verificationLink = `${frontendUrl}/verify-email/${user.verificationToken}`;

        await sendVerificationEmail(user.email, verificationLink);

        res.status(200).json({ message: "Verification email resent successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong, try again." });
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
        console.log("🔍 Checking isVerified for user:", user.email, "->", user.isVerified);
        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify your email before logging in" });
          }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
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


// @desc   Update user profile
// @route  PUT /api/users/profile
// @access Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // ✅ Update name if provided
        if (req.body.name) user.name = req.body.name;

        // ✅ Update email if provided (check if already taken)
        if (req.body.email && req.body.email !== user.email) {
            const emailExists = await User.findOne({ email: req.body.email });
            if (emailExists) {
                return res.status(400).json({ message: "Email already in use" });
            }
            user.email = req.body.email;
        }

        // ✅ Update password if provided 
        if (req.body.password) {
            user.password = req.body.password; // This will be hashed automatically in `pre('save')`
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            token: generateToken(updatedUser._id), // ✅ Generate new token after update
        });
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// ✅ Get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ✅ Promote user to vendor
const promoteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.role = "vendor";
        await user.save();
        res.json({ message: "User promoted to vendor", user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc   Demote a vendor back to customer
// @route  PUT /api/users/:id/demote
// @access Private (Admin only)
const demoteUserToCustomer = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== "vendor") {
            return res.status(400).json({ message: "Only vendors can be demoted" });
        }

        user.role = "customer"; // ✅ Change role back to customer
        await user.save();

        res.json({ message: "User demoted to customer", user });
    } catch (error) {
        console.error("Demotion Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// ✅ Delete user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


module.exports = { registerUser, sendVerificationEmail, verifyEmail, resendVerificationEmail, loginUser, getUserProfile, updateUserProfile, getUsers, promoteUser,demoteUserToCustomer , deleteUser };
