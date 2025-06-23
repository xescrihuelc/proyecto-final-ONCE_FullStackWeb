const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");

router.post("/login", usersController.loginUser);
router.get("/", usersController.getAllUsers);
router.get("/:id", usersController.getUserById);
router.post("/", usersController.createUser);
router.patch("/:id", usersController.updateUser);
router.delete("/:id", usersController.deleteUser);

module.exports = router;
