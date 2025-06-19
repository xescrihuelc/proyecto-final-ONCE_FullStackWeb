import { useContext } from "react";
import { ProyectoContext } from "../../context/ProyectoContext";
import { AuthContext } from "../../context/AuthContext";

const ListaProyectos = () => {
    const { proyectos, asignarUsuarioATarea } = useContext(ProyectoContext);
    const { user } = useContext(AuthContext);

    return (
        <div>
            <h3>Todos los Proyectos</h3>
            {proyectos.length === 0 && <p>No hay proyectos disponibles.</p>}
            {proyectos.map((proyecto) => (
                <div key={proyecto.id} style={{ marginBottom: "1rem" }}>
                    <h4>{proyecto.nombre}</h4>
                    <ul>
                        {proyecto.tareas.map((tarea) => (
                            <li key={tarea.id}>
                                {tarea.nombre} - Asignados:{" "}
                                {tarea.asignados ? tarea.asignados.length : 0}
                                <button
                                    onClick={() =>
                                        asignarUsuarioATarea(
                                            proyecto.id,
                                            tarea.id,
                                            user.id
                                        )
                                    }
                                    disabled={tarea.asignados?.includes(
                                        user.id
                                    )}
                                    style={{ marginLeft: "10px" }}
                                >
                                    {tarea.asignados?.includes(user.id)
                                        ? "Asignado"
                                        : "Autoasignarme"}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default ListaProyectos;
