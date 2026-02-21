const mongoose = require("mongoose");

const borrowingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  book: {
    type: mongoose.Schema.ObjectId,
    ref: "Book",
    required: true,
  },
  borrowedDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  returnedDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["Borrowed", "Returned", "Overdue"],
    default: "Borrowed",
  },
  fine: {
    type: Number,
    default: 0,
  },
});

//Update Book Availability When Borrowwing
borrowingSchema.pre("save", async function (next) {
  if (this.isNew) {
    const Book = mongoose.model("Book");

    const updatedBook = await Book.findOneAndUpdate(
      { _id: this.book, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { new: true },
    );

    if (!updatedBook) {
      return next(new Error("No available copies of this book"));
    }
  }
  next();
});

borrowingSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  if (update.status === "Returned") {
    const docToUpdate = await this.model.findOne(this.getQuery());

    const Book = mongoose.model("Book");
    await Book.findByIdAndUpdate(docToUpdate.book, {
      $inc: { availableCopies: 1 },
    });
  }

  next();
});

module.exports = mongoose.model("Borrowing", borrowingSchema);
