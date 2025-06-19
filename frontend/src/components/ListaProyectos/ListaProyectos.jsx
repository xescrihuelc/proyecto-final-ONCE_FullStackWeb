import { useContext, useState } from "react";
import { ProyectoContext } from "../../context/ProyectoContext";
import { AuthContext } from "../../context/AuthContext";

const ListaProyectos = () => {
    const { proyectos, asignarUsuarioATarea } = useContext(ProyectoContext);
    const { user, loading } = useContext(AuthContext);

    const [proyectoAbierto, setProyectoAbierto] = useState(null);

    if (loading) {
        return <p>Cargando usuario...</p>;
    }

    if (!user) {
        return <p>No hay usuario autenticado.</p>;
    }

    const proyectosVisibles =
        user.role === "admin" ? proyectos : proyectos.filter((p) => p.activo);

    return (
        <div>
            <h3>Todos los Proyectos</h3>
            {proyectosVisibles.length === 0 && (
                <p>No hay proyectos disponibles.</p>
            )}
            {proyectosVisibles.map((proyecto) => {
                const abierto = proyectoAbierto === proyecto.id;

                return (
                    <div key={proyecto.id} style={{ marginBottom: "1rem" }}>
                        <h4
                            onClick={() =>
                                setProyectoAbierto(abierto ? null : proyecto.id)
                            }
                            style={{ cursor: "pointer", userSelect: "none" }}
                            title="Haz clic para mostrar/ocultar tareas"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    setProyectoAbierto(
                                        abierto ? null : proyecto.id
                                    );
                                }
                            }}
                        >
                            {proyecto.nombre} {abierto ? "▲" : "▼"}
                        </h4>
                        <p>
                            Asignados en proyecto:{" "}
                            {(proyecto.asignados ?? []).length}
                        </p>

                        {abierto && proyecto.tareas?.length > 0 && (
                            <div
                                style={{
                                    maxHeight: "150px",
                                    overflowY: "auto",
                                    marginTop: "10px",
                                    border: "1px solid #ccc",
                                    padding: "10px",
                                    borderRadius: "5px",
                                    backgroundColor: "#f9f9f9",
                                }}
                            >
                                <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
                                    {proyecto.tareas.map((tarea) => {
                                        const usuarioAsignadoEnTarea = (
                                            tarea.asignados ?? []
                                        ).includes(user.id);

                                        return (
                                            <li
                                                key={tarea.id}
                                                style={{
                                                    marginBottom: "0.5rem",
                                                }}
                                            >
                                                {tarea.nombre} - Asignados:{" "}
                                                {(tarea.asignados ?? []).length}
                                                <button
                                                    onClick={() =>
                                                        asignarUsuarioATarea(
                                                            proyecto.id,
                                                            tarea.id,
                                                            user.id
                                                        )
                                                    }
                                                    disabled={
                                                        usuarioAsignadoEnTarea
                                                    }
                                                    style={{
                                                        marginLeft: "10px",
                                                    }}
                                                >
                                                    {usuarioAsignadoEnTarea
                                                        ? "Asignado"
                                                        : "Autoasignarme"}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ListaProyectos;
