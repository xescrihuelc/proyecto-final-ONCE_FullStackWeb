import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Imputacion from "./pages/Imputacion/Imputacion";
import AsignacionProyecto from "./pages/AsignacionProyecto/AsignacionProyecto";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import { useAuth } from "./context/AuthContext";
import GestionUsuarios from "./pages/GestionUsuarios/GestionUsuarios";
import AdminPage from "./pages/AdminPage/AdminPage";
import ImputacionHoras from "./pages/Imputacion/ImputacionHoras";
import ProtectedRoute from "./components/routing/ProtectedRoute";

import "./App.css";

function HomeRedirect() {
    const { role } = useAuth();

    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "manager")
        return <Navigate to="/AsignacionProyecto" replace />;
    if (role === "trabajador") return <Navigate to="/imputacion" replace />;

    // Si no tiene rol válido, logout forzado (opcional) o login
    return <Navigate to="/login" replace />;
}

function App() {
    const { token, logout } = useAuth();

    return (
        <BrowserRouter>
            {token ? (
                <div className="app-container">
                    <Sidebar />
                    <div className="main-content">
                        <Header onLogout={logout} />
                        <Routes>
                            {/* Login no accesible si ya hay token */}
                            <Route
                                path="/login"
                                element={<Navigate to="/" replace />}
                            />

                            {/* Ruta raíz que redirige según rol */}
                            <Route
                                path="/"
                                element={
                                    <ProtectedRoute>
                                        <HomeRedirect />
                                    </ProtectedRoute>
                                }
                            />
                            {/* Rutas protegidas */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/AsignacionProyecto"
                                element={
                                    <ProtectedRoute>
                                        <AsignacionProyecto />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/imputacion"
                                element={
                                    <ProtectedRoute>
                                        <Imputacion />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/imputacion-horas"
                                element={
                                    <ProtectedRoute>
                                        <ImputacionHoras />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute requiredRole="admin">
                                        <AdminPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/GestionUser"
                                element={
                                    <ProtectedRoute requiredRole="admin">
                                        <GestionUsuarios />
                                    </ProtectedRoute>
                                }
                            />
                            {/* Cualquier ruta no definida redirige a raíz */}
                            <Route
                                path="*"
                                element={<Navigate to="/" replace />}
                            />
                        </Routes>
                    </div>
                </div>
            ) : (
                // Sin token, solo acceso a login
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="*"
                        element={<Navigate to="/login" replace />}
                    />
                </Routes>
            )}
        </BrowserRouter>
    );
}

export default App;
