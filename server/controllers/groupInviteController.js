const GroupInvite = require("../models/GroupInvite");
const Group = require("../models/Group");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");

// ─── SEND INVITE (ADMIN) ───
exports.sendInvite = async (req, res) => {
    try {
        const { email } = req.body;
        const groupId = req.params.groupId;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const group = req.group;
        const user = await User.findOne({ email: normalizedEmail });

        if (user) {
            const alreadyMember = group.members.some(
                (m) => m.userId.toString() === user._id.toString()
            );
            if (alreadyMember) {
                return res.status(400).json({ success: false, message: "User is already a member" });
            }
        }

        // Check for existing pending invite
        const existing = await GroupInvite.findOne({
            groupId,
            invitedEmail: normalizedEmail,
            status: "pending",
        });

        if (existing) {
            return res.status(400).json({ success: false, message: "Invite already sent to this email" });
        }

        const invite = await GroupInvite.create({
            groupId,
            invitedEmail: normalizedEmail,
            invitedUserId: user ? user._id : null,
            invitedBy: req.user._id,
        });

        await ActivityLog.create({
            groupId,
            userId: req.user._id,
            action: "invite_sent",
            details: `Invited ${normalizedEmail}`,
        });

        // Return enriched invite with user info
        const populatedInvite = await invite.populate([
            { path: "invitedUserId", select: "name email" },
            { path: "invitedBy", select: "name email" },
        ]);

        res.status(201).json({
            success: true,
            message: user ? "Invite sent to existing user" : "Invite sent (user not registered yet)",
            data: populatedInvite,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

// ─── GET MY PENDING INVITES ───
exports.getMyInvites = async (req, res) => {
    try {
        const invites = await GroupInvite.find({
            invitedEmail: req.user.email.toLowerCase(),
            status: "pending",
        })
            .populate("groupId", "name type currency")
            .populate("invitedBy", "name email")
            .sort({ createdAt: -1 });

        res.json({ success: true, data: invites });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

// ─── ACCEPT INVITE ───
exports.acceptInvite = async (req, res) => {
    try {
        const invite = await GroupInvite.findById(req.params.inviteId);

        if (!invite || invite.status !== "pending") {
            return res.status(404).json({ success: false, message: "Invite not found or already processed" });
        }

        if (invite.invitedEmail !== req.user.email.toLowerCase()) {
            return res.status(403).json({ success: false, message: "This invite is not for you" });
        }

        const group = await Group.findById(invite.groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: "Group no longer exists" });
        }

        group.members.push({ userId: req.user._id, role: "member", isActive: true });
        await group.save();

        invite.status = "accepted";
        await invite.save();

        await ActivityLog.create({
            groupId: group._id,
            userId: req.user._id,
            action: "member_added",
            details: `${req.user.name} joined the group`,
        });

        res.json({ success: true, message: "Invite accepted. You are now a member!", data: group });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

// ─── REJECT INVITE ───
exports.rejectInvite = async (req, res) => {
    try {
        const invite = await GroupInvite.findById(req.params.inviteId);

        if (!invite || invite.status !== "pending") {
            return res.status(404).json({ success: false, message: "Invite not found or already processed" });
        }

        if (invite.invitedEmail !== req.user.email.toLowerCase()) {
            return res.status(403).json({ success: false, message: "This invite is not for you" });
        }

        invite.status = "rejected";
        await invite.save();

        res.json({ success: true, message: "Invite rejected" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
