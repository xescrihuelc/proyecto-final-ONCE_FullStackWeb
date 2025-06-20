// ===== Archivo: App.jsx =====

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
    const { role, loading } = useAuth();

    if (loading) return <p>Cargando...</p>;

    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "manager")
        return <Navigate to="/AsignacionProyecto" replace />;
    if (role === "trabajador") return <Navigate to="/imputacion" replace />;

    return <Navigate to="/login" replace />;
}

function App() {
    const { token, logout, loading } = useAuth();

    if (loading) return <p>Cargando autenticación...</p>;

    return (
        <BrowserRouter>
            {token ? (
                <>
                    <Header onLogout={logout} />{" "}
                    {/* 🔥 Mueve el header arriba y fuera */}
                    <div className="app-container">
                        <Sidebar />
                        <div className="main-content">
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
                                <Route
                                    path="*"
                                    element={<Navigate to="/" replace />}
                                />
                            </Routes>
                        </div>
                    </div>
                </>
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
