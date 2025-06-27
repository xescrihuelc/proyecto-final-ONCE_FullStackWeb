import { API_URL } from "../utils/config";
import { getToken } from "./authService";

export const parseTasksFromBackend = (task) => {
    const t = Array.isArray(task) ? task[0] : task;

    const tareas = [
        {
            id: t._id,
            nombre: t.subtarea,
            subtarea: t.subtarea,
            asignados: t.assignedUsers || [],
        },
    ];

    return {
        id: t._id,
        estructura: t.estructura,
        lineaTrabajo: t.lineaTrabajo,
        subnivel: t.subnivel,
        tareas,
        activo: t.isActive,
    };
};

export const getAllTasks = async () => {
    const token = getToken();
    const res = await fetch(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        throw new Error("Error al cargar tareas");
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
    if (!res.ok) {
        throw new Error("Error al crear el proyecto");
    }
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
    if (!res.ok) {
        throw new Error("Error al actualizar el proyecto");
    }
    return await res.json();
};

// Ahora usamos PATCH a /tasks/:id/assign y quitamos subIndex
export const assignTaskToUser = async ({ taskId, userId }) => {
    const res = await fetch(`${API_URL}/tasks/${taskId}/assign`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
        throw new Error("No se pudo asignar la tarea");
    }
    return await res.json();
};

export const getAssignedTasks = async () => {
    const token = getToken();
    const res = await fetch(`${API_URL}/tasks/assigned`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        throw new Error("Error al cargar tareas asignadas");
    }
    const raw = await res.json();
    return raw.map(parseTasksFromBackend);
};
