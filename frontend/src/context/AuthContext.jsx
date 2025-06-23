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
            setRoles(storedUser.roles || []); // Usar array
        }

        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const data = await apiLogin(email, password);
        setUser(data.user);
        setToken(data.token);
        setRoles(data.user.roles || []);
    };

    const logout = () => {
        apiLogout();
        setUser(null);
        setToken(null);
        setRoles([]);
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
