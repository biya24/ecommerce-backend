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
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { isRead: true });
        res.json({ message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Error updating notification", error: error.message });
    }
});

module.exports = router;
