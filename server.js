const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();

//Middleware
app.use(express.json());
app.use(cors());

//Routes
app.use("api/auth", require("./routes/auth"));
app.use("api/books", require("./routes/books"));
app.use("api/members", require(".routes/members"));
app.use("/api/borrowings", require(".routes/borrowings"));
app.use("/api/admin", require("./routes/admin"));

connectDB();

//Error Hnadling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something Went Wrong" });
});

//404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route Not Found" });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Library Management System Running on Port ${PORT}`);
});
