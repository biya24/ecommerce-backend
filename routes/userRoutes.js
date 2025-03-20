const express = require('express');
const { getUsers, promoteUser, demoteUserToCustomer , deleteUser, registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get("/", protect, adminOnly, getUsers); // ✅ Get all users
router.put("/:id/promote", protect, adminOnly, promoteUser); // ✅ Promote user
router.put("/:id/demote", protect, adminOnly, demoteUserToCustomer); // ✅ Add Demotion Route
router.delete("/:id", protect, adminOnly, deleteUser); // ✅ Delete user
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put("/profile", protect, updateUserProfile); // ✅ Profile Update Route


module.exports = router;
