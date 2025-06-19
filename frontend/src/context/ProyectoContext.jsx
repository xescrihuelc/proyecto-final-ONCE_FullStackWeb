// src/context/ProyectoContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const ProyectoContext = createContext();

export const ProyectoProvider = ({ children }) => {
    const datosSimulados = [
        {
            id: 1,
            nombre: "Proyecto A",
            tareas: [
                { id: 101, nombre: "Diseño", asignados: [] },
                { id: 102, nombre: "Desarrollo", asignados: [] },
            ],
        },
        {
            id: 2,
            nombre: "Proyecto B",
            tareas: [
                { id: 201, nombre: "Documentación", asignados: [] },
                { id: 202, nombre: "Testing", asignados: [] },
            ],
        },
    ];

    const [proyectos, setProyectos] = useState(() => {
        const saved = localStorage.getItem("proyectos");
        return saved ? JSON.parse(saved) : datosSimulados;
    });

    useEffect(() => {
        localStorage.setItem("proyectos", JSON.stringify(proyectos));
    }, [proyectos]);

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
            value={{ proyectos, setProyectos, asignarUsuarioATarea }}
        >
            {children}
        </ProyectoContext.Provider>
    );
};
