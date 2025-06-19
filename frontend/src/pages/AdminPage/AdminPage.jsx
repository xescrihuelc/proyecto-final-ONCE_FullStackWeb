import { useState, useContext } from "react";
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
const proyectosIniciales = [
    {
        id: 1,
        nombre: "Proyecto A",
        tareas: [
            { id: 1, nombre: "Diseño", maxHoras: 7.5 },
            { id: 2, nombre: "Desarrollo", maxHoras: 7.5 },
        ],
    },
];

const usuariosIniciales = [
    { id: 1, nombre: "Juan Pérez", email: "juan@mail.com" },
];

const AdminPage = () => {
    const { proyectos, setProyectos } = useContext(ProyectoContext);
    const [usuarios, setUsuarios] = useState(usuariosIniciales);
    const [nuevoProyecto, setNuevoProyecto] = useState({
        nombre: "",
        tareas: [],
    });
    const [nuevaTarea, setNuevaTarea] = useState({ nombre: "" });
    const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: "", email: "" });
    const [proyectoEditado, setProyectoEditado] = useState(null);

    const agregarTarea = (p, setP) => {
        if (!nuevaTarea.nombre.trim())
            return alert("La tarea debe tener un nombre");
        setP({
            ...p,
            tareas: [...p.tareas, { ...nuevaTarea, id: Date.now() }],
        });
        setNuevaTarea({ nombre: "" });
    };

    const guardarProyecto = (p, setP) => {
        if (!p.nombre.trim()) return alert("El proyecto debe tener un nombre");
        if (p.tareas.length === 0) return alert("Añade al menos una tarea");

        if (proyectoEditado) {
            setProyectos(proyectos.map((pr) => (pr.id === p.id ? p : pr)));
            setProyectoEditado(null);
        } else {
            setProyectos([...proyectos, { ...p, id: Date.now() }]);
            setNuevoProyecto({ nombre: "", tareas: [] });
        }
    };

    const borrarProyecto = (id) => {
        if (window.confirm("¿Seguro que quieres borrar este proyecto?")) {
            setProyectos(proyectos.filter((p) => p.id !== id));
            if (proyectoEditado?.id === id) setProyectoEditado(null);
        }
    };

    const borrarTarea = (id, p, setP) =>
        setP({ ...p, tareas: p.tareas.filter((t) => t.id !== id) });

    const agregarUsuario = () => {
        if (!nuevoUsuario.nombre.trim() || !nuevoUsuario.email.trim())
            return alert("Completa nombre y email del usuario");
        setUsuarios([...usuarios, { ...nuevoUsuario, id: Date.now() }]);
        setNuevoUsuario({ nombre: "", email: "" });
    };

    const datosGrafico = proyectos.map((p) => ({
        nombre: p.nombre,
        tareas: p.tareas.length,
    }));

    const proyectoActual = proyectoEditado || nuevoProyecto;
    const setProyectoActual = proyectoEditado
        ? setProyectoEditado
        : setNuevoProyecto;

    return (
        <div className="container">
            <h2>Panel de Administración</h2>

            <section
                className={`section ${proyectoEditado ? "section--edit" : ""}`}
            >
                <h3>
                    {proyectoEditado
                        ? `Editar Proyecto: ${proyectoEditado.nombre}`
                        : "Añadir Nuevo Proyecto"}
                </h3>
                <input
                    className="input-group"
                    placeholder="Nombre del proyecto"
                    value={proyectoActual.nombre}
                    onChange={(e) =>
                        setProyectoActual({
                            ...proyectoActual,
                            nombre: e.target.value,
                        })
                    }
                />
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
                    <button
                        onClick={() =>
                            agregarTarea(proyectoActual, setProyectoActual)
                        }
                    >
                        Añadir tarea
                    </button>
                </div>
                <ul>
                    {proyectoActual.tareas.map((t) => (
                        <li key={t.id}>
                            {t.nombre}
                            {proyectoEditado && (
                                <button
                                    className="delete"
                                    onClick={() =>
                                        borrarTarea(
                                            t.id,
                                            proyectoActual,
                                            setProyectoActual
                                        )
                                    }
                                >
                                    X
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
                <button
                    onClick={() =>
                        guardarProyecto(proyectoActual, setProyectoActual)
                    }
                    style={{ marginRight: 10 }}
                >
                    {proyectoEditado ? "Guardar Cambios" : "Guardar Proyecto"}
                </button>
                {proyectoEditado && (
                    <button onClick={() => setProyectoEditado(null)}>
                        Cancelar
                    </button>
                )}
            </section>

            <section className="section">
                <h3>Proyectos existentes</h3>
                {proyectos.length === 0 ? (
                    <p>No hay proyectos.</p>
                ) : (
                    proyectos.map((p) => (
                        <div key={p.id} className="proyecto-item">
                            <strong>{p.nombre}</strong>
                            <button
                                className="edit"
                                onClick={() => setProyectoEditado({ ...p })}
                                style={{ marginLeft: 10 }}
                            >
                                Editar
                            </button>
                            <button
                                className="delete"
                                onClick={() => borrarProyecto(p.id)}
                                style={{ marginLeft: 10 }}
                            >
                                Borrar
                            </button>
                            <ul>
                                {p.tareas.map((t) => (
                                    <li key={t.id}>{t.nombre}</li>
                                ))}
                            </ul>
                        </div>
                    ))
                )}
            </section>

            <section className="section">
                <h3>Gestión de Usuarios</h3>
                <input
                    className="input-inline"
                    placeholder="Nombre del usuario"
                    value={nuevoUsuario.nombre}
                    onChange={(e) =>
                        setNuevoUsuario({
                            ...nuevoUsuario,
                            nombre: e.target.value,
                        })
                    }
                />
                <input
                    className="input-inline"
                    placeholder="Email del usuario"
                    type="email"
                    value={nuevoUsuario.email}
                    onChange={(e) =>
                        setNuevoUsuario({
                            ...nuevoUsuario,
                            email: e.target.value,
                        })
                    }
                />
                <button onClick={agregarUsuario}>Añadir Usuario</button>
                <ul style={{ marginTop: 20 }}>
                    {usuarios.map((u) => (
                        <li key={u.id}>
                            {u.nombre} - {u.email}
                        </li>
                    ))}
                </ul>
            </section>

            <section className="section" style={{ marginTop: 40 }}>
                <h3>Gráfico: Número de tareas por proyecto</h3>
                {proyectos.length === 0 ? (
                    <p>No hay proyectos para mostrar.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={datosGrafico}
                            margin={{ top: 20, bottom: 20 }}
                        >
                            <XAxis dataKey="nombre" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="tareas" fill="#f90" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </section>
        </div>
    );
};

export default AdminPage;
