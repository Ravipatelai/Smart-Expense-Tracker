const express = require("express");
const { getCategories } = require("../controllers/categoryController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// GET all categories (predefined + user's custom categories)
router.get("/", protect, getCategories);

module.exports = router;
