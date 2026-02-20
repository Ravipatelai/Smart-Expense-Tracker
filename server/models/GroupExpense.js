const mongoose = require("mongoose");

const groupExpenseSchema = new mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
        },
        title: { type: String, required: true, trim: true },
        amount: { type: Number, required: true, min: 0 },
        category: { type: String, default: "General" },
        notes: { type: String, default: "" },
        date: { type: Date, default: Date.now },
        paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        splitType: {
            type: String,
            enum: ["equal", "custom", "percentage"],
            default: "equal",
        },
        splits: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                amount: { type: Number, required: true, min: 0 },
                percentage: { type: Number, default: 0 },
            },
        ],
        isDeleted: { type: Boolean, default: false },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

groupExpenseSchema.index({ groupId: 1 });

module.exports = mongoose.model("GroupExpense", groupExpenseSchema);
