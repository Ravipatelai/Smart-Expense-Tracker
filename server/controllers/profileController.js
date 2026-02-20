const User = require("../models/User");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");



exports.changeEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const user = await User.findById(req.user.id);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.email = newEmail;
    await user.save();

    res.json({
      success: true,
      message: "Email updated successfully",
      data: { email: user.email },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Old password is incorrect" });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save OTP + expiry in DB
  user.resetOtp = otp;
  user.resetOtpExpire = Date.now() + 10 * 60 * 1000; // 10 mins
  await user.save();

  // Send OTP via email
  await sendEmail(user.email, "Password Reset OTP", `Your OTP is: ${otp}`);
  res.json({ message: "OTP sent to your email" });
};




exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2. Verify OTP
    if (
      !user.resetOtp ||
      user.resetOtp !== otp ||
      user.resetOtpExpires < Date.now()
    ) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // 3. Hash new password (thanks to pre-save hook it will auto hash)
    user.password = newPassword;

    // 4. Clear OTP fields
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;

    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



exports.logout = async (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};