import { useState } from "react";

// Estos datos deberían venir del backend, aquí mock para ejemplo
const proyectosMock = [
  {
    id: 1,
    nombre: "Proyecto A",
    tareas: [
      { id: 1, nombre: "Diseño", maxHoras: 7.5 },
      { id: 2, nombre: "Desarrollo", maxHoras: 7.5 },
    ],
  },
  {
    id: 2,
    nombre: "Proyecto B",
    tareas: [
      { id: 3, nombre: "Testing", maxHoras: 7.5 },
      { id: 4, nombre: "Gestión", maxHoras: 7.5 },
    ],
  },
];

function ImputacionHoras() {
  const [registroHoras, setRegistroHoras] = useState([]);
  const [nuevoRegistro, setNuevoRegistro] = useState({
    proyecto: "",
    tarea: "",
    fecha: "",
    horas: 0,
  });

  const agregarRegistro = () => {
    const proyectoSeleccionado = proyectosMock.find(
      (p) => p.id === Number(nuevoRegistro.proyecto)
    );
    if (!proyectoSeleccionado) {
      alert("Selecciona un proyecto válido");
      return;
    }

    const tareaSeleccionada = proyectoSeleccionado.tareas.find(
      (t) => t.id === Number(nuevoRegistro.tarea)
    );
    if (!tareaSeleccionada) {
      alert("Selecciona una tarea válida");
      return;
    }

    if (
      !nuevoRegistro.fecha ||
      nuevoRegistro.horas <= 0
    ) {
      alert("Completa todos los campos correctamente.");
      return;
    }

    // Sumar horas ya imputadas para esta tarea
    const horasActuales = registroHoras
      .filter((r) => r.tarea === nuevoRegistro.tarea)
      .reduce((acc, r) => acc + r.horas, 0);

    if (horasActuales + nuevoRegistro.horas > tareaSeleccionada.maxHoras) {
      alert(
        `Excede el máximo de horas para esta tarea (${tareaSeleccionada.maxHoras}h). ` +
        `Horas ya registradas: ${horasActuales}h`
      );
      return;
    }

    setRegistroHoras([...registroHoras, nuevoRegistro]);
    setNuevoRegistro({ proyecto: "", tarea: "", fecha: "", horas: 0 });
  };

  return (
    <div>
      <h2>Imputación de Horas</h2>

      <div>
        <h3>Registrar horas</h3>
        <select
          value={nuevoRegistro.proyecto}
          onChange={(e) =>
            setNuevoRegistro({ ...nuevoRegistro, proyecto: e.target.value, tarea: "" })
          }
        >
          <option value="">Selecciona proyecto</option>
          {proyectosMock.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>

        <select
          value={nuevoRegistro.tarea}
          onChange={(e) =>
            setNuevoRegistro({ ...nuevoRegistro, tarea: e.target.value })
          }
          disabled={!nuevoRegistro.proyecto}
        >
          <option value="">Selecciona tarea</option>
          {nuevoRegistro.proyecto &&
            proyectosMock
              .find((p) => p.id === Number(nuevoRegistro.proyecto))
              .tareas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} (máx {t.maxHoras} h)
                </option>
              ))}
        </select>

        <input
          type="date"
          value={nuevoRegistro.fecha}
          onChange={(e) =>
            setNuevoRegistro({ ...nuevoRegistro, fecha: e.target.value })
          }
        />

        <input
          type="number"
          min="0"
          step="0.1"
          value={nuevoRegistro.horas}
          onChange={(e) =>
            setNuevoRegistro({ ...nuevoRegistro, horas: Number(e.target.value) })
          }
          placeholder="Horas"
        />

        <button onClick={agregarRegistro}>Agregar</button>
      </div>

      <div>
        <h3>Horas registradas</h3>
        <table>
          <thead>
            <tr>
              <th>Proyecto</th>
              <th>Tarea</th>
              <th>Fecha</th>
              <th>Horas</th>
              <th>Horas Máx</th>
              <th>Horas Registradas</th>
            </tr>
          </thead>
          <tbody>
            {registroHoras.map((r, idx) => {
              const proyecto = proyectosMock.find((p) => p.id === Number(r.proyecto));
              const tarea = proyecto?.tareas.find((t) => t.id === Number(r.tarea));
              // Horas ya imputadas para esa tarea
              const horasParaTarea = registroHoras
                .filter((x) => x.tarea === r.tarea)
                .reduce((acc, x) => acc + x.horas, 0);

              return (
                <tr key={idx}>
                  <td>{proyecto?.nombre}</td>
                  <td>{tarea?.nombre}</td>
                  <td>{r.fecha}</td>
                  <td>{r.horas}</td>
                  <td>{tarea?.maxHoras}</td>
                  <td>{horasParaTarea}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ImputacionHoras;
