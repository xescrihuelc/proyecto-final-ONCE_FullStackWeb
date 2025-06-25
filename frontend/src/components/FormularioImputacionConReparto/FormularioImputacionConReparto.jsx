// src/components/FormularioImputacionConReparto/FormularioImputacionConReparto.jsx

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../../context/AuthContext";
import SignaturePad from "../SignaturePad/SignaturePad";
import { postImputacionesDistribuidas } from "../../services/imputacionService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import "./FormularioImputacionConReparto.css";

function roundToNearest15(hours) {
    const interval = 0.25;
    return Math.round(hours / interval) * interval;
}

export default function FormularioImputacionConReparto({ resumen, tareas }) {
    const { user } = useAuth();
    const [items, setItems] = useState([]); // Lista de subtareas a imputar
    const [inputs, setInputs] = useState([]); // Horas o % por subtarea
    const [loading, setLoading] = useState(false);
    const [firmaImg, setFirmaImg] = useState(null);

    // Aplanamos proyectos y sus subtareas tal como viene desde parseTasksFromBackend
    useEffect(() => {
        if (!Array.isArray(tareas)) {
            setItems([]);
            setInputs([]);
            return;
        }
        const flat = tareas.flatMap((project) =>
            Array.isArray(project.tareas)
                ? project.tareas.map((sub) => ({
                      tareaId: sub.id,
                      nombre: `${project.nombre} / ${sub.nombre}`,
                  }))
                : []
        );
        setItems(flat);
        setInputs(flat.map(() => ""));
    }, [tareas]);

    const handleChange = (index, value) => {
        const arr = [...inputs];
        arr[index] = value;
        setInputs(arr);
    };

    const calcularDistribucion = () => {
        const diasCount = resumen.diasTrabajados;
        const totales = resumen.horasTotales;
        const asigns = [];

        items.forEach((item, i) => {
            const val = inputs[i]?.trim();
            if (!val) return;
            const isPct = val.endsWith("%");
            const num = parseFloat(val.replace("%", ""));
            if (isNaN(num) || num < 0) return;
            const totalHoras = isPct ? (num / 100) * totales : num;

            const porDia = totalHoras / diasCount;
            const redondeado = roundToNearest15(porDia);
            if (Math.abs(porDia - redondeado) > 1e-3) {
                alert(
                    `Valor por día (${porDia.toFixed(
                        4
                    )}) redondeado a ${redondeado}h`
                );
            }

            for (let d = 0; d < diasCount; d++) {
                const date = new Date();
                date.setDate(date.getDate() - (diasCount - 1 - d));
                const iso = date.toISOString().split("T")[0];
                asigns.push({
                    userId: user.id,
                    taskId: item.tareaId,
                    hours: redondeado,
                    date: iso,
                });
            }
        });

        return asigns;
    };

    const handleGuardar = async () => {
        setLoading(true);
        const distrib = calcularDistribucion();
        if (distrib.length === 0) {
            alert("No hay imputaciones válidas.");
            setLoading(false);
            return;
        }
        try {
            await postImputacionesDistribuidas(distrib);
            alert("Imputaciones guardadas ✅");
            setInputs(items.map(() => ""));
        } catch (err) {
            console.error("Error al guardar imputaciones:", err);
            alert("Error al guardar imputaciones.");
        } finally {
            setLoading(false);
        }
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("Imputación de Horas", 20, 20);
        const head = [["Tarea", "Valor"]];
        const body = items.map((it, i) => [it.nombre, inputs[i] || ""]);
        autoTable(doc, { head, body, startY: 30 });
        if (firmaImg) {
            doc.addImage(
                firmaImg,
                "PNG",
                20,
                (doc.lastAutoTable?.finalY || 30) + 10,
                200,
                100
            );
        }
        doc.save("imputacion.pdf");
    };

    const exportCSV = () => {
        const data = items.map((it, i) => ({
            tarea: it.nombre,
            valor: inputs[i] || "",
        }));
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "imputacion.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (!resumen || items.length === 0) {
        return <p>Cargando formulario…</p>;
    }

    return (
        <div className="formulario-imputacion-reparto">
            <h3>
                Asignar horas a tareas ({resumen.diasTrabajados} días
                trabajados)
            </h3>
            <table>
                <thead>
                    <tr>
                        <th>Tarea</th>
                        <th>Horas / %</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((it, i) => (
                        <tr key={`${it.tareaId}-${i}`}>
                            <td>{it.nombre}</td>
                            <td>
                                <input
                                    type="text"
                                    value={inputs[i]}
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
            <div className="botones-imputacion">
                <button onClick={handleGuardar} disabled={loading}>
                    {loading ? "Guardando…" : "Guardar imputación"}
                </button>
                <button onClick={exportPDF}>Descargar PDF</button>
                <button onClick={exportCSV}>Descargar CSV</button>
            </div>

            <h4>Firma electrónica</h4>
            <SignaturePad
                options={{ canvasProps: { touchAction: "none" } }}
                onEnd={setFirmaImg}
            />
            {firmaImg && (
                <img
                    src={firmaImg}
                    alt="Firma"
                    style={{ marginTop: 10, border: "1px solid #000" }}
                />
            )}
        </div>
    );
}

FormularioImputacionConReparto.propTypes = {
    resumen: PropTypes.shape({
        diasTrabajados: PropTypes.number,
        horasTotales: PropTypes.number,
        horasImputadas: PropTypes.number,
        horasRestantes: PropTypes.number,
    }).isRequired,
    tareas: PropTypes.array.isRequired,
};
