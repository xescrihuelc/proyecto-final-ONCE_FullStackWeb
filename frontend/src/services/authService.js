// src/services/authService.js

import { API_URL } from "../utils/config";

export const login = async (email, password) => {
    const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Credenciales incorrectas");
    }

    const { token } = await response.json();

    const resUser = await fetch(`${API_URL}/users`);
    if (!resUser.ok) throw new Error("Error al obtener usuarios");

    const allUsers = await resUser.json();
    const matchedUser = allUsers.find((u) => u.email === email);
    if (!matchedUser) throw new Error("Usuario no encontrado tras login");

    const fullUser = {
        ...matchedUser,
        id: matchedUser._id,
        dailyHours: matchedUser.dailyHours ?? 7.5,
        sesameEmployeeId:
            matchedUser.sesameEmployeeId ?? matchedUser.id ?? null,
    };

    localStorage.setItem("user", JSON.stringify(fullUser));
    localStorage.setItem("token", token);

    return {
        user: {
            ...fullUser,
            roles: Array.isArray(fullUser.roles)
                ? fullUser.roles
                : [fullUser.roles],
        },
        token,
    };
};

export const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
};

export const getToken = () => localStorage.getItem("token");

export const getUserData = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};
