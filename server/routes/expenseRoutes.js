const express = require("express");
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary,
  initiateUpiExpense,
  confirmUpiExpense,
} = require("../controllers/expenseController");

const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", protect, getTransactions);

router.get("/summary", protect, getMonthlySummary);

router.post("/", protect, addTransaction);

router.put("/:id", protect, updateTransaction);

router.delete("/:id", protect, deleteTransaction);

router.post("/upi/initiate", protect, initiateUpiExpense);

router.patch("/upi/confirm/:id", protect, confirmUpiExpense);

module.exports = router;
