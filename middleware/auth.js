const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_Secret;
const User = require("../models/User");
const ErrorResponse = require("../utills/errorResponse");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startswith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ErrorResponse("Not Authorized to Access this Route", 401));
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorResponse("No user found with this id", 404));
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new ErrorResponse("Not Authorized to Access this Route", 401));
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role $(req.user.role) is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
