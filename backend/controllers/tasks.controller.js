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
    const task = new Tasks({
        _id: new mongoose.Types.ObjectId(),
        ...req.body,
    });
    await task.save();
    res.status(201).json(task);
};

exports.updateTask = async (req, res) => {
    const task = await Tasks.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
};
