import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { postImputacionesDistribuidas } from "../../services/imputacionService";
import "./FormularioImputacionConReparto.css";

function roundToNearest15Minutes(hours) {
    const interval = 0.25;
    return Math.round(hours / interval) * interval;
}

export default function FormularioImputacionConReparto({ resumen, tareas }) {
    const { user } = useAuth();
    const [inputs, setInputs] = useState([]);
    const [loading, setLoading] = useState(false);

    // 🔐 Prevención si resumen o tareas no están cargados aún
    if (!resumen || !Array.isArray(tareas)) {
        return <p>Cargando tareas y resumen de horas...</p>;
    }

    useEffect(() => {
        if (Array.isArray(tareas) && tareas.length > 0) {
            setInputs(tareas.map((t) => ({ tareaId: t.id, valor: "" })));
        }
    }, [tareas]);

    const handleChange = (index, nuevoValor) => {
        const actualizados = [...inputs];
        actualizados[index].valor = nuevoValor;
        setInputs(actualizados);
    };

    const calcularDistribucion = () => {
        const horasTotales = resumen.horasTotales;
        const dias = resumen.diasTrabajados;
        const asignaciones = [];

        for (const input of inputs) {
            if (!input.valor) continue;

            const porcentaje = input.valor.trim().endsWith("%");
            let totalHoras = 0;

            if (porcentaje) {
                const num = parseFloat(input.valor.replace("%", ""));
                if (isNaN(num) || num < 0 || num > 100) continue;
                totalHoras = (num / 100) * horasTotales;
            } else {
                const num = parseFloat(input.valor);
                if (isNaN(num) || num < 0 || num > horasTotales) continue;
                totalHoras = num;
            }

            let horasPorDia = totalHoras / dias;
            const redondeado = roundToNearest15Minutes(horasPorDia);

            if (horasPorDia !== redondeado) {
                alert(
                    `El valor por día (${horasPorDia.toFixed(
                        4
                    )}) se ha redondeado a ${redondeado} (intervalos de 15 minutos).`
                );
            }

            for (let i = 0; i < dias; i++) {
                asignaciones.push({
                    userId: user.id,
                    tareaId: input.tareaId,
                    horas: redondeado,
                    fecha: generarFechaDelDia(i),
                });
            }
        }

        return asignaciones;
    };

    const generarFechaDelDia = (i) => {
        const hoy = new Date();
        const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), 1 + i);
        return fecha.toISOString().split("T")[0];
    };

    const handleGuardar = async () => {
        try {
            setLoading(true);
            const distribucion = calcularDistribucion();
            if (distribucion.length === 0) {
                alert("No hay imputaciones válidas.");
                return;
            }

            await postImputacionesDistribuidas(distribucion);
            alert("Imputaciones guardadas correctamente ✅");
            setInputs(tareas.map((t) => ({ tareaId: t.id, valor: "" })));
        } catch (err) {
            console.error("Error al guardar imputaciones:", err);
            alert("Error al guardar imputaciones.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="formulario-imputacion-reparto">
            <h3>
                Asignar horas a tareas ({resumen.diasTrabajados} días
                trabajados)
            </h3>
            <p>
                Puedes poner horas totales (ej. <code>6</code>) o porcentaje
                (ej. <code>20%</code>). Las horas se repartirán automáticamente
                entre los días trabajados.
            </p>

            {tareas.length === 0 ? (
                <p>No tienes tareas asignadas para imputar este mes.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Tarea</th>
                            <th>Horas o %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tareas.map((tarea, i) => (
                            <tr key={tarea.id}>
                                <td>{tarea.nombre}</td>
                                <td>
                                    <input
                                        type="text"
                                        value={inputs[i]?.valor || ""}
                                        onChange={(e) =>
                                            handleChange(i, e.target.value)
                                        }
                                        placeholder="Ej: 6 o 25%"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <button
                onClick={handleGuardar}
                disabled={
                    resumen.horasRestantes <= 0 ||
                    loading ||
                    tareas.length === 0
                }
                className="btn-imputar"
            >
                {loading ? "Guardando..." : "Guardar imputación"}
            </button>
        </div>
    );
}
