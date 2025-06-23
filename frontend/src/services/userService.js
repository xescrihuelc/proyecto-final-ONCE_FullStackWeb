// src/services/userService.js
import { API_URL } from "../utils/config";

export const getAllUsers = async () => {
    const res = await fetch(`${API_URL}/users`);
    if (!res.ok) throw new Error("Error al obtener usuarios");
    return await res.json();
};

export const createUser = async (usuario) => {
    const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(usuario),
    });

    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Error al crear usuario");
    }

    return await res.text();
};

export const updateUser = async (id, updates) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
    });

    if (!res.ok) throw new Error("Error al actualizar el usuario");
    return await res.json();
};

// Bonus: podrías agregar también esto si luego implementas edición y borrado
export const deleteUser = async (id) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
    });

    if (!res.ok) throw new Error("Error al eliminar usuario");
    return await res.json();
};
