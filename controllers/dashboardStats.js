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

exports.getRecentActivity = async (req, res, next) => {
  try {
    const activities = await Borrowing.aggregate([
      {
        $addFields: {
          activityDate: {
            $ifNull: ["$returnedDate", "$borrowedDate"],
          },
        },
      },
      {
        $sort: { activityDate: -1 },
      },
      {
        $limit: 6,
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "books",
          localField: "book",
          foreignField: "_id",
          as: "book",
        },
      },
      { $unwind: "$book" },
      {
        $project: {
          status: 1,
          fine: 1,
          borrowedDate: 1,
          returnedDate: 1,
          dueDate: 1,
          "user._id": 1,
          "book._id": 1,
          "user.name": 1,
          "book.title": 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (err) {
    next(err);
  }
};
