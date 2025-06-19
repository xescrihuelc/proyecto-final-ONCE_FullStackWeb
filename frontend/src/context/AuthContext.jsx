import { createContext, useContext, useEffect, useState } from "react";
import { getToken, getUserData, logout as logoutService } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getToken());
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (token) {
      const data = getUserData();
      setUser(data);
      setRole(data?.role);
    }
  }, [token]);

 const login = (userData) => {
  localStorage.setItem("user", JSON.stringify(userData)); // 1. guardar
  setUser(userData); // 2. actualizar estado
  setToken(userData.token);
  setRole(userData.role);
};

  const logout = () => {
    logoutService();
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

export const useAuth = () => useContext(AuthContext);
