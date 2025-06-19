import { useContext } from "react";
import { ProyectoContext } from "../../context/ProyectoContext";
import { AuthContext } from "../../context/AuthContext";

const MisProyectos = () => {
    const { proyectos = [] } = useContext(ProyectoContext); // fallback a array vacío
    const { user } = useContext(AuthContext);

    if (!user?.id) {
        // Si user o user.id no está definido aún, mostramos mensaje o nada
        return <p>Cargando usuario...</p>;
    }

    // Filtrar proyectos donde alguna tarea tenga asignado al usuario
    const proyectosUsuario = proyectos.filter(
        (proyecto) =>
            Array.isArray(proyecto.tareas) && // asegurar que tareas es array
            proyecto.tareas.some(
                (tarea) =>
                    Array.isArray(tarea.asignados) &&
                    tarea.asignados.includes(user.id)
            )
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
                            .filter(
                                (tarea) =>
                                    Array.isArray(tarea.asignados) &&
                                    tarea.asignados.includes(user.id)
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
