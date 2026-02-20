const Income = require('../models/Income');

// Add income
exports.addIncome = async (req, res) => {
  try {
    const income = await Income.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, message: "Income added", data: income });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all incomes of a user
exports.getIncomes = async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user.id }).sort({ date: -1 });
    res.status(200).json({ success: true, data: incomes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get total income by month
exports.getMonthlyIncome = async (req, res) => {
  try {
    const { month, year } = req.query;
    const start = new Date(`${year}-${month}-01`);
    const end = new Date(`${year}-${month}-31`);

    const result = await Income.aggregate([
      { $match: { userId: req.user._id, date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalIncome = result.length > 0 ? result[0].total : 0;
    res.status(200).json({ success: true, totalIncome });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete income
exports.deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!income) return res.status(404).json({ success: false, message: 'Income not found' });
    res.status(200).json({ success: true, message: 'Income deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
