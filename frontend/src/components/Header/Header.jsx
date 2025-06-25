import React from "react";
import "./Header.css";
import { useAuth } from "../../context/AuthContext";

export default function Header({ onLogout }) {
    const { user } = useAuth();

    return (
        <header className="header">
            <h1>Equipo VIC - Gestión de Horas</h1>
            {user && <div className="header-user-info"></div>}
        </header>
    );
}
