// src/services/taskService.js

import { API_URL } from "../utils/config";
import { getToken } from "./authService";

export const parseTasksFromBackend = (task) => {

    const rawSubs =
        task.subtarea && task.subtarea.trim().length > 0
            ? task.subtarea.split(",")
            : ["(Sin subtarea)"];

    const tareas = rawSubs.map((nombre, i) => ({
        id: `${task._id}-${i}`,
        nombre: nombre.trim(),
        asignados: [], 
    }));

    return {
        id: task._id,
        estructura: task.estructura,
        lineaTrabajo: task.lineaTrabajo,
        subnivel: task.subnivel,
        tareas,
        activo: task.isActive, 
    };
};

export const getAllTasks = async () => {
    const token = getToken();
    const res = await fetch(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        throw new Error("Error al cargar tareas para el buscador");
    }

    const raw = await res.json();

    console.log("RAW TASKS FROM API:", raw);

    return raw.map(parseTasksFromBackend);
};

export const createTask = async (task) => {
    const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(task),
    });

    if (!res.ok) throw new Error("Error al crear el proyecto");
    return await res.json();
};

export const updateTask = async (id, updates) => {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(updates),
    });

    if (!res.ok) throw new Error("Error al actualizar el proyecto");
    return await res.json();
};
