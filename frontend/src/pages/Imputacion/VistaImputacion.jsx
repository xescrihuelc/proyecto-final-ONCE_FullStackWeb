// src/pages/VistaImputacion.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import CalendarioResumen from "../../components/CalendarioResumen/CalendarioResumen";
import ResumenHoras from "../../components/ResumenHoras/ResumenHoras";
import FormularioImputacionConReparto from "../../components/FormularioImputacionConReparto/FormularioImputacionConReparto";
import { getAllTasks } from "../../services/taskService";
import "./VistaImputacion.css";

export default function VistaImputacion() {
    const { user, loading: authLoading } = useAuth();
    const [periodo, setPeriodo] = useState("mes");
    const [tareas, setTareas] = useState([]);
    const [resumen, setResumen] = useState(null);

    useEffect(() => {
        getAllTasks()
            .then((all) => setTareas(all))
            .catch((err) => console.error("Error cargando tareas:", err));
    }, []);

    const handleResumen = useCallback((data) => {
        setResumen(data);
    }, []);

    if (authLoading || !user) {
        return <p>Cargando usuario…</p>;
    }

    return (
        <div className="vista-imputacion-container">
            <h2>Panel de Imputación de Horas</h2>

            <div className="periodo-selector">
                {["dia", "semana", "mes"].map((p) => (
                    <button
                        key={p}
                        className={periodo === p ? "active" : ""}
                        onClick={() => setPeriodo(p)}
                    >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                ))}
            </div>

            <CalendarioResumen periodo={periodo} />

            <ResumenHoras
                periodo={periodo}
                onResumenCalculado={handleResumen}
            />
            {resumen && (
                <div className="resumen-horas">
                    <p>
                        <strong>Días trabajados:</strong>{" "}
                        {resumen.diasTrabajados}
                    </p>
                    <p>
                        <strong>Horas totales:</strong>{" "}
                        {resumen.horasTotales.toFixed(2)}h
                    </p>
                    <p>
                        <strong>Horas imputadas:</strong>{" "}
                        {resumen.horasImputadas.toFixed(2)}h
                    </p>
                    <p>
                        <strong>Horas restantes:</strong>{" "}
                        {(
                            resumen.horasTotales - resumen.horasImputadas
                        ).toFixed(2)}
                        h
                    </p>
                </div>
            )}

            {resumen && (
                <FormularioImputacionConReparto
                    resumen={resumen}
                    tareas={tareas}
                    onSaved={() => {
                        setResumen(null);
                    }}
                />
            )}
        </div>
    );
}
