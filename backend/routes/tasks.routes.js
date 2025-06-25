const express = require("express");
const router = express.Router();
const tasksController = require("../controllers/tasks.controller");

router.get("/", tasksController.getAllTasks);
router.get("/:id", tasksController.getTaskById);
router.post("/", tasksController.createTask);
router.patch("/:id", tasksController.updateTask);
router.delete("/:id", tasksController.deleteTask);

module.exports = router;
