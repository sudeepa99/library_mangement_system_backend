const express = require("express");
const router = express.Router();
const { getBorrowingTrends } = require("../controllers/reportsController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.use(authorize("librarian"));
router.get("/borrowing-trends", getBorrowingTrends);

module.exports = router;
