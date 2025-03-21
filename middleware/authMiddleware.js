const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;
    console.log("🔹 Checking for Authorization Header...");

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            console.log("🔹 Token Found:", token);

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                console.log("❌ User Not Found");
                return res.status(401).json({ message: "Not authorized, user not found" });
            }

            console.log("✅ Authenticated User:", req.user);
            next();
        } catch (error) {
            console.error("❌ Token Verification Failed:", error);
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    } else {
        console.log("❌ No Authorization Header Provided");
        return res.status(401).json({ message: "Not authorized, no token provided" });
    }
};


// ✅ Middleware for Vendors Only
const vendorOnly = (req, res, next) => {
    console.log("🔹 Checking Vendor Role:", req.user?.role || "No User"); // ✅ Debugging Log

    if (!req.user || req.user.role !== "vendor") {
        return res.status(403).json({ message: "Access denied. Only vendors are allowed." });
    }

    next();
};

// ✅ Middleware for Admins Only
const adminOnly = (req, res, next) => {
    console.log("🔹 Checking Admin Role:", req.user?.role || "No user found");

    if (req.user || req.user.role === "admin") {
        console.log("✅ Admin Access Granted");
        next();
    } else {
        console.log("❌ Admin Access Denied");
        res.status(403).json({ message: "Access Denied: Admins only" });
    }
};



module.exports = { protect, vendorOnly, adminOnly };
