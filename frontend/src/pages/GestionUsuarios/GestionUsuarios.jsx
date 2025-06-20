import { useEffect, useState } from "react";
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
        role: "trabajador",
        dailyHours: 8,
        isActive: true,
    });

    const cargarUsuarios = async () => {
        try {
            const data = await getAllUsers();
            setUsuarios(data);
        } catch (err) {
            console.error("Error al obtener usuarios:", err);
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

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

    const handleCrearUsuario = async () => {
        const { name, surnames, email, password, role, dailyHours, isActive } =
            nuevoUsuario;
        if (!name || !email || !password) {
            return alert(
                "Los campos nombre, email y contraseña son obligatorios."
            );
        }

        try {
            await createUser({
                name,
                surnames,
                email,
                password,
                roles: [role === "trabajador" ? "user" : role],
                dailyHours,
                isActive,
            });
            setNuevoUsuario({
                name: "",
                surnames: "",
                email: "",
                password: "",
                role: "trabajador",
                dailyHours: 8,
                isActive: true,
            });
            cargarUsuarios();
        } catch (err) {
            alert("Error al crear usuario: " + err.message);
        }
    };

    return (
        <div className="gestion-usuarios">
            <h1>Gestión de Usuarios</h1>

            <div className="usuario-cards">
                {usuarios.map((usuario) => (
                    <div className="usuario-card" key={usuario._id}>
                        {editando === usuario._id ? (
                            <>
                                <input
                                    value={valoresEditados.name || ""}
                                    onChange={(e) =>
                                        setValoresEditados((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="Nombre"
                                />
                                <input
                                    value={valoresEditados.surnames || ""}
                                    onChange={(e) =>
                                        setValoresEditados((prev) => ({
                                            ...prev,
                                            surnames: e.target.value,
                                        }))
                                    }
                                    placeholder="Apellidos"
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
                                    <strong>Nombre:</strong> {usuario.name}
                                </p>
                                <p>
                                    <strong>Apellidos:</strong>{" "}
                                    {usuario.surnames || "-"}
                                </p>
                                <p>
                                    <strong>Email:</strong> {usuario.email}
                                </p>
                                <p>
                                    <strong>Rol:</strong> {usuario.roles?.[0]}
                                </p>
                                <p>
                                    <strong>Horas/día:</strong>{" "}
                                    {usuario.dailyHours || "-"}
                                </p>
                                <p>
                                    <strong>Activo:</strong>{" "}
                                    {usuario.isActive ? "Sí" : "No"}
                                </p>
                                <div className="acciones">
                                    <button
                                        onClick={() => {
                                            setEditando(usuario._id);
                                            setValoresEditados({
                                                name: usuario.name,
                                                surnames:
                                                    usuario.surnames || "",
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
                    value={nuevoUsuario.role}
                    onChange={(e) =>
                        setNuevoUsuario({
                            ...nuevoUsuario,
                            role: e.target.value,
                        })
                    }
                >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="trabajador">Trabajador</option>
                </select>
                <input
                    type="number"
                    placeholder="Horas por día"
                    min={0}
                    max={7.5}
                    step={0.25}
                    value={nuevoUsuario.dailyHours}
                    onChange={(e) => {
                        let valor = parseFloat(e.target.value);
                        if (isNaN(valor)) valor = 0;
                        if (valor < 0) valor = 0;
                        if (valor > 7.5) valor = 7.5;
                        setNuevoUsuario({ ...nuevoUsuario, dailyHours: valor });
                    }}
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
