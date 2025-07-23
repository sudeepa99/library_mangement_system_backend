const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ErrorResponse = require("../utills/errorResponse");

//Register User
exports.register = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    const user = await User.create({
      name,
      email,
      password,
      role,
    });
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

//Login User
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  try {
    //check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorResponse("Invalid Credentials", 401));
    }

    //check password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse("Invalid Credentials", 401));
    }

    //Update Last Login

    user.lastLogin = Date.now();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

//Get Current Logged in User

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

//Get Token From Model, Create Cookie
const sendTokenResponse = (user, statusCode, res) => {
  //Create Token
  const token = jwt.sign({ id: user._id }, process.env.JWT_Secret, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};
