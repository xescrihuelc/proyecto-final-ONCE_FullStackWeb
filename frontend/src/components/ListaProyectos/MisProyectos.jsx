import { useContext, useEffect, useState } from "react";
import { ProyectoContext } from "../../context/ProyectoContext";
import { useAuth } from "../../context/AuthContext";
import "./MisProyectos.css";

const MisProyectos = () => {
    const { proyectos } = useContext(ProyectoContext);
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
                    (proyecto.subtarea
                        ? proyecto.subtarea.split(",").map((t, i) => ({
                              id: `${proyecto._id}-${i}`,
                              nombre: t.trim(),
                              asignados: [],
                          }))
                        : []);

                const asignadas = tareas.filter((t) =>
                    t.asignados?.includes(user.id)
                );
                if (asignadas.length) {
                    agrupadas[proyecto._id] = {
                        nombre: proyecto.estructura,
                        tareas: asignadas,
                    };
                }
            });
            setTareasPorProyecto(agrupadas);
        }
        const timer = setTimeout(() => setViewLoading(false), 300);
        return () => clearTimeout(timer);
    }, [user, proyectos]);

    if (loading || viewLoading) return <p>Cargando tus tareas asignadas...</p>;
    if (!user)
        return <p>No estás autenticado. Inicia sesión para continuar.</p>;

    const keys = Object.keys(tareasPorProyecto);
    return (
        <div className="mis-proyectos">
            <h3>Mis Tareas Asignadas</h3>
            {keys.length === 0 ? (
                <p>No estás asignado a ninguna tarea actualmente.</p>
            ) : (
                keys.map((key) => {
                    const grupo = tareasPorProyecto[key];
                    return (
                        <div key={key} className="mp-grupo">
                            <div
                                className="mp-header"
                                onClick={() =>
                                    setExpanded((e) => ({
                                        ...e,
                                        [key]: !e[key],
                                    }))
                                }
                            >
                                {grupo.nombre} {expanded[key] ? "▲" : "▼"}
                            </div>
                            {expanded[key] && (
                                <ul className="mp-lista">
                                    {grupo.tareas.map((t) => (
                                        <li key={t.id} className="mp-item">
                                            {t.nombre}
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
