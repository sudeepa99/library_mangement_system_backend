const express = require("express");
const {
  register,
  login,
  getMe,
  logout,
  sendResetCode,
  verifyresetCode,
  resetPasswordWithCode,
  updateMe,
} = require("../controllers/auth");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.post("/forgot-password/send-code", sendResetCode);
router.post("/forgot-password/verify-code", verifyresetCode);
router.post("/forgot-password/reset", resetPasswordWithCode);
router.put("/update-me", protect, updateMe);

module.exports = router;
