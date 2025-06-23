// ===== Archivo: App.jsx =====

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Imputacion from "./pages/Imputacion/Imputacion";
import ImputacionHoras from "./pages/Imputacion/ImputacionHoras";
import VistaImputacion from "./pages/Imputacion/VistaImputacion";
import AsignacionProyecto from "./pages/AsignacionProyecto/AsignacionProyecto";
import GestionUsuarios from "./pages/GestionUsuarios/GestionUsuarios";
import AdminPage from "./pages/AdminPage/AdminPage";

import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import ProtectedRoute from "./components/routing/ProtectedRoute";

import { useAuth } from "./context/AuthContext";
import "./App.css";

function HomeRedirect() {
    const { roles, loading } = useAuth();

    if (loading) return <p>Cargando...</p>;

    if (roles.includes("admin")) return <Navigate to="/admin" replace />;
    if (roles.includes("user"))
        return <Navigate to="/panel-imputacion" replace />;

    return <Navigate to="/login" replace />;
}

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
                            <Route
                                path="/login"
                                element={<Navigate to="/" replace />}
                            />
                            <Route
                                path="/"
                                element={
                                    <ProtectedRoute>
                                        <HomeRedirect />
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
                                path="/AsignacionProyecto"
                                element={
                                    <ProtectedRoute requiredRole="admin">
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
                                path="/panel-imputacion"
                                element={
                                    <ProtectedRoute>
                                        <VistaImputacion />
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
                            <Route
                                path="*"
                                element={<Navigate to="/" replace />}
                            />
                        </Routes>
                    </div>
                </div>
            ) : (
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
