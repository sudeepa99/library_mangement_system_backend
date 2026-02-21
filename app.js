const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");

// Route files
const auth = require("./routes/auth");
const users = require("./routes/users");
const books = require("./routes/books");
const borrowings = require("./routes/borrowings");
const categories = require("./routes/category");
const dashboardStats = require("./routes/dashboard");
const notifications = require("./routes/notification");
const reports = require("./routes/reports");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Enable CORS
app.use(cors());

// Set security headers
app.use(helmet());

// Mount routers
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/books", books);
app.use("/api/v1/borrowings", borrowings);
app.use("/api/v1/categories", categories);
app.use("/api/v1/dashboard", dashboardStats);
app.use("/api/v1/notifications", notifications);
app.use("/api/v1/reports", reports);

// Error handler middleware
app.use(errorHandler);

module.exports = app;
