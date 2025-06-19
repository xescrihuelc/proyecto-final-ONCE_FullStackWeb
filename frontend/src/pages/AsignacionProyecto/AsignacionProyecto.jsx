import { useContext } from "react";
import { ProyectoContext } from "../../context/ProyectoContext";

const AsignacionProyecto = () => {
  const { proyectos } = useContext(ProyectoContext);

  return (
    <div className="container">
      <h2>Gestión de Proyectos</h2>
      {proyectos.length === 0 ? (
        <p>No hay proyectos disponibles.</p>
      ) : (
        proyectos.map(proyecto => (
          <div key={proyecto.id} className="proyecto-item">
            <h3>{proyecto.nombre}</h3>
            <ul>
              {proyecto.tareas.map(tarea => (
                <li key={tarea.id}>{tarea.nombre}</li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default AsignacionProyecto;
