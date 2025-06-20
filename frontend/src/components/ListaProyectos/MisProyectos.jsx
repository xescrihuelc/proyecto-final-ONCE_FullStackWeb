import { useContext, useEffect, useState } from "react";
import { ProyectoContext } from "../../context/ProyectoContext";
import { useAuth } from "../../context/AuthContext";

const MisProyectos = () => {
    const { proyectos, setProyectos } = useContext(ProyectoContext);
    const { user, loading } = useAuth();
    const [proyectosUsuario, setProyectosUsuario] = useState([]);
    const [viewLoading, setViewLoading] = useState(true);
    const [mostrarTareas, setMostrarTareas] = useState({});

    useEffect(() => {
        if (user && proyectos.length > 0) {
            const asignados = proyectos
                .map((proyecto) => ({
                    ...proyecto,
                    tareas: proyecto.tareas.filter((t) =>
                        t.asignados?.includes(user.id)
                    ),
                }))
                .filter((proy) => proy.tareas.length > 0);

            setProyectosUsuario(asignados);
        }

        const timeout = setTimeout(() => setViewLoading(false), 500);
        return () => clearTimeout(timeout);
    }, [user, proyectos.length]);

    const cancelarAsignacion = (proyectoId, tareaId) => {
        const actualizados = proyectos.map((proyecto) =>
            proyecto.id === proyectoId
                ? {
                      ...proyecto,
                      tareas: proyecto.tareas.map((tarea) =>
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

    const toggleMostrar = (id) => {
        setMostrarTareas((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    if (loading || viewLoading) return <p>Cargando tus tareas asignadas...</p>;
    if (!user)
        return <p>No estás autenticado. Inicia sesión para continuar.</p>;

    return (
        <div style={{ marginTop: "2rem" }}>
            <h2 style={{ marginBottom: "1rem" }}>Mis Tareas Asignadas</h2>
            {proyectosUsuario.length === 0 ? (
                <p>No estás asignado a ninguna tarea actualmente.</p>
            ) : (
                proyectosUsuario.map((proyecto) => (
                    <div
                        key={proyecto.id}
                        style={{
                            marginBottom: "2rem",
                            borderBottom: "1px solid #ccc",
                            paddingBottom: "1rem",
                        }}
                    >
                        <h3>{proyecto.nombre}</h3>
                        <button
                            onClick={() => toggleMostrar(proyecto.id)}
                            style={{
                                marginBottom: "0.5rem",
                                cursor: "pointer",
                            }}
                        >
                            {mostrarTareas[proyecto.id]
                                ? "Ocultar tareas"
                                : "Mostrar tareas"}
                        </button>
                        {mostrarTareas[proyecto.id] && (
                            <ul
                                style={{
                                    listStyle: "none",
                                    paddingLeft: 0,
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                    border: "1px solid #eee",
                                    borderRadius: "4px",
                                    padding: "0.5rem",
                                }}
                            >
                                {proyecto.tareas.map((tarea) => (
                                    <li
                                        key={tarea.id}
                                        style={{
                                            margin: "0.5rem 0",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <span>{tarea.nombre}</span>
                                        <button
                                            onClick={() =>
                                                cancelarAsignacion(
                                                    proyecto.id,
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
                ))
            )}
        </div>
    );
};

export default MisProyectos;
