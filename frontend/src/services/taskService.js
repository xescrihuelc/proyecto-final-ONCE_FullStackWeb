
import { API_URL } from "../utils/config";
import { getToken } from "./authService";

export const parseTasksFromBackend = (task) => {
    const tareas =
        task.subtarea?.length > 0
            ? task.subtarea.split(",").map((nombre, i) => ({
                  id: `${task._id}-${i}`,
                  nombre: nombre.trim(),
                  asignados: [],
              }))
            : [
                  {
                      id: `${task._id}-0`,
                      nombre: "(Sin subtarea)",
                      asignados: [],
                  },
              ];

    return {
        id: task._id,
        nombre: task.estructura,
        esEuropeo: task.lineaTrabajo?.includes("Europeo"),
        activo: true,  
        tareas,
    };
};

export const getAllTasks = async () => {
    const token = getToken();
    const res = await fetch(`${API_URL}/tasks`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error("Error al cargar tareas para el buscador");
    }

    const raw = await res.json();
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
