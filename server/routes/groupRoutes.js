const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { isMember, isAdmin } = require("../middlewares/groupMiddleware");

const groupCtrl = require("../controllers/groupController");
const expenseCtrl = require("../controllers/groupExpenseController");
const settlementCtrl = require("../controllers/settlementController");
const inviteCtrl = require("../controllers/groupInviteController");
const activityCtrl = require("../controllers/activityController");

// ─── Group CRUD ───
router.post("/", protect, groupCtrl.createGroup);
router.get("/", protect, groupCtrl.getMyGroups);
router.get("/:groupId", protect, isMember, groupCtrl.getGroupById);
router.patch("/:groupId", protect, isMember, isAdmin, groupCtrl.updateGroup);
router.delete("/:groupId", protect, isMember, isAdmin, groupCtrl.deleteGroup);

// ─── Members ───
router.get("/:groupId/members", protect, isMember, groupCtrl.getGroupMembers);
router.delete("/:groupId/members/:memberId", protect, isMember, isAdmin, groupCtrl.removeMember);

// ─── Invites (group-scoped) ───
router.post("/:groupId/invite", protect, isMember, isAdmin, inviteCtrl.sendInvite);

// ─── Expenses ───
router.post("/:groupId/expenses", protect, isMember, expenseCtrl.addExpense);
router.get("/:groupId/expenses", protect, isMember, expenseCtrl.getExpenses);
router.delete("/:groupId/expenses/:expenseId", protect, isMember, expenseCtrl.deleteExpense);

// ─── Balances ───
router.get("/:groupId/balances", protect, isMember, expenseCtrl.getBalances);

// ─── Settlements ───
router.post("/:groupId/settlements", protect, isMember, settlementCtrl.addSettlement);
router.get("/:groupId/settlements", protect, isMember, settlementCtrl.getSettlements);

// ─── Activity & Analytics ───
router.get("/:groupId/activity", protect, isMember, activityCtrl.getActivity);
router.get("/:groupId/analytics", protect, isMember, activityCtrl.getAnalytics);

module.exports = router;
