const express = require("express");
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  getBookCategories,
} = require("../controllers/book");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router
  .route("/")
  .get(getBooks)
  .post(protect, authorize("librarian"), createBook);

router.route("categories").get(getBookCategories);

router
  .route("/:id")
  .get(getBook)
  .put(protect, authorize("librarian"), updateBook)
  .delete(protect, authorize("librarian", deleteBook));
