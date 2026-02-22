require("dotenv").config();
const app = require("./app");
const PORT = process.env.PORT;

const server = app.listen(PORT);

process.on("unhandledRejection", (err, promise) => {
  server.close(() => process.exit(1));
});
