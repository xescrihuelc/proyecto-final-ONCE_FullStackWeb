// src/components/FormularioImputacionConReparto/FormularioImputacionConReparto.jsx
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../../context/AuthContext";
import SignaturePad from "../SignaturePad/SignaturePad";
import { patchImputeHours } from "../../services/hourService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import "./FormularioImputacionConReparto.css";

function roundToNearest15(hours) {
    const interval = 0.25;
    return Math.round(hours / interval) * interval;
}

export default function FormularioImputacionConReparto({
    resumen,
    tareas,
    onSaved,
}) {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [inputs, setInputs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [firmaImg, setFirmaImg] = useState(null);

    useEffect(() => {
        if (!Array.isArray(tareas)) {
            setItems([]);
            setInputs([]);
            return;
        }
        const flat = tareas.flatMap((p) => {
            const subs = p.tareas?.length
                ? p.tareas
                : [{ id: p.id, nombre: "(Sin subtarea)" }];
            return subs.map((sub) => ({
                tareaId: sub.id,
                nombre: `${p.estructura} / ${p.subnivel} / ${sub.nombre}`,
            }));
        });
        setItems(flat);
        setInputs(Array(flat.length).fill(""));
    }, [tareas]);

    const handleChange = (idx, val) => {
        const copia = [...inputs];
        copia[idx] = val;
        setInputs(copia);
    };

    const prepararPayloads = () => {
        const dias = resumen.diasTrabajados;
        const tot = resumen.horasTotales;

        const fechas = Array.from({ length: dias }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (dias - 1 - i));
            return d.toISOString().slice(0, 10);
        });

        return fechas
            .map((fecha) => {
                const tasks = items
                    .map((it, i) => {
                        const v = inputs[i]?.trim();
                        if (!v) return null;
                        const isPct = v.endsWith("%");
                        const num = parseFloat(v.replace("%", ""));
                        if (isNaN(num) || num < 0) return null;
                        const totalHoras = isPct ? (num / 100) * tot : num;
                        const porDia = totalHoras / dias;
                        return {
                            taskId: it.tareaId,
                            hours: roundToNearest15(porDia),
                        };
                    })
                    .filter(Boolean);
                return { userId: user.id, date: fecha, tasks };
            })
            .filter((p) => p.tasks.length > 0);
    };

    const handleGuardar = async () => {
        setLoading(true);
        try {
            const payloads = prepararPayloads();
            if (payloads.length === 0) {
                alert("No hay nada que guardar.");
                setLoading(false);
                return;
            }

            for (const pl of payloads) {
                try {
                    // 🔍 Log de cada payload individual
                    console.log(
                        `✏️ [Form] Enviando PATCH para ${pl.date} — body:\n`,
                        JSON.stringify(pl, null, 2)
                    );
                    const resp = await patchImputeHours(pl);
                    // 🔍 Log de la respuesta JSON
                    console.log(
                        `✅ [Form] Respuesta OK para ${pl.date}:\n`,
                        JSON.stringify(resp, null, 2)
                    );
                } catch (e) {
                    console.error(
                        `❌ [Form] Error en PATCH ${pl.date}:`,
                        e.message
                    );
                    throw e;
                }
            }

            alert("Imputaciones guardadas ✅");
            setInputs(Array(items.length).fill(""));
            onSaved?.();
        } catch (err) {
            console.error(
                "❌ [Form] Error al guardar imputaciones:",
                err.message
            );
            alert("Error al guardar imputaciones: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("Imputación de Horas", 20, 20);
        autoTable(doc, {
            head: [["Tarea", "Valor"]],
            body: items.map((it, i) => [it.nombre, inputs[i] || ""]),
            startY: 30,
        });
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

    if (!resumen || items.length === 0) return <p>Cargando formulario…</p>;

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
                                    placeholder="Ej: 6 o 25%"
                                    value={inputs[i]}
                                    onChange={(e) =>
                                        handleChange(i, e.target.value)
                                    }
                                    disabled={loading}
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
            <SignaturePad onEnd={setFirmaImg} />
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
        diasTrabajados: PropTypes.number.isRequired,
        horasTotales: PropTypes.number.isRequired,
    }).isRequired,
    tareas: PropTypes.array.isRequired,
    onSaved: PropTypes.func,
};
