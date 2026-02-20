const User = require("../models/User");

// ─── SEARCH USERS BY EMAIL ───
exports.searchByEmail = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email || email.trim().length < 2) {
            return res.status(400).json({ success: false, message: "Provide at least 2 characters" });
        }

        const regex = new RegExp(email.trim(), "i");
        const users = await User.find({ email: regex })
            .select("name email _id")
            .limit(10);

        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
