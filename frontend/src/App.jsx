import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Imputacion from './pages/Imputacion/Imputacion';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import { getToken, logout } from './services/authService';
import "./App.css"

function App() {
  const [token, setToken] = useState(getToken());

  const handleLogout = () => {
    logout();
    setToken(null);
  };

  useEffect(() => {
    setToken(getToken());
  }, []);

  if (!token) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login onLogin={setToken} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Header onLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/imputacion" element={<Imputacion />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
