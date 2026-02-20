const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        type: {
            type: String,
            enum: ["trip", "flat", "friends", "custom"],
            default: "friends",
        },
        currency: { type: String, default: "INR" },
        groupImage: { type: String, default: "" },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        members: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                role: {
                    type: String,
                    enum: ["admin", "member"],
                    default: "member",
                },
                isActive: { type: Boolean, default: true },
                joinedAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

groupSchema.index({ "members.userId": 1 });

module.exports = mongoose.model("Group", groupSchema);
