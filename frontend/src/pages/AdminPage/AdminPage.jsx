// === AdminPage.jsx actualizado ===

import { useState, useContext, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import "./AdminPage.css";
import { ProyectoContext } from "../../context/ProyectoContext";
import { createUser, getAllUsers } from "../../services/userService";
import { createTask } from "../../services/taskService";

const AdminPage = () => {
    const { proyectos, setProyectos } = useContext(ProyectoContext);
    const [usuarios, setUsuarios] = useState([]);
    const [nuevoUsuario, setNuevoUsuario] = useState({
        email: "",
        password: "",
        roles: ["user"],
    });
    const [nuevoProyecto, setNuevoProyecto] = useState({
        nombre: "",
        tareas: [],
        esEuropeo: false,
        activo: true,
    });
    const [nuevaTarea, setNuevaTarea] = useState({ nombre: "" });

    useEffect(() => {
        const cargarUsuarios = async () => {
            try {
                const data = await getAllUsers();
                setUsuarios(data);
            } catch (err) {
                console.error("Error al cargar usuarios:", err);
            }
        };
        cargarUsuarios();
    }, []);

    const agregarTarea = () => {
        if (!nuevaTarea.nombre.trim()) return;
        setNuevoProyecto((prev) => ({
            ...prev,
            tareas: [...prev.tareas, { ...nuevaTarea, id: Date.now() }],
        }));
        setNuevaTarea({ nombre: "" });
    };

    const guardarProyecto = async () => {
        if (!nuevoProyecto.nombre.trim() || nuevoProyecto.tareas.length === 0) {
            return alert("Proyecto inválido");
        }

        const body = {
            estructura: nuevoProyecto.nombre,
            lineaTrabajo: nuevoProyecto.esEuropeo ? "Europeo" : "Nacional",
            subnivel: nuevoProyecto.activo ? "Activo" : "Inactivo",
            subtarea: nuevoProyecto.tareas.map((t) => t.nombre).join(", "),
        };

        try {
            const res = await createTask(body);
            setProyectos((prev) => [...prev, res]);
            setNuevoProyecto({
                nombre: "",
                tareas: [],
                esEuropeo: false,
                activo: true,
            });
        } catch (err) {
            console.error("Error creando proyecto:", err);
        }
    };

    const agregarUsuario = async () => {
        if (!nuevoUsuario.email.trim() || !nuevoUsuario.password.trim()) {
            return alert("Debes rellenar ambos campos");
        }

        try {
            const sesameId = crypto.randomUUID();
            await createUser({ ...nuevoUsuario, sesameEmployeeId: sesameId });
            const updatedUsers = await getAllUsers();
            setUsuarios(updatedUsers);
            setNuevoUsuario({ email: "", password: "", roles: ["user"] });
        } catch (err) {
            alert("Error creando usuario: " + err.message);
        }
    };

    const handleRoleChange = (role) => {
        setNuevoUsuario((prev) => {
            const roles = prev.roles.includes(role)
                ? prev.roles.filter((r) => r !== role)
                : [...prev.roles, role];
            return { ...prev, roles };
        });
    };

    const datosGrafico = proyectos.map((p) => ({
        nombre: p.nombre || p.estructura,
        tareas: p.tareas?.length || p.subtarea?.split(", ").length || 0,
    }));

    return (
        <div className="container">
            <h2>Panel de Administración</h2>

            <section className="section">
                <h3>Añadir Nuevo Proyecto</h3>
                <input
                    className="input-group"
                    placeholder="Nombre del proyecto"
                    value={nuevoProyecto.nombre}
                    onChange={(e) =>
                        setNuevoProyecto({
                            ...nuevoProyecto,
                            nombre: e.target.value,
                        })
                    }
                />
                <label>
                    <input
                        type="checkbox"
                        checked={nuevoProyecto.esEuropeo}
                        onChange={(e) =>
                            setNuevoProyecto({
                                ...nuevoProyecto,
                                esEuropeo: e.target.checked,
                            })
                        }
                    />
                    Proyecto Europeo
                </label>
                <label style={{ marginLeft: "1rem" }}>
                    <input
                        type="checkbox"
                        checked={nuevoProyecto.activo}
                        onChange={(e) =>
                            setNuevoProyecto({
                                ...nuevoProyecto,
                                activo: e.target.checked,
                            })
                        }
                    />
                    Proyecto Activo
                </label>
                <div>
                    <input
                        className="input-inline"
                        placeholder="Nombre de la tarea"
                        value={nuevaTarea.nombre}
                        onChange={(e) =>
                            setNuevaTarea({
                                ...nuevaTarea,
                                nombre: e.target.value,
                            })
                        }
                    />
                    <button onClick={agregarTarea}>Añadir tarea</button>
                </div>
                <ul>
                    {nuevoProyecto.tareas.map((t) => (
                        <li key={t.id}>{t.nombre}</li>
                    ))}
                </ul>
                <button onClick={guardarProyecto}>Guardar Proyecto</button>
            </section>

            <section className="section">
                <h3>Proyectos existentes</h3>
                {proyectos.length === 0 ? (
                    <p>No hay proyectos.</p>
                ) : (
                    proyectos.map((p) => (
                        <div key={p._id || p.id} className="proyecto-item">
                            <strong>{p.nombre || p.estructura}</strong>{" "}
                            {p.lineaTrabajo === "Europeo" && <span>🌍</span>}
                            {p.subnivel === "Inactivo" && (
                                <em style={{ color: "gray" }}>(Inactivo)</em>
                            )}
                            <ul>
                                {(p.tareas || p.subtarea?.split(", ")).map(
                                    (t, i) => (
                                        <li key={i}>{t.nombre || t}</li>
                                    )
                                )}
                            </ul>
                        </div>
                    ))
                )}
            </section>

            <section className="section">
                <h3>Gestión de Usuarios</h3>
                <input
                    className="input-inline"
                    placeholder="Email"
                    value={nuevoUsuario.email}
                    onChange={(e) =>
                        setNuevoUsuario({
                            ...nuevoUsuario,
                            email: e.target.value,
                        })
                    }
                />
                <input
                    className="input-inline"
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
                <div style={{ marginTop: "0.5rem" }}>
                    <label>
                        <input
                            type="checkbox"
                            checked={nuevoUsuario.roles.includes("user")}
                            onChange={() => handleRoleChange("user")}
                        />
                        Rol: Usuario
                    </label>
                    <label style={{ marginLeft: "1rem" }}>
                        <input
                            type="checkbox"
                            checked={nuevoUsuario.roles.includes("admin")}
                            onChange={() => handleRoleChange("admin")}
                        />
                        Rol: Administrador
                    </label>
                </div>
                <button onClick={agregarUsuario}>Crear Usuario</button>
                <ul style={{ marginTop: "1rem" }}>
                    {usuarios.map((u) => (
                        <li key={u._id || u.id}>{u.email}</li>
                    ))}
                </ul>
            </section>

            <section className="section">
                <h3>Gráfico de tareas por proyecto</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={datosGrafico}>
                        <XAxis dataKey="nombre" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="tareas" fill="#00a3e0" />
                    </BarChart>
                </ResponsiveContainer>
            </section>
        </div>
    );
};

export default AdminPage;
