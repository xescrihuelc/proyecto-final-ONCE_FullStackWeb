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

    // Nuevo estado para búsqueda de proyectos
    const [busqueda, setBusqueda] = useState("");

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
            return alert("Proyecto inválido: nombre y al menos una tarea.");
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
            alert("No se pudo crear el proyecto.");
        }
    };

    const datosGrafico = proyectos.map((p) => ({
        nombre: p.nombre || p.estructura,
        tareas: Array.isArray(p.tareas) ? p.tareas.length : 0,
    }));

    // Filtrar proyectos según término de búsqueda (insensible a mayúsculas)
    const proyectosFiltrados = proyectos.filter((p) => {
        const nombreProyecto = (p.nombre || p.estructura).toLowerCase();
        return nombreProyecto.includes(busqueda.toLowerCase().trim());
    });

    return (
        <div className="container" id="start">
            <h2>Panel de Administración</h2>

            {/* Formulario: Añadir Nuevo Proyecto */}
            <section className="section">
                <h3>Añadir Nuevo Proyecto</h3>
                <div className="form-group">
                    <label>Nombre del proyecto</label>
                    <input
                        type="text"
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
                </div>
                <div className="form-group-inline">
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
                        />{" "}
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
                        />{" "}
                        Proyecto Activo
                    </label>
                </div>
                <div className="form-add-task">
                    <input
                        type="text"
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
                {nuevoProyecto.tareas.length > 0 && (
                    <ul className="task-list">
                        {nuevoProyecto.tareas.map((t) => (
                            <li key={t.id}>{t.nombre}</li>
                        ))}
                    </ul>
                )}
                <button className="btn-primary" onClick={guardarProyecto}>
                    Guardar Proyecto
                </button>
            </section>

            {/* Buscador de Proyectos existentes */}
            <section className="section">
                <h3>Proyectos existentes</h3>
                <input
                    type="text"
                    className="input-group search-input"
                    placeholder="Buscar proyectos..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
                {proyectosFiltrados.length === 0 ? (
                    <p>No hay proyectos que coincidan.</p>
                ) : (
                    proyectosFiltrados.map((p) => {
                        const subs =
                            Array.isArray(p.tareas) && p.tareas.length > 0
                                ? p.tareas.map((t) => t.nombre)
                                : p.subtarea
                                ? p.subtarea.split(",").map((s) => s.trim())
                                : ["(Sin subtarea)"];

                        return (
                            <div key={p._id || p.id} className="proyecto-item">
                                <strong>{p.nombre || p.estructura}</strong>{" "}
                                {p.lineaTrabajo === "Europeo" && (
                                    <span>🌍</span>
                                )}
                                {p.subnivel === "Inactivo" && (
                                    <em style={{ color: "gray" }}>
                                        (Inactivo)
                                    </em>
                                )}
                                <ul>
                                    {subs.map((subNombre, i) => (
                                        <li key={i}>
                                            {`${p.estructura} / ${p.subnivel} / ${subNombre}`}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })
                )}
            </section>

            {/* Gráfico de Tareas por Proyecto */}
            <section className="section" id="end">
                <h3>Gráfico: Tareas por Proyecto</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={datosGrafico}>
                        <XAxis dataKey="nombre" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="tareas" fill="#00a3e0" />
                    </BarChart>
                </ResponsiveContainer>
            </section>
        </div>
    );
};

export default AdminPage;
