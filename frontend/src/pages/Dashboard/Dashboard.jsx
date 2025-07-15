import React, { useContext, useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ProyectoContext } from "../../context/ProyectoContext";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { getImputacionesPorRango } from "../../services/imputacionService";
import "./Dashboard.css";

const Dashboard = () => {
    const { roles, user } = useAuth();
    const { proyectos } = useContext(ProyectoContext);

    const [horasReales, setHorasReales] = useState(0);
    const [imputaciones, setImputaciones] = useState([]); // todas imputaciones
    const [loading, setLoading] = useState(true);

    const [mes, setMes] = useState(new Date().getMonth());
    const [anio, setAnio] = useState(new Date().getFullYear());

    useEffect(() => {
        const from = new Date(anio, mes, 1).toISOString().slice(0, 10);
        const to = new Date(anio, mes + 1, 0).toISOString().slice(0, 10);

        // Si es admin, puede ver imputaciones de todos (null userId), sino solo las propias
        const userId = roles?.includes("admin") ? null : user.id;

        setLoading(true);
        getImputacionesPorRango(userId, from, to)
            .then((resp) => {
                const imps = Array.isArray(resp.data) ? resp.data : [];
                setImputaciones(imps);

                // Sumar horas totales
                const suma = imps.reduce(
                    (acc, imp) => acc + (imp.hours || 0),
                    0
                );
                setHorasReales(suma);
            })
            .catch((err) => console.error("Error cargando horas reales:", err))
            .finally(() => setLoading(false));
    }, [user.id, roles, mes, anio]);

    // Proyectos activos/inactivos para cards
    const proyectosActivos = proyectos.filter((p) => p.activo);
    const proyectosInactivos = proyectos.filter((p) => !p.activo);

    // Tareas totales (suponiendo tareas es array)
    const tareasTotales = proyectos.reduce(
        (acc, p) => acc + (Array.isArray(p.tareas) ? p.tareas.length : 0),
        0
    );

    // Preparar datos para gráfico: tareas y horas imputadas por proyecto
    // Mapeamos proyectos a objeto { nombre, tareas, horasImputadas, horasPlanificadas, diferencia }
    const dataProyectos = proyectos.map((p) => {
        const nombre = p.nombre || p.estructura || "Sin nombre";

        // Contar tareas
        const tareasCount = Array.isArray(p.tareas) ? p.tareas.length : 0;

        // Calcular horas imputadas para ese proyecto sumando las imputaciones que tengan taskId de sus tareas
        const tareasIds = Array.isArray(p.tareas)
            ? p.tareas.map((t) => t._id || t.id)
            : [];

        // Filtrar imputaciones que correspondan a tareas del proyecto
        const horasImputadasProyecto = imputaciones
            .filter((imp) => tareasIds.includes(imp.taskId))
            .reduce((acc, imp) => acc + (imp.hours || 0), 0);

        // Suponemos que cada tarea tiene plannedHours (horas previstas)
        const horasPlanificadas = Array.isArray(p.tareas)
            ? p.tareas.reduce((acc, t) => acc + (t.plannedHours || 0), 0)
            : 0;

        const diferencia = horasPlanificadas - horasImputadasProyecto;

        return {
            nombre,
            tareas: tareasCount,
            horasImputadas: horasImputadasProyecto,
            horasPlanificadas,
            diferencia,
        };
    });

    if (loading) return <p>Cargando datos del dashboard...</p>;

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">Bienvenido, {user?.name}</h2>

            <div className="dashboard-filter">
                <label>
                    Mes:
                    <select
                        value={mes}
                        onChange={(e) => setMes(parseInt(e.target.value))}
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i}>
                                {new Date(0, i).toLocaleString("es-ES", {
                                    month: "long",
                                })}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Año:
                    <input
                        type="number"
                        min="2000"
                        max="2100"
                        value={anio}
                        onChange={(e) =>
                            setAnio(parseInt(e.target.value) || anio)
                        }
                    />
                </label>
            </div>

            {roles?.includes("admin") && (
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
                            <p>{tareasTotales}</p>
                        </div>
                        <div className="dashboard-card">
                            <h2>Horas Imputadas este mes</h2>
                            <p>{horasReales.toFixed(2)} h</p>
                        </div>
                    </div>

                    <div className="dashboard-graph-container">
                        <h3>Gráfico: Tareas y Horas Imputadas por Proyecto</h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={dataProyectos}>
                                <XAxis dataKey="nombre" />
                                <YAxis allowDecimals={false} />
                                <Tooltip
                                    formatter={(value, name) => [
                                        value,
                                        name === "diferencia"
                                            ? "Diferencia Horas"
                                            : name === "horasImputadas"
                                            ? "Horas Imputadas"
                                            : name === "horasPlanificadas"
                                            ? "Horas Planificadas"
                                            : name,
                                    ]}
                                />
                                <Bar dataKey="tareas" fill="#00a3e0" />
                                <Bar dataKey="horasImputadas" fill="#27ae60" />
                                <Bar dataKey="diferencia" fill="#e74c3c" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            )}

            {!roles?.includes("admin") && (
                <section className="dashboard-section">
                    <div className="dashboard-card">
                        <h2>Horas imputadas este mes</h2>
                        <p>{horasReales.toFixed(2)} h</p>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Dashboard;
