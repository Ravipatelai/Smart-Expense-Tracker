const Group = require("../models/Group");
const GroupExpense = require("../models/GroupExpense");
const Settlement = require("../models/Settlement");
const ActivityLog = require("../models/ActivityLog");

// ─── CREATE GROUP ───
exports.createGroup = async (req, res) => {
    try {
        const { name, type, currency, groupImage } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Group name is required" });
        }

        const group = await Group.create({
            name,
            type: type || "friends",
            currency: currency || "INR",
            groupImage: groupImage || "",
            createdBy: req.user._id,
            members: [{ userId: req.user._id, role: "admin", isActive: true }],
        });

        await ActivityLog.create({
            groupId: group._id,
            userId: req.user._id,
            action: "group_created",
            details: `Created group "${name}"`,
        });

        res.status(201).json({ success: true, message: "Group created", data: group });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

// ─── LIST MY GROUPS ───
exports.getMyGroups = async (req, res) => {
    try {
        const groups = await Group.find({ "members.userId": req.user._id })
            .populate("members.userId", "name email")
            .sort({ updatedAt: -1 });

        res.json({ success: true, data: groups });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

// ─── GET GROUP DETAILS ───
exports.getGroupById = async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId)
            .populate("members.userId", "name email")
            .populate("createdBy", "name email");

        if (!group) {
            return res.status(404).json({ success: false, message: "Group not found" });
        }

        res.json({ success: true, data: group });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

// ─── GET GROUP MEMBERS ───
exports.getGroupMembers = async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId)
            .populate("members.userId", "name email");

        if (!group) {
            return res.status(404).json({ success: false, message: "Group not found" });
        }

        res.json({ success: true, data: group.members });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

// ─── UPDATE GROUP (ADMIN) ───
exports.updateGroup = async (req, res) => {
    try {
        const { name, type, currency, groupImage } = req.body;
        const group = req.group;

        if (name) group.name = name;
        if (type) group.type = type;
        if (currency) group.currency = currency;
        if (groupImage !== undefined) group.groupImage = groupImage;

        await group.save();

        res.json({ success: true, message: "Group updated", data: group });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

// ─── DELETE GROUP (ADMIN) ───
exports.deleteGroup = async (req, res) => {
    try {
        const groupId = req.params.groupId;

        await GroupExpense.deleteMany({ groupId });
        await Settlement.deleteMany({ groupId });
        await ActivityLog.deleteMany({ groupId });
        await Group.findByIdAndDelete(groupId);

        res.json({ success: true, message: "Group and all related data deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

// ─── REMOVE MEMBER (ADMIN) ───
exports.removeMember = async (req, res) => {
    try {
        const { memberId } = req.params;
        const group = req.group;

        const admins = group.members.filter((m) => m.role === "admin");
        const isRemovingSelf = memberId === req.user._id.toString();
        if (isRemovingSelf && admins.length === 1) {
            return res.status(400).json({
                success: false,
                message: "Cannot remove the only admin. Transfer admin role first.",
            });
        }

        const removedMember = group.members.find((m) => m.userId.toString() === memberId);
        group.members = group.members.filter((m) => m.userId.toString() !== memberId);
        await group.save();

        await ActivityLog.create({
            groupId: group._id,
            userId: req.user._id,
            action: "member_removed",
            details: `Removed a member from the group`,
        });

        res.json({ success: true, message: "Member removed", data: group });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
