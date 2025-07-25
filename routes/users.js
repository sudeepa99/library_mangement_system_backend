const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  getUsers,
  getUser,
  updateUser,
  deleteuser,
} = require("../controllers/user");

const router = express.Router();

router.use(protect);
router.use(authorize("librarian"));

router.route("/").get(getUsers);

router.route("/:id").get(getUser).put(updateUser).delete(deleteuser);
