import React, { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const rawUser = localStorage.getItem("user");
            const rawToken = localStorage.getItem("token");
            const rawRole = localStorage.getItem("role");

            const parsedUser =
                rawUser && rawUser !== "undefined" ? JSON.parse(rawUser) : null;
            const parsedRole =
                rawRole && rawRole !== "undefined" ? rawRole : null;

            if (parsedUser && rawToken && parsedRole) {
                setUser(parsedUser);
                setToken(rawToken);
                setRole(parsedRole);
            }

            console.log("✅ Autenticación cargada desde localStorage:", {
                parsedUser,
                token: rawToken,
                role: parsedRole,
            });
        } catch (err) {
            console.error("❌ Error al cargar datos del usuario:", err);
            localStorage.clear(); // Limpia localStorage si hay corrupción
        } finally {
            setLoading(false); // Se ejecuta siempre, incluso si hay error
        }
    }, []);

    const login = (userData) => {
        setUser(userData.user);
        setToken(userData.token);
        setRole(userData.role);

        localStorage.setItem("user", JSON.stringify(userData.user));
        localStorage.setItem("token", userData.token);
        localStorage.setItem("role", userData.role);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setRole(null);
        localStorage.clear();
    };

    return (
        <AuthContext.Provider
            value={{ user, token, role, login, logout, loading }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
