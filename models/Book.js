const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  isbn: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  publishedYear: {
    type: Number,
    required: true,
  },
  publisher: {
    type: String,
    trim: true,
  },
  copies: {
    type: Number,
    required: true,
    min: 0,
  },
  availableCopies: {
    type: Number,
    required: true,
    availableCopies: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//Set Available Copies Equal to Copies When Creating a New Book
bookSchema.pre("save", function (next) {
  if (this.isNew) {
    this.availableCopies = this.copies;
  }
  next();
});
