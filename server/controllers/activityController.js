const ActivityLog = require("../models/ActivityLog");
const GroupExpense = require("../models/GroupExpense");

// ─── GET ACTIVITY LOG ───
exports.getActivity = async (req, res) => {
    try {
        const logs = await ActivityLog.find({ groupId: req.params.groupId })
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({ success: true, data: logs });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

// ─── GET ANALYTICS ───
exports.getAnalytics = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const group = req.group;

        const expenses = await GroupExpense.find({ groupId, isDeleted: false })
            .populate("paidBy", "name email");

        // Total spending
        const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);

        // Category breakdown
        const categoryMap = {};
        expenses.forEach((e) => {
            const cat = e.category || "General";
            categoryMap[cat] = (categoryMap[cat] || 0) + e.amount;
        });
        const categoryBreakdown = Object.entries(categoryMap)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount);

        // Top spender
        const spenderMap = {};
        expenses.forEach((e) => {
            const id = e.paidBy?._id?.toString() || e.paidBy?.toString();
            const name = e.paidBy?.name || "Unknown";
            if (!spenderMap[id]) spenderMap[id] = { name, email: e.paidBy?.email, total: 0 };
            spenderMap[id].total += e.amount;
        });
        const topSpenders = Object.values(spenderMap)
            .sort((a, b) => b.total - a.total);

        // Monthly trend
        const monthlyMap = {};
        expenses.forEach((e) => {
            const d = new Date(e.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            monthlyMap[key] = (monthlyMap[key] || 0) + e.amount;
        });
        const monthlyTrend = Object.entries(monthlyMap)
            .map(([month, amount]) => ({ month, amount }))
            .sort((a, b) => a.month.localeCompare(b.month));

        res.json({
            success: true,
            data: {
                totalSpending,
                totalExpenses: expenses.length,
                categoryBreakdown,
                topSpenders,
                monthlyTrend,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
