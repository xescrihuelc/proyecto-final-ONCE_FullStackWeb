import { useContext, useEffect, useState } from "react";
import { ProyectoContext } from "../../context/ProyectoContext";
import { useAuth } from "../../context/AuthContext";

const ListaProyectos = () => {
    const { proyectos, setProyectos } = useContext(ProyectoContext);
    const { user, loading } = useAuth();
    const [viewLoading, setViewLoading] = useState(true);
    const [expanded, setExpanded] = useState({});
    const [filtro, setFiltro] = useState("");

    useEffect(() => {
        const timeout = setTimeout(() => setViewLoading(false), 500);
        return () => clearTimeout(timeout);
    }, []);

    // Actualiza la lista de usuarios asignados a una tarea
    const handleUsuariosAsignadosChange = (
        proyectoId,
        tareaId,
        usuariosNuevos
    ) => {
        const actualizados = proyectos.map((proyecto) => {
            if (proyecto.id === proyectoId || proyecto._id === proyectoId) {
                const tareasActualizadas = obtenerTareas(proyecto).map(
                    (tarea) => {
                        if (tarea.id === tareaId) {
                            return {
                                ...tarea,
                                asignados: usuariosNuevos,
                            };
                        }
                        return tarea;
                    }
                );

                // Actualiza tareas o subtarea según tipo
                if (Array.isArray(proyecto.tareas)) {
                    return { ...proyecto, tareas: tareasActualizadas };
                }

                if (typeof proyecto.subtarea === "string") {
                    return {
                        ...proyecto,
                        subtarea: tareasActualizadas
                            .map((t) => t.nombre)
                            .join(", "),
                    };
                }
            }
            return proyecto;
        });

        setProyectos(actualizados);
    };

    // Eliminar tarea de proyecto
    const handleEliminarTarea = (proyectoId, tareaId) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta tarea?")) return;

        const actualizados = proyectos.map((proyecto) => {
            if (proyecto.id === proyectoId || proyecto._id === proyectoId) {
                let tareasActualizadas = obtenerTareas(proyecto).filter(
                    (t) => t.id !== tareaId
                );

                if (Array.isArray(proyecto.tareas)) {
                    return { ...proyecto, tareas: tareasActualizadas };
                }

                if (typeof proyecto.subtarea === "string") {
                    return {
                        ...proyecto,
                        subtarea: tareasActualizadas
                            .map((t) => t.nombre)
                            .join(", "),
                    };
                }

                return proyecto;
            }
            return proyecto;
        });

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

    // Filtrar proyectos y tareas
    const proyectosFiltrados = proyectos
        .map((proyecto) => {
            const tareasFiltradas = obtenerTareas(proyecto).filter((tarea) =>
                tarea.nombre.toLowerCase().includes(filtro.toLowerCase())
            );
            if (
                proyecto.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
                proyecto.estructura
                    ?.toLowerCase()
                    .includes(filtro.toLowerCase()) ||
                tareasFiltradas.length > 0
            ) {
                return { ...proyecto, tareas: tareasFiltradas };
            }
            return null;
        })
        .filter(Boolean);

    const proyectosVisibles = proyectosFiltrados.filter((p) => {
        if (p.activo !== undefined) return p.activo;
        return p.subnivel !== "Inactivo";
    });

    return (
        <div style={{ marginTop: "2rem" }}>
            <h3>Proyectos disponibles</h3>
            <input
                type="text"
                placeholder="Filtra proyectos o tareas..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                style={{
                    marginBottom: "1rem",
                    padding: "0.5rem",
                    width: "100%",
                    maxWidth: "400px",
                    fontSize: "1rem",
                }}
            />
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
                                style={{ marginBottom: "0.5rem" }}
                            >
                                {expanded[proyecto.id || proyecto._id]
                                    ? "Ocultar tareas"
                                    : "Mostrar tareas"}
                            </button>
                            {expanded[proyecto.id || proyecto._id] && (
                                <ul
                                    style={{
                                        maxHeight: "300px",
                                        overflowY: "auto",
                                        marginTop: "0.5rem",
                                        paddingLeft: 0,
                                    }}
                                >
                                    {tareas.map((tarea) => (
                                        <li
                                            key={tarea.id}
                                            style={{
                                                margin: "0.4rem 0",
                                                display: "flex",
                                                flexDirection: "column",
                                                borderBottom: "1px solid #eee",
                                                paddingBottom: "0.5rem",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                    marginBottom: "0.4rem",
                                                }}
                                            >
                                                <span>
                                                    <strong>
                                                        {tarea.nombre}
                                                    </strong>
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        handleEliminarTarea(
                                                            proyecto.id ||
                                                                proyecto._id,
                                                            tarea.id
                                                        )
                                                    }
                                                    style={{
                                                        backgroundColor:
                                                            "#e74c3c",
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: "4px",
                                                        padding: "2px 8px",
                                                        cursor: "pointer",
                                                    }}
                                                    title="Eliminar tarea"
                                                >
                                                    &times;
                                                </button>
                                            </div>

                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "1rem",
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                <select
                                                    multiple
                                                    style={{
                                                        minWidth: "250px",
                                                        height: "6rem",
                                                    }}
                                                    value={
                                                        tarea.asignados || []
                                                    }
                                                    onChange={(e) => {
                                                        const seleccionados =
                                                            Array.from(
                                                                e.target
                                                                    .selectedOptions
                                                            ).map(
                                                                (opt) =>
                                                                    opt.value
                                                            );
                                                        handleUsuariosAsignadosChange(
                                                            proyecto.id ||
                                                                proyecto._id,
                                                            tarea.id,
                                                            seleccionados
                                                        );
                                                    }}
                                                >
                                                    {proyecto.assignedUsers?.map(
                                                        (userId) => {
                                                            const userData =
                                                                proyecto.users?.find(
                                                                    (u) =>
                                                                        u._id ===
                                                                        userId
                                                                );
                                                            // Si no tienes users en proyecto, usa global usuarios
                                                            // O pasa una lista global usuarios al componente y úsala aquí
                                                            return (
                                                                <option
                                                                    key={userId}
                                                                    value={
                                                                        userId
                                                                    }
                                                                >
                                                                    {userData
                                                                        ? userData.name ||
                                                                          userData.email
                                                                        : userId}
                                                                </option>
                                                            );
                                                        }
                                                    )}
                                                </select>

                                                <button
                                                    style={{
                                                        backgroundColor:
                                                            "#f39c12",
                                                        border: "none",
                                                        borderRadius: "4px",
                                                        padding: "4px 8px",
                                                        cursor: "pointer",
                                                        height: "2.5rem",
                                                        color: "#fff",
                                                    }}
                                                    onClick={() => {
                                                        // Expulsar último usuario asignado (ejemplo)
                                                        if (
                                                            !tarea.asignados ||
                                                            tarea.asignados
                                                                .length === 0
                                                        )
                                                            return;
                                                        const usuariosRestantes =
                                                            tarea.asignados.slice(
                                                                0,
                                                                -1
                                                            );
                                                        handleUsuariosAsignadosChange(
                                                            proyecto.id ||
                                                                proyecto._id,
                                                            tarea.id,
                                                            usuariosRestantes
                                                        );
                                                    }}
                                                    title="Expulsar último usuario"
                                                >
                                                    Expulsar usuario
                                                </button>
                                            </div>
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
