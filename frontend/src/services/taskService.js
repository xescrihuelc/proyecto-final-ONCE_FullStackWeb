// src/services/taskService.js

import { API_URL } from "../utils/config";
import { getToken } from "./authService";

/**
 * Toma el objeto tal cual viene desde el backend y
 * devuelve la forma que necesita el Front:
 * - id
 * - estructura
 * - subnivel
 * - tareas: array de { id, nombre, asignados }
 * - activo: boolean (viene de task.isActive)
 * - lineaTrabajo: string (si lo necesitas más adelante)
 */
export const parseTasksFromBackend = (task) => {
    // Aseguramos que siempre haya al menos "(Sin subtarea)"
    const rawSubs =
        task.subtarea && task.subtarea.trim().length > 0
            ? task.subtarea.split(",")
            : ["(Sin subtarea)"];

    const tareas = rawSubs.map((nombre, i) => ({
        id: `${task._id}-${i}`,
        nombre: nombre.trim(),
        asignados: [], // si luego aplicas asignaciones
    }));

    return {
        id: task._id,
        estructura: task.estructura,
        lineaTrabajo: task.lineaTrabajo,
        subnivel: task.subnivel,
        tareas,
        activo: task.isActive, // ← aquí la marca de activo/inactivo
    };
};

/**
 * Llama al endpoint /tasks, imprime el RAW (opcional) y
 * lo mapea con parseTasksFromBackend.
 */
export const getAllTasks = async () => {
    const token = getToken();
    const res = await fetch(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        throw new Error("Error al cargar tareas para el buscador");
    }

    const raw = await res.json();

    // Para depuración: ver el array completo que viene del backend
    console.log("RAW TASKS FROM API:", raw);

    return raw.map(parseTasksFromBackend);
};

/**
 * Resto de funciones (POST, PATCH) quedan igual:
 */

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
