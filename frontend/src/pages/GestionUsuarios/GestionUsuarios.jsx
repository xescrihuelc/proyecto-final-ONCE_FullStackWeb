import { useEffect, useState } from "react";
import "./GestionUsuarios.css";

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    // Puedes reemplazar esto por una llamada real a tu backend/API
    const usuariosFalsos = [
      { id: 1, nombre: "Rubén", email: "ruben@example.com", rol: "admin" },
      { id: 2, nombre: "Jere", email: "jere@example.com", rol: "manager" },
      { id: 3, nombre: "Bernat", email: "bernat@example.com", rol: "trabajador" },
    ];
    setUsuarios(usuariosFalsos);
  }, []);

  return (
    <div className="gestion-usuarios">
      <h1>Gestión de Usuarios</h1>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.nombre}</td>
              <td>{usuario.email}</td>
              <td>{usuario.rol}</td>
              <td>
                <button onClick={() => alert(`Editar ${usuario.nombre}`)}>Editar</button>
                <button onClick={() => alert(`Eliminar ${usuario.nombre}`)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
