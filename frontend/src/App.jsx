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

import React, { useState } from "react";

import "./App.css";

function App() {
  const { token, logout, loading } = useAuth();
  const [recargaTrigger, setRecargaTrigger] = useState(0);

  if (loading) return <p>Cargando autenticación...</p>;

  // Función que incrementa el trigger para forzar recarga
  const handleRecarga = () => setRecargaTrigger((prev) => prev + 1);

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
                element={<Navigate to="/panel-imputacion" replace />}
              />

              <Route
                path="/panel-imputacion"
                element={
                  <ProtectedRoute>
                    <VistaImputacion onDashboardRefresh={handleRecarga} />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard recargaTrigger={recargaTrigger} />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/imputacion-horas"
                element={
                  <ProtectedRoute>
                    <VistaImputacion onDashboardRefresh={handleRecarga} />
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

              <Route
                path="*"
                element={<Navigate to="/panel-imputacion" replace />}
              />
            </Routes>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
