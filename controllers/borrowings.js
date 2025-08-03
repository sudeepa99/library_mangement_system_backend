const ErrorResponse = require("../utills/errorResponse");
const APIFeatures = require("../utills/apiFeatures");
const Borrowing = require("../models/Borrowing");
const Book = require("../models/Book");
const User = require("../models/User");

//Get All Borrowings
exports.getBorrowings = async (req, res, next) => {
  try {
    const features = new APIFeatures(Borrowing.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const borrowings = await features.query.populate({
      path: "user book",
      select: "name email title author",
    });

    res.status(200).json({
      success: true,
      count: borrowings.length,
      data: borrowings,
    });
  } catch (err) {
    next(err);
  }
};

//Get Single Borrowing

exports.getBorrowing = async (req, res, next) => {
  try {
    const borrowing = await Borrowing.findById(req.params.id).populate({
      path: "user book",
      select: "name email title author",
    });

    if (!borrowing) {
      return next(
        new ErrorResponse(`Borrowing not found with id of ${req.params.id}`)
      );
    }
    res.status(200).json({
      success: true,
      data: borrowing,
    });
  } catch (err) {
    next(err);
  }
};

//Create New Borrowing
exports.createBorrowing = async (req, res, next) => {
  try {
    //Check if book is available
    const book = await Book.findById(req.body.book);
    if (!book) {
      return next(
        new ErrorResponse(`Book not found with id of ${req.body.book}`, 404)
      );
    }

    if (book.availableCopies <= 0) {
      return next(new ErrorResponse("No available copies of this book", 400));
    }
    //Check if user exists
    const user = await User.findById(req.body.user);

    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${req.body.user}`, 404)
      );
    }

    //Calculate Due Date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const borrowing = await Borrowing.create({
      ...req.body,
      dueDate,
    });

    res.status(201).json({
      success: true,
      message: "Borrowing Created Successfully",
      data: borrowing,
    });
  } catch (err) {
    next(err);
  }
};

//Return Book
exports.returnBook = async (req, res, next) => {
  try {
    const borrowing = await Borrowing.findById(req.params.id);

    if (!borrowing) {
      return next(
        new ErrorResponse(
          `Borrowing not found with id of ${req.params.id}`,
          404
        )
      );
    }

    if (borrowing.returnedDate) {
      return next(new ErrorResponse("Book Already Returned"));
    }

    //Calculate fine if overdue($1 per day)
    const today = new Date();
    let fine = 0;
    if (today > borrowing.dueDate) {
      const diffTime = Math.abs(today - borrowing.dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fine = diffDays * 1;
    }

    const updatedBorrowing = await Borrowing.findByIdAndUpdate(
      req.params.id,
      {
        returnedDate: today,
        status: "Returned",
        fine,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Book Returned Successfully",
      data: updatedBorrowing,
    });
  } catch (err) {
    next(err);
  }
};

//Get User Borrowings

exports.getUserBorrowings = async (req, res, next) => {
  try {
    //Check if user exists

    const user = await User.findById(req.params.userId);

    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${req.params.userId}`, 404)
      );
    }

    const borrowings = await Borrowing.find({
      user: req.params.UserId,
    })
      .populate({
        path: "book",
        select: "title author",
      })
      .sort("-borrowedDate");

    res.status(200).json({
      success: true,
      count: borrowings.length,
      data: borrowings,
    });
  } catch (err) {
    next(err);
  }
};

//Get Overdue Borrowings

exports.getOverdueBorrowings = async (req, res, next) => {
  try {
    const today = new Date();
    const borrowings = await Borrowing.find({
      dueDate: { $lt: today },
      returnedDate: { $exists: false },
    })
      .populate({
        path: "User Book",
        select: "name email title author ",
      })
      .sort("dueDate");

    res.status(200).json({
      success: true,
      count: borrowings.length,
      data: borrowings,
    });
  } catch (err) {
    next(err);
  }
};
