const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { getAdminStats } = require("../controllers/dashboardStats");

const router = express.Router();

router.use(protect);
router.use(authorize("librarian"));
router.route("/admin-stats").get(getAdminStats);

module.exports = router;
