// src/pages/Imputacion/VistaImputacion.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAllTasks } from "../../services/taskService";
import CalendarioResumen from "../../components/CalendarioResumen/CalendarioResumen";
import ResumenHoras from "../../components/ResumenHoras/ResumenHoras";
import FormularioImputacionConReparto from "../../components/FormularioImputacionConReparto/FormularioImputacionConReparto";
import "./VistaImputacion.css";

export default function VistaImputacion() {
    const { user, loading } = useAuth();
    const [resumen, setResumen] = useState(null);
    const [tareas, setTareas] = useState([]);

    // Carga todas las tareas planas
    useEffect(() => {
        async function fetchTareas() {
            try {
                const projects = await getAllTasks();
                // Cada proyecto tiene un array `tareas`; aplanamos todos en uno
                const allTasks = projects.flatMap((p) => p.tareas);
                setTareas(allTasks);
            } catch (err) {
                console.error("Error al cargar tareas:", err);
            }
        }
        fetchTareas();
    }, []);

    if (loading || !user) {
        return <p>Cargando datos de usuario...</p>;
    }

    return (
        <div className="vista-imputacion-container">
            <h2>Panel de Imputación de Horas</h2>

            <CalendarioResumen periodo="mes" />

            <ResumenHoras
                periodo="mes"
                onResumenCalculado={(resumenData) => setResumen(resumenData)}
            />

            {resumen && (
                <FormularioImputacionConReparto
                    resumen={resumen}
                    tareas={tareas}
                />
            )}
        </div>
    );
}
