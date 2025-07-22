const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // trim removes leading spaces
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["librarian", "member"],
      default: "librarian",
    },
    // phone: {
    //   type: String,
    //   trim: true,
    // },
    // address: {
    //   type: String,
    //   trim: true,
    // },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    // borrowingHistory: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Borrowing",
    //   },
    // ],
  }
  // {
  //   timestamps: true, // Adds createdAt and updatedAt automatically
  // }
);

module.exports = mongoose.model("User", userSchema);
