const predefinedCategories = [
  "Food",
  "Travel",
  "Rent",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Salary",
  "Investment",
];

// @desc    Get all categories (predefined + user custom)
exports.getCategories = async (req, res) => {
  try {
    const userExpenses = await require("../models/Expense").find({ userId: req.user.id });
    const customCategories = [...new Set(userExpenses.map(e => e.category))]
      .filter(cat => !predefinedCategories.includes(cat));

    res.json({
      success: true,
      data: [...predefinedCategories, ...customCategories],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};
