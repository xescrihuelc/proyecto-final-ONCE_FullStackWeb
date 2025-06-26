// src/pages/VistaImputacion.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import CalendarioResumen from "../../components/CalendarioResumen/CalendarioResumen";
import FormularioImputacionConReparto from "../../components/FormularioImputacionConReparto/FormularioImputacionConReparto";
import { getAllTasks } from "../../services/taskService";
import { getAllUsers } from "../../services/userService";
import { getDiasSesame } from "../../services/sesameService";
import { getImputacionesPorRango } from "../../services/imputacionService";
import { getRangoDelPeriodo } from "../../utils/dateUtils";
import "./VistaImputacion.css";

export default function VistaImputacion() {
    const { user, loading: authLoading } = useAuth();
    const isAdmin = user.roles.includes("admin");

    // Estado principal
    const [periodo, setPeriodo] = useState("mes");
    const [rango, setRango] = useState({ from: null, to: null });
    const [tareas, setTareas] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(user.id);

    // Resumen numérico
    const [fechasTrabajadas, setFechasTrabajadas] = useState([]);
    const [diasTrabajados, setDiasTrabajados] = useState(0);
    const [horasTotales, setHorasTotales] = useState(0);
    const [horasImputadas, setHorasImputadas] = useState(0);

    // Informe por tarea (admin)
    const [tareasImputadas, setTareasImputadas] = useState([]);

    // 1) Cargo todas las tareas
    useEffect(() => {
        getAllTasks().then(setTareas).catch(console.error);
    }, []);

    // 2) Cargo todos los usuarios si soy admin
    useEffect(() => {
        if (!isAdmin) return;
        getAllUsers().then(setAllUsers).catch(console.error);
    }, [isAdmin]);

    // 3) Cada vez que cambie el periodo, recalculo rango
    useEffect(() => {
        const { from, to } = getRangoDelPeriodo(periodo);
        setRango({ from, to });
    }, [periodo]);

    // 4) Cada vez que cambie el rango o el usuario seleccionado, vuelvo a fetchar resumen
    useEffect(() => {
        if (!rango.from || !rango.to) return;
        Promise.all([
            getDiasSesame(user.sesameEmployeeId, rango.from, rango.to),
            getImputacionesPorRango(selectedUser, rango.from, rango.to),
        ])
            .then(([diasData, impData]) => {
                const trabajados = diasData.filter((d) => d.secondsWorked > 0);
                const fechas = trabajados.map((d) => d.date.slice(0, 10));
                const dailyH = user.dailyHours ?? 7.5;
                const totales = trabajados.length * dailyH;
                const imputadas = impData.reduce(
                    (a, r) => a + (r.hours || 0),
                    0
                );

                setFechasTrabajadas(fechas);
                setDiasTrabajados(trabajados.length);
                setHorasTotales(totales);
                setHorasImputadas(imputadas);
            })
            .catch(console.error);
    }, [rango, selectedUser, user]);

    // 5) Informe por tarea (solo admin)
    useEffect(() => {
        if (!isAdmin || fechasTrabajadas.length === 0) return;
        getImputacionesPorRango(
            selectedUser,
            fechasTrabajadas[0],
            fechasTrabajadas.at(-1)
        )
            .then((arr) => {
                const map = {};
                arr.forEach((r) => {
                    map[r.taskId] = (map[r.taskId] || 0) + r.hours;
                });
                setTareasImputadas(
                    Object.entries(map).map(([taskId, h]) => ({
                        taskId,
                        hours: h,
                    }))
                );
            })
            .catch(console.error);
    }, [isAdmin, selectedUser, fechasTrabajadas]);

    if (authLoading || !user) return <p>Cargando usuario…</p>;

    return (
        <div className="vista-imputacion-container">
            <h2>Panel de Imputación de Horas</h2>

            {/* Selector de periodo */}
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

            {/* Selector de usuario (solo admin) */}
            {isAdmin && (
                <div className="user-filter">
                    <label htmlFor="userSelect">Usuario:</label>
                    <select
                        id="userSelect"
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                    >
                        {allUsers.map((u) => (
                            <option key={u._id} value={u._id}>
                                {u.nombre} ({u.email})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Calendario */}
            <CalendarioResumen
                periodo={periodo}
                onRangoChange={({ from, to }) => setRango({ from, to })}
            />

            {/* Resumen numérico */}
            <div className="resumen-horas">
                <p>
                    <strong>Días trabajados:</strong> {diasTrabajados}
                </p>
                <p>
                    <strong>Horas totales:</strong> {horasTotales.toFixed(2)}h
                </p>
                <p>
                    <strong>Horas imputadas:</strong>{" "}
                    {horasImputadas.toFixed(2)}h
                </p>
                <p>
                    <strong>Horas restantes:</strong>{" "}
                    {(horasTotales - horasImputadas).toFixed(2)}h
                </p>
            </div>

            {/* Informe de tareas (solo admin) */}
            {isAdmin && tareasImputadas.length > 0 && (
                <div className="informe-tareas">
                    <h3>Informe de Tareas Imputadas</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Tarea ID</th>
                                <th>Horas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tareasImputadas.map(({ taskId, hours }) => (
                                <tr key={taskId}>
                                    <td>{taskId}</td>
                                    <td>{hours.toFixed(2)}h</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Formulario de imputación */}
            <FormularioImputacionConReparto
                resumen={{
                    userId: selectedUser,
                    diasTrabajados,
                    horasTotales,
                    fechasTrabajadas,
                }}
                tareas={tareas}
                onSaved={() => {
                    /* recarga si quieres */
                }}
            />
        </div>
    );
}
