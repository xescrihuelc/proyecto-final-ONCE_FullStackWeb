import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import VICLogo from '../../assets/LOGO_VIC_BLANCO.png'
import "./Sidebar.css";

export default function Sidebar() {
  const { roles, logout, user } = useAuth();

  return (
    <>
      <nav className="sidebar">
        <img src={VICLogo} alt="Logo" />
        <h2>Menú</h2>
        <ul>
          <li>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </li>
          <li>
            <NavLink to="/panel-imputacion">Imputación de Horas</NavLink>
          </li>

          {roles?.includes("admin") && (
            <>
              <li>
                <NavLink to="/AsignacionProyecto">Proyectos</NavLink>
              </li>
              {/* <li>
                <NavLink to="/admin">Admin Proyectos</NavLink>
              </li> */}
              <li>
                <NavLink to="/GestionUser">Gestión de Usuarios</NavLink>
              </li>
            </>
          )}
        </ul>

        {/* Solo visible en escritorio */}
        <div className="sidebar-footer sidebar-desktop-only">
          <small>
            {user?.name} ({roles?.join(", ")})
          </small>
          <button onClick={logout} className="sidebar-logout">
            Cerrar sesión
          </button>
        </div>
      </nav>
    </>
  );
}
