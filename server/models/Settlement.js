const mongoose = require("mongoose");

const settlementSchema = new mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
        },
        payerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amount: { type: Number, required: true, min: 0 },
        date: { type: Date, default: Date.now },
        paymentMode: {
            type: String,
            enum: ["cash", "upi", "bank", "other"],
            default: "cash",
        },
        proof: { type: String, default: "" },
        notes: { type: String, default: "" },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

settlementSchema.index({ groupId: 1 });

module.exports = mongoose.model("Settlement", settlementSchema);
