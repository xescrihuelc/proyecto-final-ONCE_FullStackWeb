// ===== Dashboard.jsx corregido (usando las clases correctas del CSS) =====

import { useAuth } from "../../context/AuthContext";
import { useContext } from "react";
import { ProyectoContext } from "../../context/ProyectoContext";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";

const Dashboard = () => {
    const { role, user } = useAuth();
    const { proyectos } = useContext(ProyectoContext);

    const proyectosActivos = proyectos.filter((p) => p.activo);
    const proyectosInactivos = proyectos.filter((p) => !p.activo);

    const tareasPorProyecto = proyectos.map((p) => ({
        nombre: p.nombre,
        tareas: p.tareas.length,
    }));

    const horasTotales = proyectos.reduce((acc, p) => {
        return acc + p.tareas.reduce((sum, t) => sum + (t.horas || 0), 0);
    }, 0);

    const tareasUsuario = proyectos.flatMap((p) =>
        p.tareas.filter((t) => t.asignados?.includes(user?.id))
    );

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">Bienvenido, {user?.nombre}</h2>
            <p className="dashboard-subtitle">
                Rol: <strong>{role}</strong>
            </p>

            {role === "admin" && (
                <section className="dashboard-section">
                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <h2>Proyectos Activos</h2>
                            <p>{proyectosActivos.length}</p>
                        </div>
                        <div className="dashboard-card">
                            <h2>Proyectos Inactivos</h2>
                            <p>{proyectosInactivos.length}</p>
                        </div>
                        <div className="dashboard-card">
                            <h2>Tareas Totales</h2>
                            <p>
                                {proyectos.reduce(
                                    (acc, p) => acc + p.tareas.length,
                                    0
                                )}
                            </p>
                        </div>
                        <div className="dashboard-card">
                            <h2>Horas Imputadas (demo)</h2>
                            <p>{horasTotales.toFixed(1)} h</p>
                        </div>
                    </div>

                    <div className="dashboard-graph-container">
                        <h3>Gráfico: Tareas por Proyecto</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={tareasPorProyecto}>
                                <XAxis dataKey="nombre" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="tareas" fill="#00a3e0" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            )}

            {role === "manager" && (
                <section className="dashboard-section">
                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <h2>Proyectos Activos</h2>
                            <p>{proyectosActivos.length}</p>
                        </div>
                        <div className="dashboard-card">
                            <h2>Tareas por Validar</h2>
                            <p>{tareasUsuario.length}</p>
                        </div>
                    </div>
                    <div className="dashboard-message">
                        Este panel será más últil cuando se integren
                        validaciones por backend.
                    </div>
                </section>
            )}

            {role === "trabajador" && (
                <section className="dashboard-section">
                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <h2>Tareas Asignadas</h2>
                            <p>{tareasUsuario.length}</p>
                        </div>
                        <div className="dashboard-card">
                            <h2>Proyectos</h2>
                            <p>
                                {
                                    [
                                        ...new Set(
                                            tareasUsuario.map(
                                                (t) => t.proyectoId
                                            )
                                        ),
                                    ].length
                                }
                            </p>
                        </div>
                    </div>
                    <div className="dashboard-message">
                        Recuerda imputar tus horas cada día. ¡Gracias!
                    </div>
                </section>
            )}
        </div>
    );
};

export default Dashboard;
