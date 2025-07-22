const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // use to securely hash passswords

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

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//This runs before saving the user.
//If the password was changed (or during first save), it:
//  1).Creates a salt.
//  2).Hashes the password.
//  3).Saves the hashed password.

// Match user entered password to hashed password in database during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//This method is called when the user tries to log in.
//It compares the entered password with the hashed password stored in the DB.

module.exports = mongoose.model("User", userSchema);
