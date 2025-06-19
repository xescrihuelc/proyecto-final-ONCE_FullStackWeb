// ===== Archivo: components/Sidebar/Sidebar.jsx =====

import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

export default function Sidebar() {
    const { role } = useAuth();

    return (
        <nav className="sidebar">
            <h2>Menú</h2>
            <ul>
                <li>
                    <NavLink to="/dashboard">Dashboard</NavLink>
                </li>
                <li>
                    <NavLink to="/imputacion">Imputación de Horas</NavLink>
                </li>
                <li>
                    <NavLink to="/AsignacionProyecto">Proyectos</NavLink>
                </li>
                {role === "admin" && (
                    <li>
                        <NavLink to="/admin">
                            Admistrar Proyectos - Usuarios
                        </NavLink>
                    </li>
                )}
                {role === "admin" && (
                    <li>
                        <NavLink to="/GestionUser">Gestión de Usuarios</NavLink>
                    </li>
                )}
            </ul>
        </nav>
    );
}
