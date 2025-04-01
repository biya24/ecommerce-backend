const express = require("express");
const Notification = require("../models/Notification");
const router = express.Router();

// Get vendor notifications
router.get("/:vendorId", async (req, res) => {
    try {
        const { vendorId } = req.params;
        const notifications = await Notification.find({ vendorId }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Error fetching notifications", error: error.message });
    }
});

// Mark notification as read
router.put("/mark-read/:id", async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: "Notification not found" });

        notification.isRead = true;
        await notification.save();
        res.json({ message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
