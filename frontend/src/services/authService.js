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

    const { Token } = await response.json();

    const resUser = await fetch(`${API_URL}/users`);
    if (!resUser.ok) throw new Error("Error al obtener usuarios");

    const allUsers = await resUser.json();
    const matchedUser = allUsers.find((u) => u.email === email);

    if (!matchedUser) throw new Error("Usuario no encontrado tras login");

    localStorage.setItem("user", JSON.stringify(matchedUser));
    localStorage.setItem("token", Token);

    return {
        user: {
            ...matchedUser,
            roles: Array.isArray(matchedUser.roles)
                ? matchedUser.roles
                : [matchedUser.roles],
        },
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
