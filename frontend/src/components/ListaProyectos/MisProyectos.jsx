import { useContext, useEffect, useState } from "react";
import { ProyectoContext } from "../../context/ProyectoContext";
import { useAuth } from "../../context/AuthContext";

const MisProyectos = () => {
    const { proyectos, setProyectos } = useContext(ProyectoContext);
    const { user, loading } = useAuth();
    const [tareasPorProyecto, setTareasPorProyecto] = useState({});
    const [expanded, setExpanded] = useState({});
    const [viewLoading, setViewLoading] = useState(true);

    useEffect(() => {
        if (user && proyectos.length > 0) {
            const agrupadas = {};

            proyectos.forEach((proyecto) => {
                const tareas =
                    proyecto.tareas ||
                    proyecto.subtarea?.split(",").map((t, i) => ({
                        id: `${proyecto._id}-${i}`,
                        nombre: t.trim(),
                        asignados: [],
                    })) ||
                    [];

                const asignadas = tareas.filter((t) =>
                    t.asignados?.includes(user.id)
                );

                if (asignadas.length > 0) {
                    const key = proyecto.id || proyecto._id;
                    agrupadas[key] = {
                        nombre: proyecto.nombre || proyecto.estructura,
                        tareas: asignadas.map((t) => ({
                            ...t,
                            proyectoId: key,
                        })),
                    };
                }
            });

            setTareasPorProyecto(agrupadas);
        }

        const timeout = setTimeout(() => setViewLoading(false), 500);
        return () => clearTimeout(timeout);
    }, [user, proyectos]);

    const cancelarAsignacion = (proyectoId, tareaId) => {
        const actualizados = proyectos.map((proyecto) =>
            proyecto.id === proyectoId || proyecto._id === proyectoId
                ? {
                      ...proyecto,
                      tareas: (proyecto.tareas || []).map((tarea) =>
                          tarea.id === tareaId
                              ? {
                                    ...tarea,
                                    asignados: (tarea.asignados || []).filter(
                                        (id) => id !== user.id
                                    ),
                                }
                              : tarea
                      ),
                  }
                : proyecto
        );
        setProyectos(actualizados);
    };

    const toggleExpand = (proyectoId) => {
        setExpanded((prev) => ({
            ...prev,
            [proyectoId]: !prev[proyectoId],
        }));
    };

    if (loading || viewLoading) return <p>Cargando tus tareas asignadas...</p>;
    if (!user)
        return <p>No estás autenticado. Inicia sesión para continuar.</p>;

    const keys = Object.keys(tareasPorProyecto);

    return (
        <div style={{ marginTop: "2rem" }}>
            <h2 style={{ marginBottom: "1rem" }}>Mis Tareas Asignadas</h2>
            {keys.length === 0 ? (
                <p>No estás asignado a ninguna tarea actualmente.</p>
            ) : (
                keys.map((key) => {
                    const proyecto = tareasPorProyecto[key];
                    return (
                        <div
                            key={key}
                            style={{
                                marginBottom: "1.5rem",
                                border: "1px solid #ccc",
                                borderRadius: "6px",
                                backgroundColor: "#f9f9f9",
                            }}
                        >
                            <div
                                onClick={() => toggleExpand(key)}
                                style={{
                                    padding: "0.75rem 1rem",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    backgroundColor: "#eee",
                                    borderBottom: "1px solid #ccc",
                                }}
                            >
                                {proyecto.nombre} {expanded[key] ? "▲" : "▼"}
                            </div>

                            {expanded[key] && (
                                <ul
                                    style={{
                                        listStyle: "none",
                                        padding: "1rem",
                                        maxHeight: "250px",
                                        overflowY: "auto",
                                    }}
                                >
                                    {proyecto.tareas.map((tarea) => (
                                        <li
                                            key={tarea.id}
                                            style={{
                                                marginBottom: "0.75rem",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                borderBottom: "1px solid #eee",
                                                paddingBottom: "0.5rem",
                                            }}
                                        >
                                            <span>{tarea.nombre}</span>
                                            <button
                                                onClick={() =>
                                                    cancelarAsignacion(
                                                        key,
                                                        tarea.id
                                                    )
                                                }
                                                style={{
                                                    backgroundColor: "#d9534f",
                                                    color: "white",
                                                    border: "none",
                                                    padding: "0.3rem 0.6rem",
                                                    cursor: "pointer",
                                                    borderRadius: "4px",
                                                }}
                                            >
                                                Cancelar
                                            </button>
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

export default MisProyectos;
