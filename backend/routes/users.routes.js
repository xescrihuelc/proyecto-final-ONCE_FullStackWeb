const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");

// Ruta de login
router.post("/login", usersController.loginUser);

// Rutas adicionales (ya existentes)
router.get("/", usersController.getAllUsers);
router.get("/:id", usersController.getUserById);
router.post("/", usersController.createUser);
router.patch("/:id", usersController.updateUser);

module.exports = router;
