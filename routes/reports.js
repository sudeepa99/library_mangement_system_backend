const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { getBorrowingTrends } = require("../controllers/reports");

router.use(protect);
router.use(authorize("librarian"));
router.get("/borrowing-trends", getBorrowingTrends);

module.exports = router;
