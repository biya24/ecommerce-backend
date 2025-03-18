const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        } catch (error) {
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    } else {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

const vendorOnly = (req, res, next) => {
    console.log("🔹 Checking Vendor:", req.user); // ✅ Debugging Log

    if (!req.user || req.user.role !== "vendor") {
        return res.status(403).json({ message: "Access denied. Only vendors are allowed." });
    }

    next();
};


// ✅ Admin Only Middleware
const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admins only" });
    }
    next();
};


module.exports = { protect, vendorOnly, adminOnly };
