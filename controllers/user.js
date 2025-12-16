const ErrorResponse = require("../utills/errorResponse");
const APIFeatures = require("../utills/apiFeatures");
const User = require("../models/User");

//get all users
exports.getUsers = async (req, res, next) => {
  try {
    const features = new APIFeatures(User.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const users = await features.query;

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

//get single user
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorResponse(`User Not Found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

//Update User

exports.updateUser = async (req, res, next) => {
  try {
    const allowedUpdates = ["name", "email", "role"];
    const updates = {};

    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return next(
        new ErrorResponse(
          "No valid fields provided for update. Allowed fields: name, email, role",
          400
        )
      );
    }

    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        return next(
          new ErrorResponse("Please provide a valid email address", 400)
        );
      }
    }

    if (updates.role) {
      const validRoles = ["librarian", "member"];
      if (!validRoles.includes(updates.role)) {
        return next(
          new ErrorResponse(
            `Role must be one of: ${validRoles.join(", ")}`,
            400
          )
        );
      }
    }

    if (updates.email) {
      const existingUser = await User.findOne({
        email: updates.email.toLowerCase(),
        _id: { $ne: req.params.id },
      });

      if (existingUser) {
        return next(new ErrorResponse("Email already exists", 400));
      }

      updates.email = updates.email.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      message: "User Updated Successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

//Delete User

exports.deleteuser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      success: true,
      message: "User Delted Successfully",
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
