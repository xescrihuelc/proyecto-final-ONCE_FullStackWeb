import React, { useState, useEffect, useCallback } from "react";
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
    const [periodo, setPeriodo] = useState("mes");
    const [reloadKey, setReloadKey] = useState(0);

    const handleResumen = useCallback((data) => setResumen(data), []);

    const triggerReload = useCallback(() => {
        setReloadKey((n) => n + 1);
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const all = await getAllTasks();
                setTareas(all);
            } catch (err) {
                console.error(err);
            }
        })();
    }, []);

    if (loading || !user) return <p>Cargando usuario…</p>;

    return (
        <>
            <div id="top" />
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

                {/* Forzamos nuevo cálculo de resumen cuando reloadKey cambie */}
                <ResumenHoras
                    key={reloadKey}
                    periodo={periodo}
                    onResumenCalculado={handleResumen}
                />

                {resumen && (
                    <FormularioImputacionConReparto
                        resumen={resumen}
                        tareas={tareas}
                        onSaved={triggerReload}
                    />
                )}
            </div>
            <div className="scroll-buttons">
                <a href="#top" title="Ir arriba">
                    ↑
                </a>
                <a href="#bottom" title="Ir abajo">
                    ↓
                </a>
            </div>
            <div id="bottom" />
        </>
    );
}
