// ===== Archivo: pages/Imputacion/ImputacionHoras.jsx =====

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAllTasks } from "../../services/taskService";
import { createHourRecord } from "../../services/hourService";
import { getDiasSesame } from "../../services/sesameService";
import { getRangoDelPeriodo } from "../../utils/dateUtils";
import "./ImputacionHoras.css";

function ImputacionHoras() {
    const { user } = useAuth();
    const [proyectos, setProyectos] = useState([]);
    const [registroHoras, setRegistroHoras] = useState([]);
    const [nuevoRegistro, setNuevoRegistro] = useState({
        proyecto: "",
        tarea: "",
        horas: "",
    });
    const [diasTrabajados, setDiasTrabajados] = useState(0);
    const [horasTotales, setHorasTotales] = useState(0);
    const [horasImputadas, setHorasImputadas] = useState(0);

    useEffect(() => {
        const fetchProyectosYTareas = async () => {
            const data = await getAllTasks();
            setProyectos(data);
        };
        fetchProyectosYTareas();
    }, []);

    useEffect(() => {
        const cargarHorasYFechas = async () => {
            const { from, to } = getRangoDelPeriodo("mes");

            const [diasData, horasData] = await Promise.all([
                getDiasSesame(user.sesameEmployeeId, from, to),
                fetch(
                    `/api/hours?userId=${user.id}&from=${from}&to=${to}`
                ).then((res) => res.json()),
            ]);

            const dias =
                diasData.data[0]?.days?.filter((d) => d.worked)?.length || 0;
            const horas = horasData.reduce((sum, h) => sum + h.horas, 0);

            setDiasTrabajados(dias);
            setHorasImputadas(horas);
            setHorasTotales(dias * user.dailyHours);
        };

        if (user?.id && user?.sesameEmployeeId) cargarHorasYFechas();
    }, [user]);

    const handleChange = (e) => {
        setNuevoRegistro({
            ...nuevoRegistro,
            [e.target.name]: e.target.value,
        });
    };

    const parseHoras = (input) => {
        if (input.includes("%")) {
            const porcentaje = parseFloat(input.replace("%", ""));
            return ((horasTotales * porcentaje) / 100 / diasTrabajados).toFixed(
                2
            );
        }
        return (parseFloat(input) / diasTrabajados).toFixed(2);
    };

    const agregarRegistro = async () => {
        const horasPorDia = parseHoras(nuevoRegistro.horas);

        for (let i = 0; i < diasTrabajados; i++) {
            const nuevo = {
                userId: user.id,
                proyectoId: nuevoRegistro.proyecto,
                tareaId: nuevoRegistro.tarea,
                fecha: new Date().toISOString().split("T")[0], // mejorable con un calendario real
                horas: horasPorDia,
            };
            await createHourRecord(nuevo);
        }

        setRegistroHoras([...registroHoras, nuevoRegistro]);
        setNuevoRegistro({ proyecto: "", tarea: "", horas: "" });
    };

    return (
        <div>
            <h2>Imputación de Horas</h2>

            <div>
                <h3>Registrar horas</h3>
                <select
                    name="proyecto"
                    value={nuevoRegistro.proyecto}
                    onChange={handleChange}
                >
                    <option value="">Selecciona proyecto</option>
                    {proyectos.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.nombre}
                        </option>
                    ))}
                </select>

                <select
                    name="tarea"
                    value={nuevoRegistro.tarea}
                    onChange={handleChange}
                    disabled={!nuevoRegistro.proyecto}
                >
                    <option value="">Selecciona tarea</option>
                    {nuevoRegistro.proyecto &&
                        proyectos
                            .find((p) => p.id === nuevoRegistro.proyecto)
                            ?.tareas.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.nombre}
                                </option>
                            ))}
                </select>

                <input
                    type="text"
                    name="horas"
                    value={nuevoRegistro.horas}
                    onChange={handleChange}
                    placeholder="Ej: 12 o 50%"
                />

                <button
                    onClick={agregarRegistro}
                    disabled={horasTotales - horasImputadas <= 0}
                >
                    Imputar
                </button>

                <p>
                    Total a imputar: {horasTotales}h / Imputadas:{" "}
                    {horasImputadas}h / Restantes:{" "}
                    {horasTotales - horasImputadas}h
                </p>
            </div>
        </div>
    );
}

export default ImputacionHoras;
