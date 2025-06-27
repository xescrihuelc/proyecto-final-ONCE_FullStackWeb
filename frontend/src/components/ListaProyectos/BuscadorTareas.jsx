import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { assignTaskToUser, getAllTasks } from "../../services/taskService";
import { getAllUsers } from "../../services/userService";
import "./BuscadorTareas.css";

const BuscadorTareas = () => {
  const { user } = useAuth(); // asume rol admin
  const [proyectos, setProyectos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [coincidencias, setCoincidencias] = useState([]);
  const [seleccion, setSeleccion] = useState({}); // { "taskId-subIdx": userId }

  // 1) Cargo tareas y usuarios
  const cargarDatos = async () => {
    try {
      const [tareas, users] = await Promise.all([getAllTasks(), getAllUsers()]);
      setProyectos(tareas);
      setUsuarios(users);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // 2) Armo lista plana de “entradas” y filtro
  useEffect(() => {
    const term = busqueda.trim().toLowerCase();
    if (!term) {
      setCoincidencias([]);
      return;
    }

    // aplano: cada “tarea” lleva su subnivel y proyecto
    const listado = proyectos.flatMap((proyecto) =>
      proyecto.tareas.map((t) => ({
        id: t.id,
        proyectoNombre: proyecto.estructura,
        subnivelNombre: proyecto.subnivel, // el nivel intermedio
        subtareaNombre: t.nombre, // el nivel final
        activo: proyecto.activo,
        asignados: t.asignados, // ahora podemos mostrarlos si queremos
      }))
    );
    console.log(listado);

    // filtro sobre subtarea o sobre subnivel
    const resultados = listado.filter(
      (e) =>
        e.subtareaNombre.toLowerCase().includes(term) ||
        (e.subnivelNombre && e.subnivelNombre.toLowerCase().includes(term))
    );

    setCoincidencias(resultados);
  }, [busqueda, proyectos]);

  const handleSelect = (entryId, userId) => {
    setSeleccion((prev) => ({ ...prev, [entryId]: userId }));
  };

  const handleAsignar = async (entry) => {
    const userId = seleccion[entry.id];
    if (!userId) return alert("🔸 Selecciona primero un usuario");

    try {
      // sólo necesitamos taskId y userId
      const [taskId] = entry.id.split("-");
      await assignTaskToUser({ taskId, userId });
      alert(
        `✅ “${entry.subtareaNombre}” de “${entry.proyectoNombre}” asignada a ${
          usuarios.find((u) => u._id === userId).email
        }`
      );
      // refrescamos datos para ver la actualización
      await cargarDatos();
      // limpiar selección de esa entrada
      setSeleccion((prev) => {
        const { [entry.id]: _, ...rest } = prev;
        return rest;
      });
    } catch (err) {
      console.error(err);
      alert("❌ Error al asignar la tarea");
    }
  };

  return (
    <div className="seccion buscador-tareas-container">
      <h3>Buscar Tareas</h3>
      <input
        type="text"
        placeholder="Filtra por subtarea o subnivel..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="input-group"
      />

      <ul className="lista-tareas-filtradas">
        {coincidencias.map((e) => (
          <li
            key={e.id}
            className={`tarea-item ${!e.activo ? "tarea-inactiva" : ""}`}
          >
            <div className="tarea-info">
              <strong>{e.proyectoNombre}</strong> / <em>{e.subnivelNombre}</em>{" "}
              / {e.subtareaNombre}
              {!e.activo && (
                <span className="estado-inactivo"> (Inactiva)</span>
              )}
              {e.asignados.length > 0 && (
                <div className="asignados">
                  Asignado a:{" "}
                  {e.asignados
                    .map(
                      (uid) => usuarios.find((u) => u._id === uid)?.email || uid
                    )
                    .join(", ")}
                </div>
              )}
            </div>

            <div className="tarea-acciones">
              <select
                value={seleccion[e.id] || ""}
                onChange={(ev) => handleSelect(e.id, ev.target.value)}
              >
                <option value="">— usuario —</option>
                {usuarios.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.nombre || u.email}
                  </option>
                ))}
              </select>
              <button onClick={() => handleAsignar(e)}>Asignar</button>
            </div>
          </li>
        ))}

        {coincidencias.length === 0 && busqueda && (
          <li className="no-result">No se encontró ninguna tarea</li>
        )}
      </ul>
    </div>
  );
};

export default BuscadorTareas;
