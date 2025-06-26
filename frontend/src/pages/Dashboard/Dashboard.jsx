// src/pages/Dashboard/Dashboard.jsx

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

    useEffect(() => {
        const hoy = new Date();
        const from = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
            .toISOString()
            .slice(0, 10);
        const to = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
            .toISOString()
            .slice(0, 10);

        getImputacionesPorRango(user.id, from, to)
            .then((imps) => {
                const suma = imps.reduce(
                    (acc, imp) => acc + (imp.hours || 0),
                    0
                );
                setHorasReales(suma);
            })
            .catch((err) => console.error("Error cargando horas reales:", err));
    }, [user.id]);

    const proyectosActivos = proyectos.filter((p) => p.activo);
    const proyectosInactivos = proyectos.filter((p) => !p.activo);
    const tareasPorProyecto = proyectos.map((p) => ({
        nombre: p.nombre || p.estructura,
        tareas: Array.isArray(p.tareas) ? p.tareas.length : 0,
    }));

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">Bienvenido, {user?.name}</h2>

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
                            <p>
                                {proyectos.reduce(
                                    (acc, p) =>
                                        acc +
                                        (Array.isArray(p.tareas)
                                            ? p.tareas.length
                                            : 0),
                                    0
                                )}
                            </p>
                        </div>
                        <div className="dashboard-card">
                            <h2>Horas Imputadas</h2>
                            <p>{horasReales.toFixed(2)} h</p>
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
        </div>
    );
};

export default Dashboard;
