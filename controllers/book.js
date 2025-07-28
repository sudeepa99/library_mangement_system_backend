const Book = require("../models/Book");
const APIFeatures = require("../utills/apiFeatures");
const ErrorResponse = require("../utills/errorResponse");

//Get All Books
exports.getBooks = async (req, res, next) => {
  try {
    const features = new APIFeatures(Book.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const books = await features.query;

    res.status(200).json({
      success: true,
      message: "Books fetched successfully.",
      count: books.length,
      data: books,
    });
  } catch (err) {
    next(err);
  }
};

//Get Single Book
exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return next(
        new ErrorResponse(`Book not found with id of ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      success: true,
      message: "Book fetched successfully.",
      data: book,
    });
  } catch (err) {
    next(err);
  }
};

//Create Book

exports.createBook = async (req, res, next) => {
  try {
    const book = await Book.create(req.body);

    res.status(201).json({
      success: true,
      message: "Book created successfully.",
      data: book,
    });
  } catch (err) {
    next(err);
  }
};

// Update Book
exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!book) {
      return next(
        new ErrorResponse(`Book not found with id of ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      success: true,
      message: "Book updated successfully.",
      data: book,
    });
  } catch (err) {
    next(err);
  }
};

//Delete Book
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return next(
        new ErrorResponse(`Book not found with id of $(req.params.id)`, 404)
      );
    }
    res.status(200).json({
      success: true,
      message: "Book deleted successfully.",
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

//Get Book Categories
exports.getBookCategories = async (req, res, next) => {
  try {
    const categories = await Book.distinct("category");

    res.status(200).json({
      success: true,
      message: "Book categories fetched successfully.",
      count: categories.length,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
};
