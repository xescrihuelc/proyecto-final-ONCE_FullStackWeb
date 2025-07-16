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
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [tareasAsignadas, setTareasAsignadas] = useState(new Set()); // ids de tareas asignadas al usuario seleccionado

    // 1) Cargo tareas y usuarios
    const cargarDatos = async () => {
        try {
            const [tareas, users] = await Promise.all([
                getAllTasks(),
                getAllUsers(),
            ]);
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

        const listado = proyectos.flatMap((proyecto) =>
            proyecto.tareas.map((t) => ({
                id: t.id,
                proyectoNombre: proyecto.lineaTrabajo,
                subnivelNombre: proyecto.subnivel,
                subtareaNombre: t.nombre,
                activo: proyecto.activo,
                asignados: t.asignados || [],
            }))
        );

        const resultados = listado.filter(
            (e) =>
                e.proyectoNombre.toLowerCase().includes(term) ||
                e.subnivelNombre.toLowerCase().includes(term) ||
                (e.subtareaNombre &&
                    e.subtareaNombre.toLowerCase().includes(term))
        );

        setCoincidencias(resultados);
    }, [busqueda, proyectos]);

    // Cada vez que cambie usuario seleccionado o proyectos, actualizo tareasAsignadas
    useEffect(() => {
        if (!usuarioSeleccionado) {
            setTareasAsignadas(new Set());
            return;
        }

        // busco las tareas asignadas a ese usuario
        const assigned = new Set();
        proyectos.forEach((proyecto) => {
            proyecto.tareas.forEach((tarea) => {
                if (tarea.asignados?.includes(usuarioSeleccionado._id)) {
                    assigned.add(tarea.id);
                }
            });
        });
        setTareasAsignadas(assigned);
    }, [usuarioSeleccionado, proyectos]);

    const toggleAsignacion = async (tareaId) => {
        if (!usuarioSeleccionado)
            return alert("Selecciona un usuario primero.");

        const asignada = tareasAsignadas.has(tareaId);

        try {
            // Si está asignada, la desasignamos; si no, la asignamos
            // Aquí asumo que assignTaskToUser solo asigna, para desasignar puedes llamar a otro endpoint o modificar backend
            if (!asignada) {
                await assignTaskToUser({
                    taskId: tareaId,
                    userId: usuarioSeleccionado._id,
                });
            } else {
                // TODO: Llamar a endpoint para desasignar tarea, si existe.
                // Por ahora alertamos que no está implementado
                alert(
                    "Desasignar tarea no implementado. Implementa un endpoint PATCH /tasks/:id/unassign o similar."
                );
                return;
            }

            // Refrescar datos
            await cargarDatos();
        } catch (err) {
            console.error(err);
            alert("Error al actualizar asignación");
        }
    };

    return (
        <div className="seccion buscador-tareas-container">
            <h3>Buscar Tareas</h3>

            <div style={{ marginBottom: "1rem" }}>
                <label
                    htmlFor="usuario-global"
                    style={{ marginRight: "0.5rem" }}
                >
                    Usuario asignar:
                </label>
                <select
                    id="usuario-global"
                    value={usuarioSeleccionado?._id || ""}
                    onChange={(e) => {
                        const u = usuarios.find(
                            (user) => user._id === e.target.value
                        );
                        setUsuarioSeleccionado(u || null);
                    }}
                    style={{ padding: "0.3rem", minWidth: "250px" }}
                >
                    <option value="" disabled>
                        -- Seleccione usuario --
                    </option>
                    {usuarios.map((u) => (
                        <option key={u._id} value={u._id}>
                            {u.name} {u.surnames}
                        </option>
                    ))}
                </select>
            </div>

            <input
                type="text"
                placeholder="Buscar tareas por proyecto, subnivel o subtarea..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input-group"
            />

            <ul className="lista-tareas-filtradas">
                {coincidencias.map((e) => (
                    <li
                        key={e.id}
                        className={`tarea-item ${
                            !e.activo ? "tarea-inactiva" : ""
                        }`}
                    >
                        <div className="tarea-info">
                            <strong>{e.proyectoNombre}</strong> /{" "}
                            <em>{e.subnivelNombre}</em> / {e.subtareaNombre}
                            {!e.activo && (
                                <span className="estado-inactivo">
                                    {" "}
                                    (Inactiva)
                                </span>
                            )}
                            {e.asignados.length > 0 && (
                                <div className="asignados">
                                    Asignado a:{" "}
                                    {e.asignados
                                        .map((uid) => {
                                            const user = usuarios.find(
                                                (u) => u._id === uid
                                            );
                                            return user
                                                ? `${user.name} ${user.surnames}`
                                                : uid;
                                        })
                                        .join(", ")}
                                </div>
                            )}
                        </div>

                        <div className="tarea-acciones">
                            <input
                                type="checkbox"
                                checked={tareasAsignadas.has(e.id)}
                                onChange={() => toggleAsignacion(e.id)}
                                disabled={!usuarioSeleccionado}
                            />
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
