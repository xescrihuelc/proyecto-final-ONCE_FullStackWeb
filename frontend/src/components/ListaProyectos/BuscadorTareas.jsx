// === Componente: BuscadorTareas.jsx ===

import { useEffect, useState } from "react";
import { getAllTasksLight } from "../../services/taskService";
import { useAuth } from "../../context/AuthContext";
import "./BuscadorTareas.css";

const BuscadorTareas = () => {
    const { user } = useAuth();
    const [todasTareas, setTodasTareas] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [coincidencias, setCoincidencias] = useState([]);

    useEffect(() => {
        const fetchTareas = async () => {
            try {
                const tareas = await getAllTasksLight();
                setTodasTareas(tareas);
            } catch (error) {
                console.error("Error al cargar tareas:", error);
            }
        };
        fetchTareas();
    }, []);

    useEffect(() => {
        if (busqueda.trim() === "") {
            setCoincidencias([]);
            return;
        }
        const filtro = todasTareas.filter((t) =>
            t.fullTaskName.toLowerCase().includes(busqueda.toLowerCase())
        );
        setCoincidencias(filtro);
    }, [busqueda, todasTareas]);

    const renderTareaInfo = (t) => {
        if (t.subtarea && t.subtarea.trim() !== "") {
            return (
                <div className="tarea-descripcion">
                    <div className="tarea-principal">{t.subnivel}</div>
                    <div className="tarea-secundaria">{t.subtarea}</div>
                </div>
            );
        } else {
            return (
                <div className="tarea-descripcion">
                    <div className="tarea-principal">{t.lineaTrabajo}</div>
                    <div className="tarea-secundaria">{t.subnivel}</div>
                </div>
            );
        }
    };

    return (
        <div className="seccion buscador-tareas-container">
            <h3>Buscar Tareas</h3>
            <input
                type="text"
                placeholder="Escribe una parte del nombre de la tarea..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input-group"
            />
            <ul className="lista-tareas-filtradas">
                {coincidencias.map((t) => (
                    <li
                        key={t._id}
                        className={`tarea-item ${!t.isActive ? "tarea-inactiva" : ""}`}
                    >
                        {renderTareaInfo(t)}
                        {!t.isActive && (
                            <span className="estado-inactivo">(Inactiva)</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BuscadorTareas;