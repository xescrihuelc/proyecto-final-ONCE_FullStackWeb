const express = require("express");
const router = express.Router();
const tasksController = require("../controllers/tasks.controller");

router.get("/", tasksController.getAllTasks);
router.get("/hours", tasksController.getImputacionesPorUsuarioYRango);
router.get("/:id", tasksController.getTaskById);
router.post("/", tasksController.createTask);
router.patch("/:id", tasksController.updateTask);
router.delete("/:id", tasksController.deleteTask);
router.patch("/:id/assign", tasksController.assignUserToTask);

module.exports = router;
