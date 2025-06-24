// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import VistaImputacion from "./pages/Imputacion/VistaImputacion";
import AsignacionProyecto from "./pages/AsignacionProyecto/AsignacionProyecto";
import GestionUsuarios from "./pages/GestionUsuarios/GestionUsuarios";
import AdminPage from "./pages/AdminPage/AdminPage";

import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header";
import ProtectedRoute from "./components/routing/ProtectedRoute";

import "./App.css";

function App() {
    const { token, logout, loading } = useAuth();

    if (loading) return <p>Cargando autenticación...</p>;

    return (
        <BrowserRouter>
            {token ? (
                <div className="app-container">
                    <Sidebar />
                    <div className="main-content">
                        <Header onLogout={logout} />
                        <Routes>
                            {/* Intentar acceder a /login redirige al panel */}
                            <Route
                                path="/login"
                                element={
                                    <Navigate to="/panel-imputacion" replace />
                                }
                            />

                            {/* Rutas protegidas */}
                            <Route
                                path="/panel-imputacion"
                                element={
                                    <ProtectedRoute>
                                        <VistaImputacion />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/imputacion-horas"
                                element={
                                    <ProtectedRoute>
                                        <VistaImputacion />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/AsignacionProyecto"
                                element={
                                    <ProtectedRoute requiredRole="admin">
                                        <AsignacionProyecto />
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
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute requiredRole="admin">
                                        <AdminPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Cualquier otra ruta en sesión autenticada vuelve al panel */}
                            <Route
                                path="*"
                                element={
                                    <Navigate to="/panel-imputacion" replace />
                                }
                            />
                        </Routes>
                    </div>
                </div>
            ) : (
                <Routes>
                    {/* Ruta pública de login */}
                    <Route path="/login" element={<Login />} />
                    {/* Si no está autenticado, cualquier otra URL va a login */}
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
