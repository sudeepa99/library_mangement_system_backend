const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  getBorrowings,
  createBorrowing,
  getBorrowing,
  getOverdueBorrowings,
  returnBook,
  getUserBorrowings,
} = require("../controllers/borrowings");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(authorize("librarian"), getBorrowings)
  .post(authorize("librarian"), createBorrowing);

router.route("/overdue").get(authorize("librarian"), getOverdueBorrowings);

router.route("/:id/return").put(authorize("librarian"), returnBook);

router.route("/:id").get(authorize("librarian"), getBorrowing);

router.route("/user/:userId").get(getUserBorrowings);

module.exports = router;
