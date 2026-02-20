const Expense = require("../models/Expense");
const Income = require("../models/Income");

// @desc    Add a new transaction
exports.addTransaction = async (req, res) => {
  try {
    const { type, category, amount, date, description } = req.body;

    const newExpense = new Expense({
      userId: req.user.id,
      type,
      category,
      amount,
      date,
      description,
    });

    await newExpense.save();
    res.status(201).json({ success: true, message: "Transaction added", data: newExpense });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};


// @desc    Get all transactions of a user
exports.getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const filter = { userId: req.user.id };

    // Filter by date range
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });

    res.json({ success: true, data: expenses });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};


// @desc    Update a transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.json({ success: true, message: "Transaction updated", data: updatedExpense });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};


// @desc    Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Expense.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.json({ success: true, message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};


// new - 23-11-25

exports.getMonthlySummary = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and Year are required",
      });
    }

    const start = new Date(`${year}-${month}-01`);
    const end = new Date(`${year}-${month}-31`);

    // -------- Monthly Income --------
    const monthlyIncome = await Income.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalIncome =
      monthlyIncome.length > 0 ? monthlyIncome[0].total : 0;

    // -------- Monthly Expense --------
    const monthlyExpense = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: "expense",
          date: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalExpense =
      monthlyExpense.length > 0 ? monthlyExpense[0].total : 0;

    // -------- All monthly transactions --------
    const transactions = await Expense.find({
      userId: req.user._id,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense,
      transactions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// new methods 19/12/25


/* ======================================================
   1️⃣ INITIATE UPI PAYMENT (CREATE PENDING EXPENSE)
   ====================================================== */
exports.initiateUpiExpense = async (req, res) => {
  try {
    const { amount, category, description } = req.body;

    if (!amount || !category) {
      return res.status(400).json({
        success: false,
        message: "Amount and category are required",
      });
    }

    // ✅ Create expense as PENDING
    const expense = await Expense.create({
      userId: req.user.id,
      type: "expense",
      category,
      amount,
      description,
      paymentMethod: "UPI",
      paymentStatus: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Expense created as pending",
      data: {
        expenseId: expense._id,
        amount,
      },
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


/* ======================================================
   2️⃣ CONFIRM OR FAIL UPI PAYMENT
   ====================================================== */
exports.confirmUpiExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, upiRefId } = req.body;

    if (!["confirmed", "failed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      {
        paymentStatus: status,
        upiRefId,
      },
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.json({
      success: true,
      message: "Payment status updated",
      data: expense,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

/* ======================================================
   3️⃣ ADD MANUAL TRANSACTION (CASH / CARD / ETC)
   ====================================================== */
exports.addTransaction = async (req, res) => {
  try {
    const { type, category, amount, date, description, paymentMethod } =
      req.body;

    const transaction = await Expense.create({
      userId: req.user.id,
      type,
      category,
      amount,
      date,
      description,
      paymentMethod: paymentMethod || "CASH",
      paymentStatus: "confirmed",
    });

    res.status(201).json({
      success: true,
      message: "Transaction added",
      data: transaction,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

/* ======================================================
   4️⃣ GET ALL TRANSACTIONS
   ====================================================== */
exports.getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, category, status } = req.query;

    const filter = { userId: req.user.id };

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.paymentStatus = status;
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });

    res.json({
      success: true,
      data: expenses,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

/* ======================================================
   5️⃣ UPDATE TRANSACTION (SAFE)
   ====================================================== */
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      message: "Transaction updated",
      data: updatedExpense,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

/* ======================================================
   6️⃣ DELETE TRANSACTION
   ====================================================== */
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Expense.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      message: "Transaction deleted",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

/* ======================================================
   7️⃣ MONTHLY SUMMARY (CONFIRMED ONLY)
   ====================================================== */
exports.getMonthlySummary = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and Year are required",
      });
    }

    const start = new Date(`${year}-${month}-01`);
    const end = new Date(`${year}-${month}-31`);

    // Monthly Income
    const monthlyIncome = await Income.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalIncome = monthlyIncome[0]?.total || 0;

    // Monthly Expense (ONLY CONFIRMED)
    const monthlyExpense = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: "expense",
          paymentStatus: "confirmed",
          date: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalExpense = monthlyExpense[0]?.total || 0;

    const transactions = await Expense.find({
      userId: req.user._id,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense,
      transactions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
