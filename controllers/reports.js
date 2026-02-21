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
