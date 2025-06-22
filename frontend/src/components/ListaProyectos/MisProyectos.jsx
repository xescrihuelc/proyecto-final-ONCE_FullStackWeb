// === Componente: MisProyectos.jsx ===

import { useContext, useEffect, useState } from "react";
import { ProyectoContext } from "../../context/ProyectoContext";
import { useAuth } from "../../context/AuthContext";
import "./MisProyectos.css";

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
        <div className="seccion">
            <h2 className="seccion-titulo">Mis Tareas Asignadas</h2>
            {keys.length === 0 ? (
                <p>No estás asignado a ninguna tarea actualmente.</p>
            ) : (
                keys.map((key) => {
                    const proyecto = tareasPorProyecto[key];
                    return (
                        <div key={key} className="tarjeta-expandible">
                            <div
                                className="tarjeta-cabecera"
                                onClick={() => toggleExpand(key)}
                            >
                                {proyecto.nombre} {expanded[key] ? "▲" : "▼"}
                            </div>

                            {expanded[key] && (
                                <ul className="lista-tareas">
                                    {proyecto.tareas.map((tarea) => (
                                        <li
                                            key={tarea.id}
                                            className="tarjeta-tarea"
                                        >
                                            <span>{tarea.nombre}</span>
                                            <button
                                                className="btn-cancelar"
                                                onClick={() =>
                                                    cancelarAsignacion(
                                                        key,
                                                        tarea.id
                                                    )
                                                }
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
