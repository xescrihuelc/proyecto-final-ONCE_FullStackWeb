import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import SignaturePad from "../SignaturePad/SignaturePad";
import { postImputacionesDistribuidas } from "../../services/imputacionService";

// IMPORTS PDF/CSV
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

import "./FormularioImputacionConReparto.css";

function roundToNearest15Minutes(hours) {
    const interval = 0.25;
    return Math.round(hours / interval) * interval;
}

export default function FormularioImputacionConReparto({ resumen, tareas }) {
    const { user } = useAuth();
    const [inputs, setInputs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [firmaImg, setFirmaImg] = useState(null);

    useEffect(() => {
        if (Array.isArray(tareas)) {
            setInputs(tareas.map((t) => ({ tareaId: t.id, valor: "" })));
        }
    }, [tareas]);

    const handleChange = (index, nuevoValor) => {
        const actualizados = [...inputs];
        actualizados[index].valor = nuevoValor;
        setInputs(actualizados);
    };

    const generarFechaDelDia = (i) => {
        const hoy = new Date();
        const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), 1 + i);
        return fecha.toISOString().split("T")[0];
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

            const horasPorDia = totalHoras / dias;
            const redondeado = roundToNearest15Minutes(horasPorDia);

            if (horasPorDia !== redondeado) {
                alert(
                    `El valor por día (${horasPorDia.toFixed(
                        4
                    )}) se ha redondeado a ${redondeado}h.`
                );
            }

            for (let i = 0; i < dias; i++) {
                asignaciones.push({
                    userId: user.id,
                    tareaId: input.tareaId,
                    hours: redondeado,
                    date: generarFechaDelDia(i),
                });
            }
        }

        return asignaciones;
    };

    const handleGuardar = async () => {
        try {
            setLoading(true);
            const distribucion = calcularDistribucion();
            if (distribucion.length === 0) {
                alert("No hay imputaciones válidas.");
                setLoading(false);
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

    const exportPDF = () => {
        const doc = new jsPDF({ unit: "pt", format: "letter" });
        doc.text("Imputación de Horas", 40, 40);
        const head = [["Tarea", "Horas/%"]];
        const body = tareas.map((t, i) => [t.nombre, inputs[i]?.valor || ""]);
        autoTable(doc, { head, body, startY: 60 });
        if (firmaImg) {
            const y = (doc.lastAutoTable?.finalY || 60) + 20;
            doc.addImage(firmaImg, "PNG", 40, y, 200, 100);
        }
        doc.save("imputacion.pdf");
    };

    const exportCSV = () => {
        const data = tareas.map((t, i) => ({
            tarea: t.nombre,
            valor: inputs[i]?.valor || "",
        }));
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "imputacion.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!resumen || !Array.isArray(tareas)) {
        return <p>Cargando tareas y resumen de horas...</p>;
    }

    return (
        <>
            {/* Sección superior */}
            <section id="start">
                <div className="formulario-imputacion-reparto">
                    <h3>
                        Asignar horas a tareas ({resumen.diasTrabajados} días
                        trabajados)
                    </h3>
                    <p>
                        Puedes poner horas totales (<code>6</code>) o porcentaje
                        (<code>20%</code>). Las horas se repartirán
                        automáticamente.
                    </p>

                    {tareas.length === 0 ? (
                        <p>No tienes tareas asignadas este mes.</p>
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
                                                    handleChange(
                                                        i,
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Ej: 6 o 25%"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    <div className="botones-imputacion">
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
                        <button onClick={exportPDF} className="btn-export">
                            Descargar PDF
                        </button>
                        <button onClick={exportCSV} className="btn-export">
                            Descargar CSV
                        </button>
                    </div>

                    <h4>Firma electrónica</h4>
                    <SignaturePad
                        options={{ canvasProps: { touchAction: "none" } }}
                        onEnd={setFirmaImg}
                    />
                    {firmaImg && (
                        <img
                            src={firmaImg}
                            alt="Firma capturada"
                            style={{
                                border: "1px solid #000",
                                marginTop: "10px",
                            }}
                        />
                    )}
                </div>
            </section>

            {/* Sección inferior */}
            <section id="end" style={{ height: "1px" }} />

            {/* Botones de ancla */}
            <div className="scroll-buttons">
                <a href="#start" className="scroll-btn" title="Ir arriba">
                    ↑
                </a>
                <a href="#end" className="scroll-btn" title="Ir abajo">
                    ↓
                </a>
            </div>
        </>
    );
}
