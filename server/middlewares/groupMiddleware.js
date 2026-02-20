const Group = require("../models/Group");

/**
 * Middleware: verify the logged-in user is a member of the group.
 * Attaches `req.group` for downstream handlers.
 */
const isMember = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: "Group not found" });
        }

        const member = group.members.find(
            (m) => m.userId.toString() === req.user._id.toString()
        );

        if (!member) {
            return res.status(403).json({ success: false, message: "You are not a member of this group" });
        }

        req.group = group;
        req.memberRole = member.role;
        next();
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

/**
 * Middleware: verify the logged-in user is an admin of the group.
 * Must be used AFTER isMember.
 */
const isAdmin = (req, res, next) => {
    if (req.memberRole !== "admin") {
        return res.status(403).json({ success: false, message: "Only group admins can perform this action" });
    }
    next();
};

module.exports = { isMember, isAdmin };
