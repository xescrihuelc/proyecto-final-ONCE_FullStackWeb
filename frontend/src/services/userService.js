import { API_URL } from "../utils/config";

const authHeaders = () => {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
    const imp = localStorage.getItem("impersonateUserId");
    if (imp) headers["X-Impersonate-User"] = imp;
    return headers;
};

export const getAllUsers = async () => {
    const res = await fetch(`${API_URL}/users`, {
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener usuarios");
    return res.json();
};

export const createUser = async (usuario) => {
    const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(usuario),
    });
    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Error al crear usuario");
    }
    return await res.json();
};

export const updateUser = async (id, updates) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(updates),
    });
    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Error al actualizar usuario");
    }
    return await res.json();
};

export const deleteUser = async (id) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Error al eliminar usuario");
    return await res.json();
};

