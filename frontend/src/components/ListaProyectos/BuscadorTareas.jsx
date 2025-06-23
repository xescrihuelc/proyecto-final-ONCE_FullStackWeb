import { useEffect, useState } from "react";
import { getAllTasks } from "../../services/taskService";
import { useAuth } from "../../context/AuthContext";
import "./BuscadorTareas.css";

const BuscadorTareas = () => {
    const { user } = useAuth();
    const [proyectos, setProyectos] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [coincidencias, setCoincidencias] = useState([]);

    useEffect(() => {
        const fetchTareas = async () => {
            try {
                const tareas = await getAllTasks();
                setProyectos(tareas);
            } catch (error) {
                console.error("Error al cargar tareas:", error);
            }
        };
        fetchTareas();
    }, []);

    useEffect(() => {
        const term = busqueda.trim().toLowerCase();
        if (!term) {
            setCoincidencias([]);
            return;
        }

        const resultados = proyectos.flatMap((proyecto) =>
            proyecto.tareas
                .filter((t) => t.nombre.toLowerCase().includes(term))
                .map((t) => ({
                    ...t,
                    proyectoNombre: proyecto.nombre,
                    activo: proyecto.activo,
                }))
        );

        setCoincidencias(resultados);
    }, [busqueda, proyectos]);

    return (
        <div className="seccion buscador-tareas-container">
            <h3>Buscar Tareas</h3>
            <input
                type="text"
                placeholder="Escribe el nombre de una tarea..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input-group"
            />
            <ul className="lista-tareas-filtradas">
                {coincidencias.map((t) => (
                    <li
                        key={t.id}
                        className={`tarea-item ${
                            !t.activo ? "tarea-inactiva" : ""
                        }`}
                    >
                        <strong>{t.nombre}</strong>
                        <span className="tarea-proyecto">
                            {" "}
                            en <em>{t.proyectoNombre}</em>
                        </span>
                        {!t.activo && (
                            <span className="estado-inactivo"> (Inactiva)</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BuscadorTareas;
