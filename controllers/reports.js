const Borrowing = require("../models/Borrowing");

exports.getBorrowingTrends = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let start;
    let end = new Date();

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Default: last 12 months
      start = new Date();
      start.setMonth(start.getMonth() - 11);
      start.setDate(1);
    }

    const trends = await Borrowing.aggregate([
      {
        $match: {
          borrowedDate: {
            $gte: start,
            $lte: end,
          },
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
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // Format data for frontend chart
    const formatted = trends.map((item) => {
      const monthDate = new Date(item._id.year, item._id.month - 1);

      return {
        month: monthDate.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        borrowings: item.borrowings,
        returns: item.returns,
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
};
