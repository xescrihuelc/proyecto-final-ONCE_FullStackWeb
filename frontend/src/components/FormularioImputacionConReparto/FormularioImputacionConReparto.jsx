// src/components/FormularioImputacionConReparto/FormularioImputacionConReparto.jsx

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
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

  const prepararPayloads = () =>
    fechasTrabajadas.map((date) => {
      const tasks = items
        .map((it, i) => {
          const raw = inputs[i]?.trim();
          if (!raw) return null;

          const isPct = raw.endsWith("%");
          const num = parseFloat(raw.replace("%", ""));
          if (isNaN(num) || num < 0) return null;

          const totalH = isPct ? (num / 100) * horasTotales : num;
          const perDay = totalH / diasTrabajados;

          const pureId =
            it.tareaId.length > 24 ? it.tareaId.slice(0, 24) : it.tareaId;
          return {
            taskId: pureId,
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
        ⚠️ Por favor selecciona un usuario arriba para cargar el formulario.
      </p>
    );
  }
  if (!fechasTrabajadas.length) {
    return <p className="aviso">Cargando fechas de imputación…</p>;
  }

  const handleGuardar = async () => {
    setLoading(true);
    try {
      const payloads = prepararPayloads().filter((p) => p.tasks.length > 0);

      if (!payloads.length) {
        alert("No hay nada que guardar.");
        setLoading(false);
        return;
      }

      for (const pl of payloads) {
        console.log("✏️ [Form] Enviando PATCH", pl);
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

  return (
    <div className="formulario-imputacion-reparto">
      <h3>Asignar horas a tareas ({diasTrabajados} días trabajados)</h3>

      <table>
        <thead>
          <tr>
            <th>Tarea</th>
            <th>Horas</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={`${it.tareaId}-${i}`}>
              <td>{it.nombre}</td>
              <td>
                <input
                  type="text"
                  placeholder=""
                  value={inputs[i]}
                  onChange={(e) => {
                    const copy = [...inputs];
                    copy[i] = e.target.value;
                    setInputs(copy);
                  }}
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
    userId: PropTypes.string,
    diasTrabajados: PropTypes.number,
    horasTotales: PropTypes.number,
    fechasTrabajadas: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  tareas: PropTypes.array.isRequired,
  onSaved: PropTypes.func,
};
