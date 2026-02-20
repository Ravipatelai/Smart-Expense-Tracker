const GroupExpense = require("../models/GroupExpense");
const Settlement = require("../models/Settlement");
const ActivityLog = require("../models/ActivityLog");

// ─── ADD GROUP EXPENSE ───
exports.addExpense = async (req, res) => {
    try {
        const { title, amount, category, notes, date, paidBy, splitType, splits, participants } = req.body;
        const groupId = req.params.groupId;
        const group = req.group;

        if (!title || !amount || !paidBy) {
            return res.status(400).json({ success: false, message: "title, amount, and paidBy are required" });
        }

        // Validate paidBy is a member
        const payerIsMember = group.members.some(
            (m) => m.userId.toString() === paidBy
        );
        if (!payerIsMember) {
            return res.status(400).json({ success: false, message: "paidBy must be a group member" });
        }

        // Determine participants
        const participantIds = participants && participants.length
            ? participants
            : group.members.map((m) => m.userId.toString());

        let computedSplits = [];

        if (splitType === "percentage") {
            // Percentage split – validate percentages sum to 100
            if (!splits || !splits.length) {
                return res.status(400).json({ success: false, message: "splits array is required for percentage split" });
            }

            const percentTotal = splits.reduce((sum, s) => sum + Number(s.percentage || 0), 0);
            if (Math.abs(percentTotal - 100) > 0.01) {
                return res.status(400).json({
                    success: false,
                    message: `Percentages must total 100% (got ${percentTotal}%)`,
                });
            }

            computedSplits = splits.map((s) => ({
                userId: s.userId,
                percentage: Number(s.percentage),
                amount: Math.round((Number(amount) * Number(s.percentage) / 100) * 100) / 100,
            }));
        } else if (splitType === "custom") {
            // Custom split – validate amounts add up
            if (!splits || !splits.length) {
                return res.status(400).json({ success: false, message: "splits array is required for custom split" });
            }

            const splitTotal = splits.reduce((sum, s) => sum + Number(s.amount), 0);
            if (Math.abs(splitTotal - Number(amount)) > 0.01) {
                return res.status(400).json({
                    success: false,
                    message: `Split amounts (${splitTotal}) must equal expense total (${amount})`,
                });
            }

            computedSplits = splits.map((s) => ({
                userId: s.userId,
                amount: Number(s.amount),
                percentage: 0,
            }));
        } else {
            // Equal split
            const perPerson = Number(amount) / participantIds.length;
            computedSplits = participantIds.map((uid) => ({
                userId: uid,
                amount: Math.round(perPerson * 100) / 100,
                percentage: Math.round((100 / participantIds.length) * 100) / 100,
            }));
        }

        const expense = await GroupExpense.create({
            groupId,
            title,
            amount: Number(amount),
            category: category || "General",
            notes: notes || "",
            date: date || Date.now(),
            paidBy,
            participants: participantIds,
            splitType: splitType || "equal",
            splits: computedSplits,
            isDeleted: false,
            createdBy: req.user._id,
        });

        await ActivityLog.create({
            groupId,
            userId: req.user._id,
            action: "expense_added",
            details: `Added "${title}" — ₹${amount}`,
        });

        const populated = await expense.populate([
            { path: "paidBy", select: "name email" },
            { path: "splits.userId", select: "name email" },
            { path: "participants", select: "name email" },
        ]);

        res.status(201).json({ success: true, message: "Expense added", data: populated });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

// ─── LIST GROUP EXPENSES ───
exports.getExpenses = async (req, res) => {
    try {
        const expenses = await GroupExpense.find({ groupId: req.params.groupId, isDeleted: false })
            .populate("paidBy", "name email")
            .populate("splits.userId", "name email")
            .populate("participants", "name email")
            .populate("createdBy", "name email")
            .sort({ date: -1 });

        res.json({ success: true, data: expenses });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

// ─── SOFT DELETE GROUP EXPENSE ───
exports.deleteExpense = async (req, res) => {
    try {
        const expense = await GroupExpense.findOne({
            _id: req.params.expenseId,
            groupId: req.params.groupId,
            isDeleted: false,
        });

        if (!expense) {
            return res.status(404).json({ success: false, message: "Expense not found" });
        }

        // Only admin or the person who added the expense can delete
        const isAdmin = req.group.members.some(
            (m) => m.userId.toString() === req.user._id.toString() && m.role === "admin"
        );
        const isCreator = expense.createdBy?.toString() === req.user._id.toString();

        if (!isAdmin && !isCreator) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this expense",
                data: null,
                errors: null,
            });
        }

        expense.isDeleted = true;
        await expense.save();

        await ActivityLog.create({
            groupId: req.params.groupId,
            userId: req.user._id,
            action: "expense_deleted",
            details: `Deleted "${expense.title}" — ₹${expense.amount}`,
        });

        res.json({ success: true, message: "Expense deleted (soft)" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

// ─── GET BALANCES ───
exports.getBalances = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const group = req.group;

        // Only non-deleted expenses
        const expenses = await GroupExpense.find({ groupId, isDeleted: false });
        const settlements = await Settlement.find({ groupId });

        // net[userId] = how much they are OWED (positive) or OWE (negative)
        const net = {};
        group.members.forEach((m) => {
            net[m.userId.toString()] = 0;
        });

        expenses.forEach((exp) => {
            const payerId = exp.paidBy.toString();
            net[payerId] = (net[payerId] || 0) + exp.amount;

            exp.splits.forEach((s) => {
                const uid = s.userId.toString();
                net[uid] = (net[uid] || 0) - s.amount;
            });
        });

        settlements.forEach((s) => {
            const payerId = s.payerId.toString();
            const receiverId = s.receiverId.toString();
            net[payerId] = (net[payerId] || 0) + s.amount;
            net[receiverId] = (net[receiverId] || 0) - s.amount;
        });

        // Greedy min-transfers algorithm
        const debtors = [];
        const creditors = [];

        Object.entries(net).forEach(([userId, balance]) => {
            if (balance < -0.01) debtors.push({ userId, amount: -balance });
            else if (balance > 0.01) creditors.push({ userId, amount: balance });
        });

        debtors.sort((a, b) => b.amount - a.amount);
        creditors.sort((a, b) => b.amount - a.amount);

        const transactions = [];
        let i = 0, j = 0;

        while (i < debtors.length && j < creditors.length) {
            const transfer = Math.min(debtors[i].amount, creditors[j].amount);
            transactions.push({
                from: debtors[i].userId,
                to: creditors[j].userId,
                amount: Math.round(transfer * 100) / 100,
            });

            debtors[i].amount -= transfer;
            creditors[j].amount -= transfer;

            if (debtors[i].amount < 0.01) i++;
            if (creditors[j].amount < 0.01) j++;
        }

        // Populate names
        const User = require("../models/User");
        const memberIds = group.members.map((m) => m.userId);
        const users = await User.find({ _id: { $in: memberIds } }).select("name email");
        const userMap = {};
        users.forEach((u) => { userMap[u._id.toString()] = { name: u.name, email: u.email, _id: u._id }; });

        const balances = Object.entries(net).map(([userId, balance]) => ({
            userId,
            user: userMap[userId] || { name: "Unknown" },
            balance: Math.round(balance * 100) / 100,
        }));

        const enrichedTransactions = transactions.map((t) => ({
            ...t,
            fromUser: userMap[t.from] || { name: "Unknown" },
            toUser: userMap[t.to] || { name: "Unknown" },
        }));

        res.json({
            success: true,
            data: { balances, transactions: enrichedTransactions },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
