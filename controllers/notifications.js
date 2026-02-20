const User = require("../models/User");
const Borrowing = require("../models/Borrowing");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOverdueReminder = async (req, res) => {
  const { userId, bookId } = req.body;

  try {
    // Find user and borrowing
    const user = await User.findById(userId);
    const borrowing = await Borrowing.findOne({
      user: userId,
      book: bookId,
      status: "Borrowed",
    }).populate("book");

    if (!user || !borrowing) {
      return res.status(404).json({
        success: false,
        message: "User or borrowing not found, or already returned",
      });
    }

    // Calculate days overdue
    const daysOverdue = Math.ceil(
      (new Date() - new Date(borrowing.dueDate)) / (1000 * 60 * 60 * 24),
    );

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Overdue Book Reminder",
      text: `Hello ${user.name},

You have an overdue book: "${borrowing.book.title}".
It is overdue by ${daysOverdue} days.

Please return it as soon as possible to avoid additional fines.

Thank you,
Library Team`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Reminder sent successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to send reminder",
    });
  }
};
