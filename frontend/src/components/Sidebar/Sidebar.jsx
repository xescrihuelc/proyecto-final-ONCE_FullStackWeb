import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

export default function Sidebar() {
    const { role, logout, user } = useAuth();

    return (
        <>
            <nav className="sidebar">
                <h2>Menú</h2>
                <ul>
                    <li>
                        <NavLink to="/dashboard">Dashboard</NavLink>
                    </li>
                    <li>
                        <NavLink to="/imputacion">Imputación de Horas</NavLink>
                    </li>

                    {role === "admin" && (
                        <>
                            <li>
                                <NavLink to="/AsignacionProyecto">
                                    Proyectos
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin">Admin Proyectos</NavLink>
                            </li>
                            <li>
                                <NavLink to="/GestionUser">
                                    Gestión de Usuarios
                                </NavLink>
                            </li>
                        </>
                    )}
                </ul>

                {/* Solo visible en escritorio */}
                <div className="sidebar-footer sidebar-desktop-only">
                    <small>
                        {user?.nombre} ({role})
                    </small>
                    <button onClick={logout} className="sidebar-logout">
                        Cerrar sesión
                    </button>
                </div>
            </nav>

            {/* Solo visible en móvil */}
            <div className="sidebar-footer sidebar-mobile-only">
                <small>
                    {user?.nombre} ({role})
                </small>
                <button onClick={logout} className="sidebar-logout">
                    Cerrar sesión
                </button>
            </div>
        </>
    );
}
