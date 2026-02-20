const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const inviteCtrl = require("../controllers/groupInviteController");

// ─── User-scoped invite endpoints ───
router.get("/", protect, inviteCtrl.getMyInvites);
router.post("/:inviteId/accept", protect, inviteCtrl.acceptInvite);
router.post("/:inviteId/reject", protect, inviteCtrl.rejectInvite);

module.exports = router;
