const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    description: {
      type: String,
    },

    // 🔥 NEW — payment related
    paymentMethod: {
      type: String,
      enum: ["UPI", "CASH", "CARD", "BANK"],
      default: "UPI",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
    },

    // Optional but useful later
    upiRefId: {
      type: String, // can be filled manually later
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
