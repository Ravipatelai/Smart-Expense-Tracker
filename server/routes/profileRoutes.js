const express = require("express");
const { changeEmail, changePassword, forgotPassword, resetPassword, logout } = require("../controllers/profileController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.put("/change-email", protect, changeEmail);
router.put("/change-password", protect, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", protect, logout);

module.exports = router;