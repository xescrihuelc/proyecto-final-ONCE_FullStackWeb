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
            proyecto.id === proyectoId
                ? {
                      ...proyecto,
                      tareas: proyecto.tareas.map((tarea) =>
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

    if (loading || viewLoading) return <p>Cargando proyectos disponibles...</p>;
    if (!user)
        return <p>No estás autenticado. Inicia sesión para continuar.</p>;

    const proyectosVisibles = proyectos.filter((p) => p.activo !== false);

    return (
        <div style={{ marginTop: "2rem" }}>
            <h3>Proyectos disponibles</h3>
            {proyectosVisibles.length === 0 ? (
                <p>No hay proyectos activos registrados aún.</p>
            ) : (
                proyectosVisibles.map((proyecto) => (
                    <div
                        key={proyecto.id}
                        style={{
                            marginBottom: "1.5rem",
                            borderBottom: "1px solid #ddd",
                            paddingBottom: "1rem",
                        }}
                    >
                        <h4>{proyecto.nombre}</h4>
                        <button onClick={() => toggleExpanded(proyecto.id)}>
                            {expanded[proyecto.id]
                                ? "Ocultar tareas"
                                : "Mostrar tareas"}
                        </button>
                        {expanded[proyecto.id] && (
                            <ul
                                style={{
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                    marginTop: "0.5rem",
                                }}
                            >
                                {proyecto.tareas.map((tarea) => (
                                    <li
                                        key={tarea.id}
                                        style={{ margin: "0.4rem 0" }}
                                    >
                                        {tarea.nombre} —{" "}
                                        {tarea.asignados?.includes(user.id) ? (
                                            <strong>Ya estás asignado</strong>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    handleAsignar(
                                                        proyecto.id,
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
                ))
            )}
        </div>
    );
};

export default ListaProyectos;
