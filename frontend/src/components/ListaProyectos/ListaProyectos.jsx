import { useContext, useEffect, useState } from "react";
import { ProyectoContext } from "../../context/ProyectoContext";
import { useAuth } from "../../context/AuthContext";

const ListaProyectos = () => {
    const { proyectos, setProyectos } = useContext(ProyectoContext);
    const { user, loading } = useAuth();
    const [viewLoading, setViewLoading] = useState(true);
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        const timeout = setTimeout(() => setViewLoading(false), 500);
        return () => clearTimeout(timeout);
    }, []);

    const handleAsignar = (proyectoId, tareaId) => {
        const actualizados = proyectos.map((proyecto) =>
            proyecto.id === proyectoId || proyecto._id === proyectoId
                ? {
                      ...proyecto,
                      tareas: obtenerTareas(proyecto).map((tarea) =>
                          tarea.id === tareaId
                              ? {
                                    ...tarea,
                                    asignados: tarea.asignados
                                        ? [
                                              ...new Set([
                                                  ...tarea.asignados,
                                                  user.id,
                                              ]),
                                          ]
                                        : [user.id],
                                }
                              : tarea
                      ),
                  }
                : proyecto
        );
        setProyectos(actualizados);
    };

    const toggleExpanded = (id) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const obtenerTareas = (proyecto) => {
        if (Array.isArray(proyecto.tareas)) return proyecto.tareas;
        if (typeof proyecto.subtarea === "string") {
            return proyecto.subtarea.split(",").map((t, i) => ({
                id: `${proyecto._id}-${i}`,
                nombre: t.trim(),
                asignados: [],
            }));
        }
        return [];
    };

    if (loading || viewLoading) return <p>Cargando proyectos disponibles...</p>;
    if (!user)
        return <p>No estás autenticado. Inicia sesión para continuar.</p>;

    const proyectosVisibles = proyectos.filter((p) => {
        if (p.activo !== undefined) return p.activo;
        return p.subnivel !== "Inactivo";
    });

    return (
        <div style={{ marginTop: "2rem" }}>
            <h3>Proyectos disponibles</h3>
            {proyectosVisibles.length === 0 ? (
                <p>No hay proyectos activos registrados aún.</p>
            ) : (
                proyectosVisibles.map((proyecto) => {
                    const tareas = obtenerTareas(proyecto);
                    return (
                        <div
                            key={proyecto.id || proyecto._id}
                            style={{
                                marginBottom: "1.5rem",
                                borderBottom: "1px solid #ddd",
                                paddingBottom: "1rem",
                            }}
                        >
                            <h4>{proyecto.nombre || proyecto.estructura}</h4>
                            <button
                                onClick={() =>
                                    toggleExpanded(proyecto.id || proyecto._id)
                                }
                            >
                                {expanded[proyecto.id || proyecto._id]
                                    ? "Ocultar tareas"
                                    : "Mostrar tareas"}
                            </button>
                            {expanded[proyecto.id || proyecto._id] && (
                                <ul
                                    style={{
                                        maxHeight: "200px",
                                        overflowY: "auto",
                                        marginTop: "0.5rem",
                                    }}
                                >
                                    {tareas.map((tarea) => (
                                        <li
                                            key={tarea.id}
                                            style={{ margin: "0.4rem 0" }}
                                        >
                                            {tarea.nombre} —{" "}
                                            {tarea.asignados?.includes(
                                                user.id
                                            ) ? (
                                                <strong>
                                                    Ya estás asignado
                                                </strong>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        handleAsignar(
                                                            proyecto.id ||
                                                                proyecto._id,
                                                            tarea.id
                                                        )
                                                    }
                                                >
                                                    Asignarme
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default ListaProyectos;
