const Book = require("../models/Book");
const Borrowing = require("../models/Borrowing");

exports.getAdminStats = async (req, res, next) => {
  try {
    const today = new Date();

    const totalBooks = await Book.countDocuments();

    const availableCopiesResult = await Book.aggregate([
      {
        $group: {
          _id: null,
          totalAvailable: { $sum: "$availableCopies" },
        },
      },
    ]);

    const availableCopies =
      availableCopiesResult.length > 0
        ? availableCopiesResult[0].totalAvailable
        : 0;

    const activeBorrowings = await Borrowing.countDocuments({
      status: "Borrowed",
    });

    const overdueBooks = await Borrowing.countDocuments({
      status: "Borrowed",
      dueDate: { $lt: today },
    });

    res.status(200).json({
      success: true,
      data: {
        totalBooks,
        availableCopies,
        activeBorrowings,
        overdueBooks,
      },
    });
  } catch (err) {
    next(err);
  }
};
