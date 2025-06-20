import { createContext, useContext, useEffect, useState } from "react";
import {
    login as apiLogin,
    logout as apiLogout,
    getUserData,
    getToken,
} from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = getUserData();
        const storedToken = getToken();

        if (storedUser && storedToken) {
            setUser(storedUser);
            setToken(storedToken);
            setRole(storedUser.role);
        }

        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const data = await apiLogin(email, password);
        setUser(data.user);
        setToken(data.token);
        setRole(data.user.role);
    };

    const logout = () => {
        apiLogout();
        setUser(null);
        setToken(null);
        setRole(null);
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
