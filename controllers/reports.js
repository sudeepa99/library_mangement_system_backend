const Borrowing = require("../models/Borrowing");

exports.getBorrowingTrends = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const trends = await Borrowing.aggregate([
      {
        $match: {
          borrowedDate: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$borrowedDate" },
            month: { $month: "$borrowedDate" },
          },
          borrowings: { $sum: 1 },
          returns: {
            $sum: {
              $cond: [{ $ifNull: ["$returnedDate", false] }, 1, 0],
            },
          },
        },
      },
    ]);

    const result = [];
    const current = new Date(start);

    while (current <= end) {
      const year = current.getFullYear();
      const month = current.getMonth() + 1;

      const existing = trends.find(
        (t) => t._id.year === year && t._id.month === month,
      );

      result.push({
        month: current.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        borrowings: existing ? existing.borrowings : 0,
        returns: existing ? existing.returns : 0,
      });

      current.setMonth(current.getMonth() + 1);
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

exports.getKeyMetrics = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalBorrowings = await Borrowing.countDocuments();
    const activeBorrowings = await Borrowing.countDocuments({
      status: "Borrowed",
    });

    const books = await Book.find();
    const borrowings = await Borrowing.find().populate("book user");

    // Most borrowed genre
    const genreCount = {};
    borrowings.forEach((b) => {
      if (b.book?.category) {
        genreCount[b.book.category] = (genreCount[b.book.category] || 0) + 1;
      }
    });
    const mostBorrowedGenre =
      Object.entries(genreCount).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "None";

    // New books this month
    const now = new Date();
    const newThisMonth = books.filter((b) => {
      const createdDate = new Date(b.createdAt);
      return (
        createdDate.getMonth() === now.getMonth() &&
        createdDate.getFullYear() === now.getFullYear()
      );
    }).length;

    // Avg overdue days
    const overdueBorrowings = borrowings.filter((b) => {
      if (!b.dueDate || b.status === "Returned") return false;
      return new Date(b.dueDate) < new Date();
    });
    const totalOverdueDays = overdueBorrowings.reduce((sum, b) => {
      const diffTime = new Date() - new Date(b.dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + Math.max(0, diffDays);
    }, 0);
    const avgOverdueDays =
      overdueBorrowings.length > 0
        ? (totalOverdueDays / overdueBorrowings.length).toFixed(1)
        : 0;

    const fictionBooks = books.filter((b) => b.category === "Fiction").length;

    res.status(200).json({
      success: true,
      data: {
        totalBooks,
        totalBorrowings,
        activeBorrowings,
        mostBorrowedGenre,
        newThisMonth,
        avgOverdueDays,
        fictionBooks,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
