import React, { createContext, useState, useEffect, useContext } from "react";
import { getAllTasks } from "../services/taskService";
import { AuthContext } from "./AuthContext"; // ✅ importante

export const ProyectoContext = createContext();

export const ProyectoProvider = ({ children }) => {
    const [proyectos, setProyectos] = useState([]);
    const [loading, setLoading] = useState(true);

    const { token } = useContext(AuthContext); // ✅ forma correcta

    useEffect(() => {
        const fetchProyectos = async () => {
            try {
                if (!token) return;

                const tareasBD = await getAllTasks(token); // ✅ token pasado correctamente
                setProyectos(tareasBD);
            } catch (err) {
                console.error("Error al cargar proyectos:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProyectos();
    }, [token]);

    const asignarUsuarioATarea = (proyectoId, tareaId, usuarioId) => {
        setProyectos((prev) =>
            prev.map((proyecto) =>
                proyecto.id === proyectoId
                    ? {
                          ...proyecto,
                          tareas: proyecto.tareas.map((tarea) =>
                              tarea.id === tareaId
                                  ? {
                                        ...tarea,
                                        asignados: tarea.asignados
                                            ? [
                                                  ...new Set([
                                                      ...tarea.asignados,
                                                      usuarioId,
                                                  ]),
                                              ]
                                            : [usuarioId],
                                    }
                                  : tarea
                          ),
                      }
                    : proyecto
            )
        );
    };

    return (
        <ProyectoContext.Provider
            value={{ proyectos, setProyectos, asignarUsuarioATarea, loading }}
        >
            {children}
        </ProyectoContext.Provider>
    );
};
