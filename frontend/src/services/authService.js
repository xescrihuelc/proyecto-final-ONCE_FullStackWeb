import { API_URL } from "../utils/config";

export const login = async (email, password) => {
    const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || "Credenciales incorrectas");
    }

    const data = await response.json();
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
    return data;
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
