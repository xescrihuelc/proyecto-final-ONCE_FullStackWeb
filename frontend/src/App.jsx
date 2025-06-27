// src/App.jsx

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import AdminPage from "./pages/AdminPage/AdminPage";
import AsignacionProyecto from "./pages/AsignacionProyecto/AsignacionProyecto";
import Dashboard from "./pages/Dashboard/Dashboard";
import GestionUsuarios from "./pages/GestionUsuarios/GestionUsuarios";
import VistaImputacion from "./pages/Imputacion/VistaImputacion";
import Login from "./pages/Login/Login";

import Header from "./components/Header/Header";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import Sidebar from "./components/Sidebar/Sidebar";

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
                element={<Navigate to="/panel-imputacion" replace />}
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
                element={<Navigate to="/panel-imputacion" replace />}
              />
            </Routes>
          </div>
        </div>
      ) : (
        <Routes>
          {/* Ruta pública de login */}
          <Route path="/login" element={<Login />} />
          {/* Si no está autenticado, cualquier otra URL va a login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
