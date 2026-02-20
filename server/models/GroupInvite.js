const mongoose = require("mongoose");

const groupInviteSchema = new mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
        },
        invitedEmail: { type: String, required: true, lowercase: true, trim: true },
        invitedUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
        },
    },
    { timestamps: true }
);

groupInviteSchema.index({ groupId: 1 });
groupInviteSchema.index({ invitedEmail: 1 });

module.exports = mongoose.model("GroupInvite", groupInviteSchema);
