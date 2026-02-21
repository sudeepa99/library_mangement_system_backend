const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getBorrowingTrends,
  getKeyMetrics,
  getAnalyticsReport,
} = require("../controllers/reports");

router.use(protect);
router.use(authorize("librarian"));
router.get("/borrowing-trends", getBorrowingTrends);
router.get("/key-metrics", getKeyMetrics);
router.get("/analytics", getAnalyticsReport);

module.exports = router;
