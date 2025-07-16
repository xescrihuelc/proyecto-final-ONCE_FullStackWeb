import React, { useEffect, useState } from "react";
import { getSesameUser } from "../../services/sesameService";
import {
  createUser,
  deleteUser,
  getAllUsers,
  replaceUser,
} from "../../services/userService";
import "./GestionUsuarios.css";

const placeholderAvatar =
  "https://murrayglass.com/wp-content/uploads/2020/10/avatar-1536x1536.jpeg";

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
    jobChargeName: "",
    imageProfileURL: "",
    signature: {},
  });
  const [sesameLoading, setSesameLoading] = useState(false);
  const [sesameError, setSesameError] = useState("");
  const [sesameLoadingEdit, setSesameLoadingEdit] = useState(false);
  const [sesameErrorEdit, setSesameErrorEdit] = useState("");

  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

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

  const handleFetchSesame = async () => {
    if (!emailRegex.test(nuevoUsuario.email)) return;
    setSesameLoading(true);
    setSesameError("");
    try {
      const data = await getSesameUser(encodeURIComponent(nuevoUsuario.email));
      setNuevoUsuario((prev) => ({
        ...prev,
        sesameEmployeeId: data.id,
        name: data.firstName,
        surnames: data.lastName,
        email: data.email,
        imageProfileURL: data.imageProfileURL,
        jobChargeName: data.jobChargeName,
      }));
    } catch (err) {
      setSesameError("Error al obtener datos de Sesame");
    } finally {
      setSesameLoading(false);
    }
  };

  const handleFetchSesameEdit = async () => {
    const usuarioActual = usuarios.find((u) => u._id === editando) || {};
    const emailToFetch = valoresEditados.email || usuarioActual.email;
    if (!emailRegex.test(emailToFetch)) return;
    setSesameLoadingEdit(true);
    setSesameErrorEdit("");
    try {
      const data = await getSesameUser(encodeURIComponent(emailToFetch));
      setValoresEditados((prev) => ({
        ...prev,
        sesameEmployeeId: data.id,
        name: data.firstName,
        surnames: data.lastName,
        email: data.email,
        imageProfileURL: data.imageProfileURL,
        jobChargeName: data.jobChargeName,
      }));
    } catch (err) {
      setSesameErrorEdit("Error al obtener datos de Sesame");
    } finally {
      setSesameLoadingEdit(false);
    }
  };

  const buttonStyle = (disabled) => ({
    marginLeft: "8px",
    fontSize: "0.8rem",
    backgroundColor: "#3498db",
    color: "white",
    cursor: disabled ? "not-allowed" : "pointer",
  });

  // const handleGuardar = async (id) => {
  //   try {
  //     await replaceUser(id, valoresEditados);
  //     setEditando(null);
  //     setValoresEditados({});
  //     cargarUsuarios();
  //   } catch (err) {
  //     alert("Error actualizando: " + err.message);
  //   }
  // };

  const handleGuardar = async (id) => {
    try {
      const original = usuarios.find((u) => u._id === id) || {};
      // merge original + edits, ensure signature exists
      const fullUser = {
        ...original,
        ...valoresEditados,
        signature: original.signature || {},
      };
      await replaceUser(id, fullUser);
      setEditando(null);
      setValoresEditados({});
      cargarUsuarios();
    } catch (err) {
      alert("Error actualizando: " + err.message);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro?")) {
      try {
        await deleteUser(id);
        cargarUsuarios();
      } catch (err) {
        alert("Error eliminando: " + err.message);
      }
    }
  };

  const handleCrearUsuario = async () => {
    const {
      name,
      surnames,
      email,
      password,
      sesameEmployeeId,
      imageProfileURL,
      jobChargeName,
      signature,
    } = nuevoUsuario;
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
        signature: {},
      });
      cargarUsuarios();
    } catch (err) {
      alert("Error creando usuario: " + err.message);
    }
  };

  return (
    <div className="gestion-usuarios">
      <h1>Gestión de Usuarios</h1>
      <div className="usuario-cards">
        {usuarios.map((usuario) => (
          <div
            key={usuario._id}
            className={`usuario-card${usuario.isActive ? "" : " inactive"}`}
          >
            {editando === usuario._id ? (
              <>
                <div className="edit-usuario-form">
                  {/* --- Edit Form --- */}
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
                  {sesameErrorEdit && (
                    <p className="error">{sesameErrorEdit}</p>
                  )}
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
                  <input
                    placeholder="Image URL"
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
                    value={
                      valoresEditados.jobChargeName || usuario.jobChargeName
                    }
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
                    <option value="user">Técnico</option>
                    <option value="admin">Coordinador</option>
                    <option value="director">Director</option>
                  </select>
                  <label>
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
                </div>
              </>
            ) : (
              <div className="usuario-card-content">
                <div className="card-left">
                  <img
                    src={usuario.imageProfileURL || placeholderAvatar}
                    alt={`${usuario.name} ${usuario.surnames}`}
                    className="profile-image"
                  />
                </div>
                <div className="card-right">
                  <span className="daily-hours-badge">
                    {usuario.dailyHours}
                  </span>
                  <p className="card-name">
                    {usuario.name} {usuario.surnames}
                  </p>
                  <p className="card-job">{usuario.jobChargeName}</p>
                  <p className="card-email">{usuario.email}</p>
                  <div className="acciones">
                    <button
                      onClick={() => {
                        setEditando(usuario._id);
                        setValoresEditados({});
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
                </div>
              </div>
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
              setNuevoUsuario((prev) => ({ ...prev, email: e.target.value }))
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
            setNuevoUsuario((prev) => ({ ...prev, name: e.target.value }))
          }
        />
        <input
          placeholder="Apellidos"
          value={nuevoUsuario.surnames}
          onChange={(e) =>
            setNuevoUsuario((prev) => ({ ...prev, surnames: e.target.value }))
          }
        />
        <input
          placeholder="Contraseña"
          type="password"
          value={nuevoUsuario.password}
          onChange={(e) =>
            setNuevoUsuario((prev) => ({ ...prev, password: e.target.value }))
          }
        />
        <input
          type="number"
          min={0}
          max={24}
          step={0.25}
          placeholder="Horas por día"
          value={nuevoUsuario.dailyHours}
          onChange={(e) =>
            setNuevoUsuario((prev) => ({
              ...prev,
              dailyHours: parseFloat(e.target.value) || 0,
            }))
          }
        />
        <label>
          <input
            type="checkbox"
            checked={nuevoUsuario.isActive}
            onChange={(e) =>
              setNuevoUsuario((prev) => ({
                ...prev,
                isActive: e.target.checked,
              }))
            }
          />{" "}
          Activo
        </label>
        <input
          placeholder="Sesame Employee ID"
          value={nuevoUsuario.sesameEmployeeId}
          onChange={(e) =>
            setNuevoUsuario((prev) => ({
              ...prev,
              sesameEmployeeId: e.target.value,
            }))
          }
        />
        <input
          placeholder="Cargo"
          value={nuevoUsuario.jobChargeName}
          onChange={(e) =>
            setNuevoUsuario((prev) => ({
              ...prev,
              jobChargeName: e.target.value,
            }))
          }
        />
        <button onClick={handleCrearUsuario}>Crear usuario</button>
      </div>
    </div>
  );
}
