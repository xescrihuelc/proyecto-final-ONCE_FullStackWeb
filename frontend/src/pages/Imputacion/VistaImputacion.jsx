// src/pages/VistaImputacion.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import CalendarioResumen from "../../components/CalendarioResumen/CalendarioResumen";
import FormularioImputacionConReparto from "../../components/FormularioImputacionConReparto/FormularioImputacionConReparto";
import { getAllTasks } from "../../services/taskService";
import { getAllUsers } from "../../services/userService";
import { getDiasSesame } from "../../services/sesameService";
import { getImputacionesPorRango } from "../../services/imputacionService";
import "./VistaImputacion.css";

export default function VistaImputacion() {
    const { user, loading: authLoading } = useAuth();
    const isAdmin = user.roles.includes("admin");

    // 1) Estado
    const [periodo, setPeriodo] = useState("mes");
    const [rango, setRango] = useState({ from: null, to: null });
    const [tareas, setTareas] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(user.id);

    // resumen numérico
    const [fechasTrab, setFechasTrab] = useState([]);
    const [diasTrab, setDiasTrab] = useState(0);
    const [horasTot, setHorasTot] = useState(0);
    const [horasImp, setHorasImp] = useState(0);

    // informe admin
    const [tareasImp, setTareasImp] = useState([]);

    // 2) cargar tareas
    useEffect(() => {
        getAllTasks().then(setTareas).catch(console.error);
    }, []);

    // 3) cargar usuarios (admin)
    useEffect(() => {
        if (!isAdmin) return;
        getAllUsers().then(setAllUsers).catch(console.error);
    }, [isAdmin]);

    // 4) cuando cambie rango o usuario, recalculamos resumen
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
                const tot = trabajados.length * dailyH;
                const imp = impData.reduce((sum, r) => sum + (r.hours || 0), 0);

                setFechasTrab(fechas);
                setDiasTrab(trabajados.length);
                setHorasTot(tot);
                setHorasImp(imp);
            })
            .catch(console.error);
    }, [rango, selectedUser, user]);

    // 5) admin: agrupar horas por tarea
    useEffect(() => {
        if (!isAdmin || fechasTrab.length === 0) return;
        getImputacionesPorRango(selectedUser, fechasTrab[0], fechasTrab.at(-1))
            .then((arr) => {
                const map = {};
                arr.forEach((r) => {
                    map[r.taskId] = (map[r.taskId] || 0) + r.hours;
                });
                setTareasImp(
                    Object.entries(map).map(([taskId, h]) => ({
                        taskId,
                        hours: h,
                    }))
                );
            })
            .catch(console.error);
    }, [isAdmin, selectedUser, fechasTrab]);

    if (authLoading || !user) return <p>Cargando usuario…</p>;

    return (
        <div className="vista-imputacion-container">
            <h2>Panel de Imputación de Horas</h2>

            {/* — selector de periodo — */}
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

            {/* — selector de usuario (solo admin) — */}
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

            {/* — calendario — */}
            <CalendarioResumen periodo={periodo} onRangoChange={setRango} />

            {/* — resumen numérico — */}
            <div className="resumen-horas">
                <p>
                    <strong>Días trabajados:</strong> {diasTrab}
                </p>
                <p>
                    <strong>Horas totales:</strong> {horasTot.toFixed(2)}h
                </p>
                <p>
                    <strong>Horas imputadas:</strong> {horasImp.toFixed(2)}h
                </p>
                <p>
                    <strong>Horas restantes:</strong>{" "}
                    {(horasTot - horasImp).toFixed(2)}h
                </p>
            </div>

            {/* — informe de tareas imputadas (solo admin) — */}
            {isAdmin && tareasImp.length > 0 && (
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
                            {tareasImp.map(({ taskId, hours }) => (
                                <tr key={taskId}>
                                    <td>{taskId}</td>
                                    <td>{hours.toFixed(2)}h</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* — formulario de imputación — */}
            <FormularioImputacionConReparto
                resumen={{
                    userId: selectedUser,
                    diasTrabajados: diasTrab,
                    horasTotales: horasTot,
                    fechasTrabajadas: fechasTrab,
                }}
                tareas={tareas}
                onSaved={() => {
                    /* podrías forzar un recálculo */
                }}
            />
        </div>
    );
}
