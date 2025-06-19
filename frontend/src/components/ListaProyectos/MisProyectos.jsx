import { useContext } from "react";
import { ProyectoContext } from "../../context/ProyectoContext";
import { AuthContext } from "../../context/AuthContext";

const MisProyectos = () => {
    const { proyectos } = useContext(ProyectoContext);
    const { user } = useContext(AuthContext);

    // Filtramos los proyectos donde el usuario esté asignado a alguna tarea
    const proyectosUsuario = proyectos.filter((proyecto) =>
        proyecto.tareas.some((tarea) => tarea.asignados?.includes(user.id))
    );

    return (
        <div style={{ marginTop: "2rem" }}>
            <h3>Mis Proyectos</h3>
            {proyectosUsuario.length === 0 && (
                <p>No estás asignado a ningún proyecto.</p>
            )}
            {proyectosUsuario.map((proyecto) => (
                <div key={proyecto.id} style={{ marginBottom: "1rem" }}>
                    <h4>{proyecto.nombre}</h4>
                    <ul>
                        {proyecto.tareas
                            .filter((tarea) =>
                                tarea.asignados?.includes(user.id)
                            )
                            .map((tarea) => (
                                <li key={tarea.id}>{tarea.nombre}</li>
                            ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default MisProyectos;
