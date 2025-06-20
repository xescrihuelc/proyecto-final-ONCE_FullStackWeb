// src/services/taskService.js
import { API_URL } from "../utils/config";

// Parsea cada proyecto recibido del backend en un objeto usable con tareas
export const parseTasksFromBackend = (task) => {
    const tareas =
        task.subtarea?.split(",").map((nombre, i) => ({
            id: `${task._id}-${i}`,
            nombre: nombre.trim(),
            asignados: [], // esto se puede actualizar desde frontend
        })) || [];

    return {
        id: task._id,
        nombre: task.estructura,
        esEuropeo: task.lineaTrabajo === "Europeo",
        activo: task.subnivel === "Activo",
        tareas,
    };
};

// Obtener todos los proyectos y convertirlos
export const getAllTasks = async () => {
    const res = await fetch(`${API_URL}/tasks`);
    if (!res.ok) throw new Error("Error al cargar proyectos");

    const raw = await res.json();
    return raw.map(parseTasksFromBackend);
};

// Crear un nuevo proyecto (convertido previamente en el componente)
export const createTask = async (task) => {
    const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
    });

    if (!res.ok) throw new Error("Error al crear el proyecto");
    return await res.json();
};

// Actualizar proyecto existente (si decides usarlo)
export const updateTask = async (id, updates) => {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
    });

    if (!res.ok) throw new Error("Error al actualizar el proyecto");
    return await res.json();
};
