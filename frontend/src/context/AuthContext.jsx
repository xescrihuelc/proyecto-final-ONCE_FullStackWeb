import React, { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);

    const login = (userData) => {
        setUser(userData.user);
        setToken(userData.token);
        setRole(userData.role);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
