import { useState, useEffect } from "react";
import { getAllUsers } from "../../services/userService";
import { createTask } from "../../services/taskService";
import "./CrearProyecto.css";

const CrearProyecto = () => {
  const [estructura, setEstructura] = useState("");
  const [lineaTrabajo, setLineaTrabajo] = useState("");
  const [subnivel, setSubnivel] = useState("");
  const [subtarea, setSubtarea] = useState("");
  const [esProyectoEuropeo, setEsProyectoEuropeo] = useState(false);
  const [activo, setActivo] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // Cargar usuarios al montar componente
  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const data = await getAllUsers();
        setUsuarios(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchUsuarios();
  }, []);

  // Agregar usuario seleccionado desde el select
  const handleUsuarioAgregar = (e) => {
    const userId = e.target.value;
    if (userId && !usuariosSeleccionados.some((u) => u._id === userId)) {
      const usuario = usuarios.find((u) => u._id === userId);
      if (usuario) {
        setUsuariosSeleccionados([...usuariosSeleccionados, usuario]);
      }
    }
    e.target.value = ""; // reset select
  };

  // Quitar usuario de la selección
  const handleUsuarioQuitar = (id) => {
    setUsuariosSeleccionados(usuariosSeleccionados.filter((u) => u._id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    // Validación cliente (opcional pero recomendable)
    if (!estructura.trim() || !lineaTrabajo.trim() || !subnivel.trim()) {
      setMensaje(
        "Error: Debes rellenar estructura, línea de trabajo y subnivel."
      );
      setLoading(false);
      return;
    }

    try {
      await createTask({
        estructura,
        lineaTrabajo,
        subnivel,
        subtarea,
        esProyectoEuropeo,
        isActive: activo,
        assignedUsers: usuariosSeleccionados.map((u) => u._id),
      });

      setMensaje("Proyecto creado con éxito 🎉");
      setEstructura("");
      setLineaTrabajo("");
      setSubnivel("");
      setSubtarea("");
      setEsProyectoEuropeo(false);
      setActivo(true);
      setUsuariosSeleccionados([]);
    } catch (error) {
      setMensaje(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crear-proyecto">
      <h3>Crear nuevo proyecto</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="estructura">Estructura:</label>
        <input
          id="estructura"
          type="text"
          value={estructura}
          onChange={(e) => setEstructura(e.target.value)}
          placeholder="Ej. Estructura X"
          required
        />

        <label htmlFor="lineaTrabajo">Línea de Trabajo:</label>
        <input
          id="lineaTrabajo"
          type="text"
          value={lineaTrabajo}
          onChange={(e) => setLineaTrabajo(e.target.value)}
          placeholder="Ej. Línea 1"
          required
        />

        <label htmlFor="subnivel">Subnivel:</label>
        <input
          id="subnivel"
          type="text"
          value={subnivel}
          onChange={(e) => setSubnivel(e.target.value)}
          placeholder="Ej. Subnivel A"
          required
        />

        <label htmlFor="subtarea">Subtarea:</label>
        <input
          id="subtarea"
          type="text"
          value={subtarea}
          onChange={(e) => setSubtarea(e.target.value)}
          placeholder="Escribe la subtarea"
        />

        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={esProyectoEuropeo}
              onChange={(e) => setEsProyectoEuropeo(e.target.checked)}
            />
            Proyecto Europeo
          </label>

          <label>
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
            />
            Activo
          </label>
        </div>

        <label htmlFor="usuarios-select">Asignar usuarios:</label>
        <select
          id="usuarios-select"
          onChange={handleUsuarioAgregar}
          defaultValue=""
        >
          <option value="" disabled>
            Selecciona usuario para añadir
          </option>
          {usuarios
            .filter(
              (usuario) =>
                !usuariosSeleccionados.some((u) => u._id === usuario._id)
            )
            .map((usuario) => (
              <option key={usuario._id} value={usuario._id}>
                {usuario.name || usuario.email}
              </option>
            ))}
        </select>

        <div className="etiquetas-usuarios">
          {usuariosSeleccionados.map((usuario) => (
            <span key={usuario._id} className="etiqueta-usuario">
              {usuario.name || usuario.email}
              <button
                type="button"
                onClick={() => handleUsuarioQuitar(usuario._id)}
                aria-label={`Quitar ${usuario.name || usuario.email}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear Proyecto"}
        </button>
      </form>

      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
};

export default CrearProyecto;
