const mongoose = require("mongoose");
const { Tasks } = require("../models/tasks.model");
const { Hours } = require("../models/hours.model");

const checkImportantFields = async (body) => {
    let res_json;

    if (!body.subnivel) {
        res_json = "subnivel";
        return [false, res_json];
    }

    if (!body.lineaTrabajo) {
        res_json = "lineaTrabajo";
        return [false, res_json];
    }

    if (!body.estructura) {
        res_json = "estructura";
        return [false, res_json];
    }
    return [true];
};

const getAllTasks = async (req, res) => {
    try {
        const tasks = await Tasks.find();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener tareas" });
    }
};

const getTaskById = async (req, res) => {
    try {
        const task = await Tasks.findById(req.params.id);
        if (!task) return res.status(404).json({ error: "Task not found" });
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener tarea" });
    }
};

const createTask = async (req, res) => {
    const arePresentImportantFields = await checkImportantFields(req.body);

    if (arePresentImportantFields[0] == false) {
        const requiredParam = arePresentImportantFields[1];
        return res
            .status(406)
            .json({ error: `Missing required ${requiredParam}` });
    }

    const { estructura, lineaTrabajo, subnivel } = req.body;
    let { subtarea } = req.body;
    if (!subtarea) {
        subtarea = "";
    }
    const fullTaskName =
        estructura + "_" + lineaTrabajo + "_" + subnivel + "_" + subtarea;
    try {
        const task = new Tasks({
            _id: new mongoose.Types.ObjectId(),
            fullTaskName,
            ...req.body,
        });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: "Error al crear tarea" });
    }
};

const updateTask = async (req, res) => {
    const arePresentImportantFields = await checkImportantFields(req.body);

    if (arePresentImportantFields[0] == false) {
        const requiredParam = arePresentImportantFields[1];
        return res
            .status(406)
            .json({ error: `Missing required ${requiredParam}` });
    }

    try {
        const task = await Tasks.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!task) return res.status(404).json({ error: "Task not found" });
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar tarea" });
    }
};

const deleteTask = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedTask = await Tasks.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({
            message: "Task deleted successfully",
            task: deletedTask,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting task",
            error: error.message,
        });
    }
};


module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
};
