import React, { useEffect, useState } from "react";
import {
    getAllUsers,
    deleteUser,
    updateUser,
    createUser,
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
        dailyHours: 8,
        isActive: true,
        sesameEmployeeId: "",
    });
    const [impersonateId, setImpersonateId] = useState(
        localStorage.getItem("impersonateUserId") || ""
    );
    const [impersonateName, setImpersonateName] = useState(
        localStorage.getItem("impersonateUserName") || ""
    );

    // Función para cargar usuarios desde el servicio
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
    }, [impersonateId]);

    const handleEliminar = async (id) => {
        if (!window.confirm("¿Eliminar este usuario?")) return;
        try {
            await deleteUser(id);
            cargarUsuarios();
        } catch (err) {
            alert("Error eliminando: " + err.message);
        }
    };

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

    const handleStartImpersonate = (id, name) => {
        localStorage.setItem("impersonateUserId", id);
        localStorage.setItem("impersonateUserName", name);
        setImpersonateId(id);
        setImpersonateName(name);
    };

    const handleStopImpersonate = () => {
        localStorage.removeItem("impersonateUserId");
        localStorage.removeItem("impersonateUserName");
        setImpersonateId("");
        setImpersonateName("");
    };

    const handleCrearUsuario = async () => {
        const {
            name,
            surnames,
            email,
            password,
            roles,
            dailyHours,
            isActive,
            sesameEmployeeId,
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
                dailyHours: 8,
                isActive: true,
                sesameEmployeeId: "",
            });
            cargarUsuarios();
        } catch (err) {
            alert("Error al crear usuario: " + err.message);
        }
    };

    return (
        <div className="gestion-usuarios">
            {impersonateId && (
                <div id="visible" className="impersonation-banner">
                    👤 Impersonando a <strong>{impersonateName}</strong>
                    <button onClick={handleStopImpersonate}>Salir</button>
                </div>
            )}
            <h1>Gestión de Usuarios</h1>

            <div className="usuario-cards">
                {usuarios.map((usuario) => (
                    <div className="usuario-card" key={usuario._id}>
                        {editando === usuario._id ? (
                            <>
                                <p>
                                    <strong>ID:</strong> {usuario._id}
                                </p>
                                <p>
                                    <strong>Sesame Employee ID:</strong>{" "}
                                    {usuario.sesameEmployeeId}
                                </p>
                                <input
                                    value={valoresEditados.name || usuario.name}
                                    onChange={(e) =>
                                        setValoresEditados((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="Nombre"
                                />
                                <input
                                    value={
                                        valoresEditados.surnames ||
                                        usuario.surnames
                                    }
                                    onChange={(e) =>
                                        setValoresEditados((prev) => ({
                                            ...prev,
                                            surnames: e.target.value,
                                        }))
                                    }
                                    placeholder="Apellidos"
                                />
                                <input
                                    value={
                                        valoresEditados.email || usuario.email
                                    }
                                    onChange={(e) =>
                                        setValoresEditados((prev) => ({
                                            ...prev,
                                            email: e.target.value,
                                        }))
                                    }
                                    placeholder="Email"
                                />
                                <button
                                    onClick={() => handleGuardar(usuario._id)}
                                >
                                    Guardar
                                </button>
                                <button onClick={() => setEditando(null)}>
                                    Cancelar
                                </button>
                            </>
                        ) : (
                            <>
                                <p>
                                    <strong>ID:</strong> {usuario._id}
                                </p>
                                <p>
                                    <strong>Sesame Employee ID:</strong>{" "}
                                    {usuario.sesameEmployeeId}
                                </p>
                                <p>
                                    <strong>Nombre:</strong> {usuario.name}
                                </p>
                                <p>
                                    <strong>Apellidos:</strong>{" "}
                                    {usuario.surnames}
                                </p>
                                <p>
                                    <strong>Email:</strong> {usuario.email}
                                </p>
                                <div className="acciones">
                                    <button
                                        onClick={() => {
                                            setEditando(usuario._id);
                                            setValoresEditados({
                                                name: usuario.name,
                                                surnames: usuario.surnames,
                                                email: usuario.email,
                                            });
                                        }}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="delete"
                                        onClick={() =>
                                            handleEliminar(usuario._id)
                                        }
                                    >
                                        Eliminar
                                    </button>
                                    <button
                                        className="impersonate"
                                        onClick={() =>
                                            handleStartImpersonate(
                                                usuario._id,
                                                usuario.name
                                            )
                                        }
                                    >
                                        Entrar como usuario
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            <div className="nuevo-usuario-form">
                <h2>Añadir nuevo usuario</h2>
                <input
                    placeholder="Nombre"
                    value={nuevoUsuario.name}
                    onChange={(e) =>
                        setNuevoUsuario({
                            ...nuevoUsuario,
                            name: e.target.value,
                        })
                    }
                />
                <input
                    placeholder="Apellidos"
                    value={nuevoUsuario.surnames}
                    onChange={(e) =>
                        setNuevoUsuario({
                            ...nuevoUsuario,
                            surnames: e.target.value,
                        })
                    }
                />
                <input
                    placeholder="Email"
                    type="email"
                    value={nuevoUsuario.email}
                    onChange={(e) =>
                        setNuevoUsuario({
                            ...nuevoUsuario,
                            email: e.target.value,
                        })
                    }
                />
                <input
                    placeholder="Contraseña"
                    type="password"
                    value={nuevoUsuario.password}
                    onChange={(e) =>
                        setNuevoUsuario({
                            ...nuevoUsuario,
                            password: e.target.value,
                        })
                    }
                />
                <select
                    value={nuevoUsuario.roles[0]}
                    onChange={(e) =>
                        setNuevoUsuario({
                            ...nuevoUsuario,
                            roles: [e.target.value],
                        })
                    }
                >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
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
                <label>
                    <input
                        type="checkbox"
                        checked={nuevoUsuario.isActive}
                        onChange={(e) =>
                            setNuevoUsuario({
                                ...nuevoUsuario,
                                isActive: e.target.checked,
                            })
                        }
                    />
                    Activo
                </label>
                <button onClick={handleCrearUsuario}>Crear usuario</button>
            </div>
        </div>
    );
}
