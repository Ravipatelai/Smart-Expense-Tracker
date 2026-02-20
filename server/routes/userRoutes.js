const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const userSearchCtrl = require("../controllers/userSearchController");

router.get("/search", protect, userSearchCtrl.searchByEmail);

module.exports = router;
