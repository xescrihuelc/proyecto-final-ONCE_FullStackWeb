// src/components/VistaImputacion/VistaImputacion.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAllTasks } from "../../services/taskService";
import { getAllUsers } from "../../services/userService";
import { getDiasSesame } from "../../services/sesameService";
import { getImputacionesPorRango } from "../../services/imputacionService";
import { getRangoDelPeriodo } from "../../utils/dateUtils";
import CalendarioResumen from "../../components/CalendarioResumen/CalendarioResumen";
import ResumenHoras from "../../components/ResumenHoras/ResumenHoras";
import FormularioImputacionConReparto from "../../components/FormularioImputacionConReparto/FormularioImputacionConReparto";
import "./VistaImputacion.css";

export default function VistaImputacion() {
    const { user, loading: authLoading } = useAuth();
    const isAdmin = user.roles.includes("admin");

    // Mismo esquema de activeUserId
    const [activeUserId, setActiveUserId] = useState(user.id);
    const [allUsers, setAllUsers] = useState([]);

    const [tareas, setTareas] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [periodo, setPeriodo] = useState("mes");
    const [isLoadingResumen, setIsLoadingResumen] = useState(true);

    // 1) Carga usuarios para admin
    useEffect(() => {
        if (!isAdmin) return;
        getAllUsers().then(setAllUsers).catch(console.error);
    }, [isAdmin]);

    // 2) Carga todas las tareas (para el formulario)
    useEffect(() => {
        getAllTasks().then(setTareas).catch(console.error);
    }, []);

    // 3) Recalcula resumen cada vez que cambien periodo o activeUserId
    const recalculateResumen = useCallback(async () => {
        if (!activeUserId || !user.sesameEmployeeId) return;
        setIsLoadingResumen(true);
        const { from, to } = getRangoDelPeriodo(periodo);
        const [diasData, horasData] = await Promise.all([
            getDiasSesame(user.sesameEmployeeId, from, to),
            getImputacionesPorRango(activeUserId, from, to),
        ]);
        const diasConTrabajo = diasData.filter((d) => d.secondsWorked > 0);
        const fechas = diasConTrabajo.map((d) => d.date.slice(0, 10));
        const sumaHoras = horasData.reduce((sum, r) => sum + r.hours, 0);
        const totalHoras = fechas.length * (user.dailyHours ?? 7.5);

        setResumen({
            userId: activeUserId,
            diasTrabajados: fechas.length,
            horasTotales: totalHoras,
            horasImputadas: sumaHoras,
            fechasTrabajadas: fechas,
        });
        setIsLoadingResumen(false);
    }, [activeUserId, user, periodo]);

    useEffect(() => {
        if (!authLoading) recalculateResumen();
    }, [authLoading, recalculateResumen]);

    if (authLoading) return <p>Cargando usuario…</p>;

    return (
        <div className="vista-imputacion-container">
            <h2>Panel de Imputación de Horas</h2>

            {isAdmin && (
                <div className="user-filter">
                    <label htmlFor="userSelect">Usuario:</label>
                    <select
                        id="userSelect"
                        value={activeUserId}
                        onChange={(e) => setActiveUserId(e.target.value)}
                    >
                        <option value="">— Selecciona usuario —</option>
                        {allUsers.map((u) => (
                            <option key={u._id} value={u._id}>
                                {u.nombre} ({u.email})
                            </option>
                        ))}
                    </select>
                </div>
            )}

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

            {isLoadingResumen ? (
                <p>Cargando datos…</p>
            ) : (
                <>
                    <ResumenHoras resumen={resumen} />
                    <FormularioImputacionConReparto
                        resumen={resumen}
                        tareas={tareas}
                        onSaved={recalculateResumen}
                    />
                </>
            )}
        </div>
    );
}
