import { createContext, useState } from "react";

export const ProyectoContext = createContext();

export const ProyectoProvider = ({ children }) => {
  const [proyectos, setProyectos] = useState([
    { id: 1, nombre: "Proyecto A", tareas: [{ id: 1, nombre: "Diseño", maxHoras: 7.5 }] }
  ]);

  return (
    <ProyectoContext.Provider value={{ proyectos, setProyectos }}>
      {children}
    </ProyectoContext.Provider>
  );
};
