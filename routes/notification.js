const express = require("express");
const { sendOverdueReminder } = require("../controllers/notifications");
const { protect, authorize } = require("../middleware/auth");
const router = express.Router();

router.use(protect);
router.use(authorize("librarian"));
router.post("/overdue", sendOverdueReminder);

module.exports = router;
