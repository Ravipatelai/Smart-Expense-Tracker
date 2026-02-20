const Settlement = require("../models/Settlement");
const ActivityLog = require("../models/ActivityLog");

// ─── RECORD SETTLEMENT ───
exports.addSettlement = async (req, res) => {
    try {
        const { payerId, receiverId, amount, date, paymentMode, notes, proof } = req.body;
        const groupId = req.params.groupId;
        const group = req.group;

        if (!payerId || !receiverId || !amount) {
            return res.status(400).json({
                success: false,
                message: "payerId, receiverId, and amount are required",
            });
        }

        const payerMember = group.members.some((m) => m.userId.toString() === payerId);
        const receiverMember = group.members.some((m) => m.userId.toString() === receiverId);

        if (!payerMember || !receiverMember) {
            return res.status(400).json({
                success: false,
                message: "Both payer and receiver must be group members",
            });
        }

        const settlement = await Settlement.create({
            groupId,
            payerId,
            receiverId,
            amount: Number(amount),
            date: date || Date.now(),
            paymentMode: paymentMode || "cash",
            proof: proof || "",
            notes: notes || "",
            createdBy: req.user._id,
        });

        await ActivityLog.create({
            groupId,
            userId: req.user._id,
            action: "settlement_done",
            details: `Settlement of ₹${amount} recorded`,
        });

        const populated = await settlement.populate([
            { path: "payerId", select: "name email" },
            { path: "receiverId", select: "name email" },
            { path: "createdBy", select: "name email" },
        ]);

        res.status(201).json({ success: true, message: "Settlement recorded", data: populated });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

// ─── LIST SETTLEMENTS ───
exports.getSettlements = async (req, res) => {
    try {
        const settlements = await Settlement.find({ groupId: req.params.groupId })
            .populate("payerId", "name email")
            .populate("receiverId", "name email")
            .populate("createdBy", "name email")
            .sort({ date: -1 });

        res.json({ success: true, data: settlements });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
