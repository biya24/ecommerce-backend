const mongoose = require("mongoose");
const User = require("./models/User"); // ✅ Ensure correct path
require("dotenv").config();
const connectDB = require("./config/db"); // ✅ Ensure correct path

connectDB();

const createAdmin = async () => {
    try {
        // ✅ Define email & password BEFORE using them
        const email = "admin@example.com"; // Change as needed
        const password = "123456"; // Plain text password

        // ✅ Check if admin already exists
        const adminExists = await User.findOne({ email });
        if (adminExists) {
            console.log("⚠️ Admin user already exists.");
            process.exit(1);
        }

        // ✅ No manual hashing! Mongoose will hash it
        const adminUser = await User.create({
            name: "Admin User",
            email, // ✅ Defined correctly
            password, // ✅ Plain text, Mongoose will hash it
            role: "admin",
        });

        console.log("✅ Admin user created successfully:", adminUser);
        process.exit();
    } catch (error) {
        console.error("❌ Error creating admin user:", error.message);
        process.exit(1);
    }
};

createAdmin();
