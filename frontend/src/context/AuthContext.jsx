
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
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = getUserData();
        const storedToken = getToken();

        if (storedUser && storedToken) {
            setUser(storedUser);
            setToken(storedToken);
            setRoles(storedUser.roles || []);
        }

        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const data = await apiLogin(email, password);
        const fullUser = {
            ...data.user,
            dailyHours: data.user.dailyHours ?? 7.5,
            sesameEmployeeId: data.user.sesameEmployeeId ?? null,
        };

        setUser(fullUser);
        setToken(data.token);
        setRoles(fullUser.roles || []);

        localStorage.setItem("user", JSON.stringify(fullUser));
        localStorage.setItem("token", data.token);
    };

    const logout = () => {
        apiLogout();
        setUser(null);
        setToken(null);
        setRoles([]);

        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider
            value={{ user, token, roles, login, logout, loading }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
