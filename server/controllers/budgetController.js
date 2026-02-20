const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
// Corrected import to use the client directly, not a nonexistent object
const { InferenceClient } = require("@huggingface/inference");
// This client is now correctly used in the function below

// Create or update budget
exports.setBudget = async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;

    if (!category || !amount || !month || !year) {
      return res.status(400).json({
        success: false,
        message: "All fields (category, amount, month, year) are required",
      });
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: req.user.id, category, month, year },
      { category, amount, month, year, userId: req.user.id },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: budget });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all budgets for a user
exports.getBudget = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id });
    res.json({ success: true, data: budgets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Check if user is near or over budget
exports.checkBudgetStatus = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "month and year are required",
      });
    }

    const budgets = await Budget.find({ userId: req.user.id, month, year });
    let status = [];

    for (let b of budgets) {
      const spentData = await Expense.aggregate([
        {
          $match: {
            userId: req.user._id,
            category: b.category,
            date: {
              $gte: new Date(year, month - 1, 1),
              $lte: new Date(year, month, 0),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const totalSpent = spentData.length ? spentData[0].total : 0;
      const percent = (totalSpent / b.amount) * 100;

      status.push({
        id: b._id,
        category: b.category,
        budget: b.amount,
        spent: totalSpent,
        percent,
        alert:
          percent >= 100
            ? "Over budget!"
            : percent >= 80
              ? "Close to limit"
              : null,
      });
    }

    res.json({ success: true, data: status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update budget by ID
exports.updateBudget = async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;
    const { id } = req.params;

    const budget = await Budget.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { category, amount, month, year },
      { new: true }
    );

    if (!budget) {
      return res.status(404).json({ success: false, message: "Budget not found" });
    }

    res.json({ success: true, data: budget });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete budget by ID
exports.deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await Budget.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!budget) {
      return res.status(404).json({ success: false, message: "Budget not found" });
    }

    res.json({ success: true, message: "Budget deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

// Get AI Budget Suggestions
exports.getBudgetSuggestion = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "month and year are required",
      });
    }

    // 1. Get budgets
    const budgets = await Budget.find({ userId: req.user.id, month, year });

    // 2. Get expenses per category
    let details = [];
    for (let b of budgets) {
      const spentData = await Expense.aggregate([
        {
          $match: {
            userId: req.user._id,
            category: b.category,
            date: {
              $gte: new Date(year, month - 1, 1),
              $lte: new Date(year, month, 0),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const totalSpent = spentData.length ? spentData[0].total : 0;

      details.push({
        category: b.category,
        budget: b.amount,
        spent: totalSpent,
      });
    }

    // 3. Prepare prompt for Hugging Face model
    const userPrompt = `You are a financial assistant. Analyze the user's budget and expenses for ${month}/${year} using the data below. Give clear actionable suggestions on overspending, underused categories, and smart reallocation. Keep the response under 300 tokens, use only plain numbers (no currency words/symbols), and highlight the top 3 fixes.
    Data: ${JSON.stringify(details, null, 2)}`;

    // 4. Call Hugging Face Inference API chatCompletion
    const completion = await client.chatCompletion({
      model: "deepseek-ai/DeepSeek-V3-0324", // example conversational model
      messages: [
        { role: "system", content: "You are a helpful financial assistant." },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 300,
    });

    const suggestion = completion.choices?.[0]?.message || "No suggestion available.";

    // 5. Send response
    res.json({
      success: true,
      data: {
        budgets: details,
        suggestion,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
