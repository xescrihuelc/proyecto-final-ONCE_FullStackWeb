// ===== Archivo: components/Header/Header.jsx =====

import React from "react";
import "./Header.css";

export default function Header({ onLogout }) {
    return (
        <header className="header">
            <h1>Equipo VIC - Gestión de Horas</h1>
            <button className="btn-logout" onClick={onLogout}>
                Cerrar sesión
            </button>
        </header>
    );
}
