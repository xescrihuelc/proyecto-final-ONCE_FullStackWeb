const { Tasks } = require("../models/tasks.model");
const mongoose = require("mongoose");

exports.getAllTasks = async (req, res) => {
  const tasks = await Tasks.find();
  res.json(tasks);
};

exports.getTaskById = async (req, res) => {
  const task = await Tasks.findById(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
};

exports.createTask = async (req, res) => {
  const { estructura, lineaTrabajo, subnivel, subtarea } = req.body;
  if (!subtarea) {
    subtarea = "";
  }
  const fullTaskName =
    estructura + "_" + lineaTrabajo + "_" + subnivel + "_" + subtarea;
  const task = new Tasks({
    _id: new mongoose.Types.ObjectId(),
    fullTaskName,
    ...req.body,
  });
  await task.save();
  res.status(201).json(task);
};

exports.updateTask = async (req, res) => {
  const task = await Tasks.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTask = await Tasks.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res
      .status(200)
      .json({ message: "Task deleted successfully", task: deletedTask });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting task", error: error.message });
  }
};
