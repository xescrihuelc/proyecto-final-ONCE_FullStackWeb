// ProyectoContext.js
import React, { createContext, useState, useEffect } from "react";

export const ProyectoContext = createContext();

export const ProyectoProvider = ({ children }) => {
    const [proyectos, setProyectos] = useState(() => {
        const saved = localStorage.getItem("proyectos");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("proyectos", JSON.stringify(proyectos));
    }, [proyectos]);

    // Función para que un usuario se añada a una tarea (solo front)
    const asignarUsuarioATarea = (proyectoId, tareaId, usuarioId) => {
        setProyectos((prev) =>
            prev.map((proyecto) => {
                if (proyecto.id === proyectoId) {
                    return {
                        ...proyecto,
                        tareas: proyecto.tareas.map((tarea) => {
                            if (tarea.id === tareaId) {
                                // Aquí se añade usuarioId a la lista de asignados (crea o actualiza)
                                return {
                                    ...tarea,
                                    asignados: tarea.asignados
                                        ? [
                                              ...new Set([
                                                  ...tarea.asignados,
                                                  usuarioId,
                                              ]),
                                          ]
                                        : [usuarioId],
                                };
                            }
                            return tarea;
                        }),
                    };
                }
                return proyecto;
            })
        );
    };

    // Funciones admin para agregar/modificar proyectos aquí...

    return (
        <ProyectoContext.Provider
            value={{ proyectos, setProyectos, asignarUsuarioATarea }}
        >
            {children}
        </ProyectoContext.Provider>
    );
};
