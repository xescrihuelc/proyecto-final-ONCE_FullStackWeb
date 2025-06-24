import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAllTasks } from "../../services/taskService";
import { createHourRecord } from "../../services/hourService";
import { getDiasSesame } from "../../services/sesameService";
import { getImputacionesPorRango } from "../../services/imputacionService";
import { getRangoDelPeriodo } from "../../utils/dateUtils";
import "./ImputacionHoras.css";

function ImputacionHoras() {
    const { user, loading: authLoading } = useAuth();

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
    const [isLoadingResumen, setIsLoadingResumen] = useState(true);

    // Obtener proyectos y tareas
    useEffect(() => {
        const fetchProyectosYTareas = async () => {
            try {
                const data = await getAllTasks();
                setProyectos(data);
            } catch (error) {
                console.error("Error al cargar tareas:", error);
            }
        };
        fetchProyectosYTareas();
    }, []);

    // Cargar resumen de horas y días trabajados
    useEffect(() => {
        const cargarHorasYFechas = async () => {
            const { from, to } = getRangoDelPeriodo("mes");

            const [diasData, horasData] = await Promise.all([
                getDiasSesame(user.sesameEmployeeId, from, to),
                getImputacionesPorRango(user.id, from, to),
            ]);

            const dias = diasData.filter((d) => d.secondsWorked > 0).length;
            const totalImputadas = horasData.reduce(
                (sum, registro) => sum + registro.hours,
                0
            );

            setDiasTrabajados(dias);
            setHorasImputadas(totalImputadas);
            setHorasTotales(dias * (user.dailyHours ?? 7.5));
            setIsLoadingResumen(false);
        };

        if (!authLoading && user?.id && user?.sesameEmployeeId) {
            cargarHorasYFechas();
        }
    }, [user, authLoading]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNuevoRegistro((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const parseHoras = (input) => {
        if (input.includes("%")) {
            const porcentaje = parseFloat(input.replace("%", ""));
            return (
                ((horasTotales * porcentaje) / 100 / diasTrabajados).toFixed(
                    2
                ) || "0.00"
            );
        }
        return (parseFloat(input) / diasTrabajados || 0).toFixed(2);
    };

    const agregarRegistro = async () => {
        const horasPorDia = parseHoras(nuevoRegistro.horas);

        for (let i = 0; i < diasTrabajados; i++) {
            const nuevo = {
                userId: user.id,
                proyectoId: nuevoRegistro.proyecto,
                tareaId: nuevoRegistro.tarea,
                date: new Date().toISOString(), // coincide con tu campo `date` en el modelo
                hours: parseFloat(horasPorDia),
            };
            await createHourRecord(nuevo);
        }

        setRegistroHoras((prev) => [...prev, nuevoRegistro]);
        setNuevoRegistro({ proyecto: "", tarea: "", horas: "" });
    };

    if (isLoadingResumen || authLoading) {
        return <p>Cargando resumen...</p>;
    }

    return (
        <div className="imputacion-container">
            <h2>Imputación de Horas</h2>

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
        </div>
    );
}

export default ImputacionHoras;
