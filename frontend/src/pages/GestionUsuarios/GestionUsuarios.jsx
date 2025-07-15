import React, { useEffect, useState } from "react";
import { getSesameUser } from "../../services/sesameService";
import {
  createUser,
  deleteUser,
  getAllUsers,
  updateUser,
} from "../../services/userService";
import "./GestionUsuarios.css";

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [editando, setEditando] = useState(null);
  const [valoresEditados, setValoresEditados] = useState({});
  const [nuevoUsuario, setNuevoUsuario] = useState({
    name: "",
    surnames: "",
    email: "",
    password: "",
    roles: ["user"],
    dailyHours: 7.5,
    isActive: true,
    sesameEmployeeId: "",
    imageProfileURL: "",
    jobChargeName: "",
  });

  const [sesameLoading, setSesameLoading] = useState(false);
  const [sesameError, setSesameError] = useState("");
  const [sesameLoadingEdit, setSesameLoadingEdit] = useState(false);
  const [sesameErrorEdit, setSesameErrorEdit] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Carga inicial de usuarios
  const cargarUsuarios = async () => {
    try {
      const data = await getAllUsers();
      setUsuarios(data);
    } catch (err) {
      alert("Error cargando usuarios: " + err.message);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Eliminar usuario
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    try {
      await deleteUser(id);
      cargarUsuarios();
    } catch (err) {
      alert("Error eliminando: " + err.message);
    }
  };

  // Guardar edición
  const handleGuardar = async (id) => {
    try {
      await updateUser(id, valoresEditados);
      setEditando(null);
      setValoresEditados({});
      cargarUsuarios();
    } catch (err) {
      alert("Error actualizando: " + err.message);
    }
  };

  // Crear nuevo usuario
  const handleCrearUsuario = async () => {
    const { name, surnames, email, password, sesameEmployeeId } = nuevoUsuario;
    if (!name || !email || !password || !sesameEmployeeId) {
      return alert(
        "Los campos Nombre, Email, Contraseña y Sesame Employee ID son obligatorios."
      );
    }
    try {
      await createUser(nuevoUsuario);
      setNuevoUsuario({
        name: "",
        surnames: "",
        email: "",
        password: "",
        roles: ["user"],
        dailyHours: 7.5,
        isActive: true,
        sesameEmployeeId: "",
        imageProfileURL: "",
        jobChargeName: "",
      });
      cargarUsuarios();
    } catch (err) {
      alert("Error al crear usuario: " + err.message);
    }
  };

  // Fetch Sesame - creación
  const handleFetchSesame = async () => {
    if (!emailRegex.test(nuevoUsuario.email)) return;
    setSesameError("");
    setSesameLoading(true);
    try {
      const encodedEmail = encodeURIComponent(nuevoUsuario.email);
      const data = await getSesameUser(encodedEmail);
      setNuevoUsuario((prev) => ({
        ...prev,
        sesameEmployeeId: data.employeeId,
        name: data.firstName,
        surnames: data.lastName,
        email: data.email,
        imageProfileURL: data.imageProfileURL,
        jobChargeName: data.jobChargeName,
      }));
    } catch (error) {
      setSesameError("Error al obtener datos de Sesame");
    } finally {
      setSesameLoading(false);
    }
  };

  // Fetch Sesame - edición
  const handleFetchSesameEdit = async () => {
    const emailToFetch = valoresEditados.email || "";
    if (!emailRegex.test(emailToFetch)) return;
    setSesameErrorEdit("");
    setSesameLoadingEdit(true);
    try {
      const encodedEmail = encodeURIComponent(emailToFetch);
      const data = await getSesameUser(encodedEmail);
      setValoresEditados((prev) => ({
        ...prev,
        sesameEmployeeId: data.employeeId,
        name: data.firstName,
        surnames: data.lastName,
        email: data.email,
        imageProfileURL: data.imageProfileURL,
        jobChargeName: data.jobChargeName,
      }));
    } catch (error) {
      setSesameErrorEdit("Error al obtener datos de Sesame");
    } finally {
      setSesameLoadingEdit(false);
    }
  };

  // Estilos del botón Sesame
  const buttonStyle = (disabled) => ({
    marginLeft: "8px",
    backgroundColor: "blue",
    color: "white",
    cursor: disabled ? "not-allowed" : "pointer",
  });

  return (
    <div className="gestion-usuarios">
      <h1>Gestión de Usuarios</h1>

      {/* Listado de usuarios */}
      <div className="usuario-cards">
        {usuarios.map((usuario) => (
          <div className="usuario-card" key={usuario._id}>
            {editando === usuario._id ? (
              <>
                {/* Input Email + Botón Sesame */}
                <div
                  className="sesame-input"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <input
                    placeholder="Email"
                    type="email"
                    value={valoresEditados.email || usuario.email}
                    onChange={(e) =>
                      setValoresEditados((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    disabled={
                      !emailRegex.test(
                        valoresEditados.email || usuario.email
                      ) || sesameLoadingEdit
                    }
                    onClick={handleFetchSesameEdit}
                    style={buttonStyle(
                      !emailRegex.test(
                        valoresEditados.email || usuario.email
                      ) || sesameLoadingEdit
                    )}
                  >
                    {sesameLoadingEdit ? "Cargando..." : "Sesame"}
                  </button>
                </div>
                {sesameErrorEdit && <p className="error">{sesameErrorEdit}</p>}
                {/* Resto de inputs en edición */}
                <input
                  placeholder="Nombre"
                  value={valoresEditados.name || usuario.name}
                  onChange={(e) =>
                    setValoresEditados((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
                <input
                  placeholder="Apellidos"
                  value={valoresEditados.surnames || usuario.surnames}
                  onChange={(e) =>
                    setValoresEditados((prev) => ({
                      ...prev,
                      surnames: e.target.value,
                    }))
                  }
                />
                <input
                  placeholder="Sesame Employee ID"
                  value={
                    valoresEditados.sesameEmployeeId || usuario.sesameEmployeeId
                  }
                  onChange={(e) =>
                    setValoresEditados((prev) => ({
                      ...prev,
                      sesameEmployeeId: e.target.value,
                    }))
                  }
                />
                <input
                  placeholder="URL imagen de perfil"
                  value={
                    valoresEditados.imageProfileURL || usuario.imageProfileURL
                  }
                  onChange={(e) =>
                    setValoresEditados((prev) => ({
                      ...prev,
                      imageProfileURL: e.target.value,
                    }))
                  }
                />
                <input
                  placeholder="Cargo"
                  value={valoresEditados.jobChargeName || usuario.jobChargeName}
                  onChange={(e) =>
                    setValoresEditados((prev) => ({
                      ...prev,
                      jobChargeName: e.target.value,
                    }))
                  }
                />
                <select
                  value={
                    valoresEditados.roles
                      ? valoresEditados.roles[0]
                      : usuario.roles[0]
                  }
                  onChange={(e) =>
                    setValoresEditados((prev) => ({
                      ...prev,
                      roles: [e.target.value],
                    }))
                  }
                >
                  <option value="director">Director</option>
                  <option value="admin">Coordinador</option>
                  <option value="user">Trabajador</option>
                </select>
                <input
                  type="number"
                  min={0}
                  max={24}
                  step={0.25}
                  placeholder="Horas de trabajo diarias"
                  value={valoresEditados.dailyHours || usuario.dailyHours}
                  onChange={(e) =>
                    setValoresEditados((prev) => ({
                      ...prev,
                      dailyHours: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
                <label style={{ display: "block", margin: "8px 0" }}>
                  <input
                    type="checkbox"
                    checked={
                      valoresEditados.isActive !== undefined
                        ? valoresEditados.isActive
                        : usuario.isActive
                    }
                    onChange={(e) =>
                      setValoresEditados((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                  />{" "}
                  Activo
                </label>
                <button onClick={() => handleGuardar(usuario._id)}>
                  Guardar
                </button>
                <button id="cancel_edit" onClick={() => setEditando(null)}>
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <p>
                  <b>
                    {usuario.name} {usuario.surnames}
                  </b>
                </p>
                <p>{usuario.email}</p>
                <div className="acciones">
                  <button
                    onClick={() => {
                      setEditando(usuario._id);
                      setValoresEditados({
                        sesameEmployeeId: usuario.sesameEmployeeId,
                        name: usuario.name,
                        surnames: usuario.surnames,
                        email: usuario.email,
                        roles: usuario.roles,
                        dailyHours: usuario.dailyHours,
                        isActive: usuario.isActive,
                        imageProfileURL: usuario.imageProfileURL,
                        jobChargeName: usuario.jobChargeName,
                      });
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="delete"
                    onClick={() => handleEliminar(usuario._id)}
                  >
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Formulario nuevo usuario */}
      <div className="nuevo-usuario-form">
        <h2>Añadir nuevo usuario</h2>
        <div
          className="sesame-input"
          style={{ display: "flex", alignItems: "center", marginBottom: 8 }}
        >
          <input
            placeholder="Email"
            type="email"
            value={nuevoUsuario.email}
            onChange={(e) =>
              setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })
            }
            style={{ flex: 1 }}
          />
          <button
            type="button"
            disabled={!emailRegex.test(nuevoUsuario.email) || sesameLoading}
            onClick={handleFetchSesame}
            style={buttonStyle(
              !emailRegex.test(nuevoUsuario.email) || sesameLoading
            )}
          >
            {sesameLoading ? "Cargando..." : "Sesame"}
          </button>
        </div>
        {sesameError && <p className="error">{sesameError}</p>}
        <input
          placeholder="Nombre"
          value={nuevoUsuario.name}
          onChange={(e) =>
            setNuevoUsuario({ ...nuevoUsuario, name: e.target.value })
          }
        />
        <input
          placeholder="Apellidos"
          value={nuevoUsuario.surnames}
          onChange={(e) =>
            setNuevoUsuario({ ...nuevoUsuario, surnames: e.target.value })
          }
        />
        <input
          placeholder="Contraseña"
          type="password"
          value={nuevoUsuario.password}
          onChange={(e) =>
            setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })
          }
        />
        <select
          value={nuevoUsuario.roles[0]}
          onChange={(e) =>
            setNuevoUsuario({ ...nuevoUsuario, roles: [e.target.value] })
          }
        >
          <option value="director">Director</option>
          <option value="admin">Coordinador</option>
          <option value="user">Trabajador</option>
        </select>
        <input
          type="number"
          min={0}
          max={24}
          step={0.25}
          placeholder="Horas por día"
          value={nuevoUsuario.dailyHours}
          onChange={(e) =>
            setNuevoUsuario({
              ...nuevoUsuario,
              dailyHours: parseFloat(e.target.value) || 0,
            })
          }
        />
        <label style={{ display: "block", margin: "8px 0" }}>
          <input
            type="checkbox"
            checked={nuevoUsuario.isActive}
            onChange={(e) =>
              setNuevoUsuario({ ...nuevoUsuario, isActive: e.target.checked })
            }
          />{" "}
          Activo
        </label>
        <input
          placeholder="Sesame Employee ID"
          value={nuevoUsuario.sesameEmployeeId}
          onChange={(e) =>
            setNuevoUsuario({
              ...nuevoUsuario,
              sesameEmployeeId: e.target.value,
            })
          }
        />
        <input
          placeholder="URL imagen de perfil"
          value={nuevoUsuario.imageProfileURL}
          onChange={(e) =>
            setNuevoUsuario({
              ...nuevoUsuario,
              imageProfileURL: e.target.value,
            })
          }
        />
        <input
          placeholder="Cargo"
          value={nuevoUsuario.jobChargeName}
          onChange={(e) =>
            setNuevoUsuario({ ...nuevoUsuario, jobChargeName: e.target.value })
          }
        />
        <button onClick={handleCrearUsuario}>Crear usuario</button>
      </div>
    </div>
  );
}
