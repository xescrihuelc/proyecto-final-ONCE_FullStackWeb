
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

    const handleResumen = useCallback((data) => {
        setResumen(data);
    }, []);

    useEffect(() => {
        async function fetchTareas() {
            try {
                const tareasFromApi = await getAllTasks();
                console.log("Tareas recibidas:", tareasFromApi);
                setTareas(tareasFromApi);
            } catch (err) {
                console.error("Error al cargar tareas:", err);
            }
        }
        fetchTareas();
    }, []);

    if (loading || !user) return <p>Cargando datos de usuario...</p>;

    return (
        <>
            {/* Punto de anclaje superior */}
            <div id="top"></div>

            <div className="vista-imputacion-container">
                <h2>Panel de Imputación de Horas</h2>

                {/* Selector de periodo */}
                <div className="periodo-selector">
                    <button
                        className={periodo === "dia" ? "active" : ""}
                        onClick={() => setPeriodo("dia")}
                    >
                        Día
                    </button>
                    <button
                        className={periodo === "semana" ? "active" : ""}
                        onClick={() => setPeriodo("semana")}
                    >
                        Semana
                    </button>
                    <button
                        className={periodo === "mes" ? "active" : ""}
                        onClick={() => setPeriodo("mes")}
                    >
                        Mes
                    </button>
                </div>

                {/* Calendario y resumen */}
                <CalendarioResumen periodo={periodo} />
                <ResumenHoras
                    periodo={periodo}
                    onResumenCalculado={handleResumen}
                />

                {/* Formulario con tareas */}
                {resumen && (
                    <FormularioImputacionConReparto
                        resumen={resumen}
                        tareas={tareas}
                    />
                )}
            </div>

            {/* Anclas de navegación inferior */}
            <div className="scroll-buttons">
                <a href="#top" className="scroll-btn" title="Ir arriba">
                    ↑
                </a>
                <a href="#bottom" className="scroll-btn" title="Ir abajo">
                    ↓
                </a>
            </div>
            <div id="bottom"></div>
        </>
    );
}
