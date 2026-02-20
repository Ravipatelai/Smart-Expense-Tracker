const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        action: {
            type: String,
            enum: [
                "group_created",
                "expense_added",
                "expense_deleted",
                "member_added",
                "member_removed",
                "settlement_done",
                "invite_sent",
            ],
            required: true,
        },
        details: { type: String, default: "" },
    },
    { timestamps: true }
);

activityLogSchema.index({ groupId: 1, createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
