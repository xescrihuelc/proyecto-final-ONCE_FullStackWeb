import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import PropTypes from "prop-types";
import React, { useEffect, useState, useMemo } from "react";
import { patchHourRecord } from "../../services/hourService";
import SignaturePad from "../SignaturePad/SignaturePad";
import "./FormularioImputacionConReparto.css";

function roundToNearest15(hours) {
    return Math.round(hours / 0.25) * 0.25;
}

export default function FormularioImputacionConReparto({
    resumen = {},
    tareas = [],
    onSaved,
    isAdmin = false,
    imputacionesAdmin = [],
}) {
    const {
        userId,
        diasTrabajados = 0,
        horasTotales = 0,
        fechasTrabajadas = [],
    } = resumen;

    const [items, setItems] = useState([]);
    const [inputs, setInputs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [firmaImg, setFirmaImg] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (!Array.isArray(tareas)) return;

        const flat = tareas.flatMap((proyecto) => {
            const subs =
                Array.isArray(proyecto.tareas) && proyecto.tareas.length
                    ? proyecto.tareas
                    : [{ id: proyecto.id, nombre: "" }];

            return subs.map((sub) => ({
                tareaId: sub._id ?? sub.id,
                nombre: `${proyecto.estructura} / ${proyecto.subnivel} / ${sub.nombre}`,
            }));
        });

        setItems(flat);
        setInputs(Array(flat.length).fill(""));
    }, [tareas]);

    // Filtro dinámico de tareas
    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) return items;
        return items.filter((item) =>
            item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, items]);

    // Suma de horas imputadas en los inputs actuales
    const horasImputadas = useMemo(() => {
        return inputs.reduce((sum, val) => {
            const cleanVal = val.trim();
            if (!cleanVal) return sum;

            const isPct = cleanVal.endsWith("%");
            const num = parseFloat(cleanVal.replace("%", ""));
            if (isNaN(num) || num < 0) return sum;

            const totalH = isPct ? (num / 100) * horasTotales : num;
            return sum + totalH;
        }, 0);
    }, [inputs, horasTotales]);

    // Horas restantes para imputar (no puede bajar de 0)
    const horasRestantes = Math.max(0, horasTotales - horasImputadas);

    const prepararPayloads = () =>
        fechasTrabajadas.map((date) => {
            const tasks = filteredItems
                .map((it) => {
                    const idx = items.findIndex(
                        (item) => item.tareaId === it.tareaId
                    );
                    if (idx === -1) return null;

                    const raw = inputs[idx]?.trim();
                    if (!raw) return null;

                    const isPct = raw.endsWith("%");
                    const num = parseFloat(raw.replace("%", ""));
                    if (isNaN(num) || num < 0) return null;

                    const totalH = isPct ? (num / 100) * horasTotales : num;
                    const perDay = totalH / diasTrabajados;

                    return {
                        taskId: it.tareaId,
                        hours: roundToNearest15(perDay),
                    };
                })
                .filter(Boolean);

            return {
                userId,
                date,
                tasks,
            };
        });

    if (!userId) {
        return (
            <p className="aviso">
                ⚠️ Por favor selecciona un usuario arriba para cargar el
                formulario.
            </p>
        );
    }
    if (!fechasTrabajadas.length) {
        return <p className="aviso">Cargando fechas de imputación…</p>;
    }

    const handleInputChange = (index, value) => {
        const cleanVal = value.trim();
        if (cleanVal) {
            const isPct = cleanVal.endsWith("%");
            const num = parseFloat(cleanVal.replace("%", ""));
            if (!isNaN(num) && num >= 0) {
                let totalHoras = isPct ? (num / 100) * horasTotales : num;
                if (totalHoras > horasRestantes) {
                    alert(
                        `No puedes imputar más de ${horasRestantes.toFixed(
                            2
                        )} horas restantes.`
                    );
                    return; // No actualizamos input si excede
                }
            }
        }
        const newInputs = [...inputs];
        newInputs[index] = value;
        setInputs(newInputs);
    };

    const handleGuardar = async () => {
        setLoading(true);
        try {
            const payloads = prepararPayloads().filter(
                (p) => p.tasks.length > 0
            );

            if (!payloads.length) {
                alert("No hay nada que guardar.");
                setLoading(false);
                return;
            }

            for (const pl of payloads) {
                await patchHourRecord(pl);
            }

            alert("✅ Imputaciones guardadas");
            setInputs(Array(items.length).fill(""));
            onSaved?.();
        } catch (err) {
            console.error("❌ Error al guardar imputaciones:", err);
            alert("Error al guardar imputaciones: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Export PDF
    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("Imputación de Horas", 20, 20);
        autoTable(doc, {
            head: [["Tarea", "Valor"]],
            body: filteredItems.map((it) => {
                const idx = items.findIndex(
                    (item) => item.tareaId === it.tareaId
                );
                return [it.nombre, inputs[idx] || ""];
            }),
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

    // Export CSV
    const exportCSV = () => {
        const data = filteredItems.map((it) => {
            const idx = items.findIndex((item) => item.tareaId === it.tareaId);
            return {
                tarea: it.nombre,
                valor: inputs[idx] || "",
            };
        });
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

    // Vista admin para control de imputaciones
    if (isAdmin) {
        return (
            <div className="formulario-imputacion-reparto admin-view">
                <h3>Panel de control de imputaciones</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Proyecto / Tarea</th>
                            <th>Fecha</th>
                            <th>Horas imputadas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {imputacionesAdmin.length === 0 && (
                            <tr>
                                <td colSpan="4">No hay datos para mostrar</td>
                            </tr>
                        )}
                        {imputacionesAdmin.map((imp, i) => (
                            <tr key={i}>
                                <td>{imp.userName || imp.userId}</td>
                                <td>{imp.projectName || imp.taskName}</td>
                                <td>{imp.date}</td>
                                <td>{imp.hours}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="formulario-imputacion-reparto">
            <h3>Asignar horas a tareas ({diasTrabajados} días trabajados)</h3>

            <input
                type="search"
                placeholder="Buscar tarea..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-busqueda"
            />

            <table>
                <thead>
                    <tr>
                        <th>Tarea</th>
                        <th>Horas</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredItems.map((it) => {
                        const idx = items.findIndex(
                            (item) => item.tareaId === it.tareaId
                        );
                        return (
                            <tr key={it.tareaId}>
                                <td>{it.nombre}</td>
                                <td>
                                    <input
                                        type="text"
                                        placeholder=""
                                        value={inputs[idx]}
                                        onChange={(e) =>
                                            handleInputChange(
                                                idx,
                                                e.target.value
                                            )
                                        }
                                        disabled={loading}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="info-horas">
                <p>
                    Horas totales mes: <b>{horasTotales.toFixed(2)}</b> | Horas
                    imputadas: <b>{horasImputadas.toFixed(2)}</b> | Horas
                    restantes: <b>{horasRestantes.toFixed(2)}</b>
                </p>
            </div>

            <div className="botones-imputacion">
                <button
                    onClick={handleGuardar}
                    disabled={loading || horasRestantes === 0}
                >
                    {loading ? "Guardando…" : "Guardar imputación"}
                </button>
                <button onClick={exportPDF} disabled={loading}>
                    Descargar PDF
                </button>
                <button onClick={exportCSV} disabled={loading}>
                    Descargar CSV
                </button>
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
        userId: PropTypes.string,
        diasTrabajados: PropTypes.number,
        horasTotales: PropTypes.number,
        fechasTrabajadas: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    tareas: PropTypes.array.isRequired,
    onSaved: PropTypes.func,
    isAdmin: PropTypes.bool,
    imputacionesAdmin: PropTypes.array,
};
