const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ErrorResponse = require("../utills/errorResponse");
const sendEmail = require("../utills/sendEmail");
const bcrypt = require("bcryptjs");

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
    // const user = await User.findOne({ email }).select("+password");
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

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
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
};

exports.logout = async (req, res, next) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
      data: {},
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//send reset code
exports.sendResetCode = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorResponse("No user forund with this email", 404));
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedCode = await bcrypt.hash(code, 10);

  user.resetCode = hashedCode;
  // user.resetCodeExpire = Date.now() + 10 * 60 * 1000;
  user.resetCodeExpire = new Date(Date.now() + 10 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const message = `Your password reset code is: ${code}. It expires in 10 minutes.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Code",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Reset Code Sent to Your Email",
    });
  } catch (err) {
    user.resetCode = undefined;
    user.resetCodeExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse("Failed to send email", 500));
  }
};

//verify reset code
exports.verifyresetCode = async (req, res, next) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new ErrorResponse("Invalid email", 404));

  if (!user.resetCode || user.resetCodeExpire.getTime() < Date.now())
    return next(new ErrorResponse("Code expired", 400));

  const isValid = await bcrypt.compare(code, user.resetCode);
  if (!isValid) return next(new ErrorResponse("Invalid code", 400));

  res.status(200).json({ success: true, message: "Code verified" });
};

exports.resetPasswordWithCode = async (req, res, next) => {
  const { email, code, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new ErrorResponse("Invalid email", 404));
  // if (!user.resetCode || user.resetCodeExpire < Date.now())
  //   return next(new ErrorResponse("Code expired", 400));

  if (!user.resetCode || user.resetCodeExpire.getTime() < Date.now())
    return next(new ErrorResponse("Code expired", 400));

  const isValid = await bcrypt.compare(code, user.resetCode);
  if (!isValid) return next(new ErrorResponse("Invalid code", 400));

  user.password = password;
  user.resetCode = undefined;
  user.resetCodeExpire = undefined;
  await user.save();

  res.status(200).json({ success: true, message: "Password reset successful" });
};
