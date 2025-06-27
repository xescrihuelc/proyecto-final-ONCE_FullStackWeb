// src/pages/ImputacionHoras.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getImputacionesPorRango } from "../../services/imputacionService";
import { getDiasSesame } from "../../services/sesameService";
import { getAllTasks } from "../../services/taskService";
import { getAllUsers } from "../../services/userService";
import { getRangoDelPeriodo } from "../../utils/dateUtils";
import FormularioImputacionConReparto from "../FormularioImputacionConReparto/FormularioImputacionConReparto";
import "./ImputacionHoras.css";

export default function ImputacionHoras() {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user.roles.includes("admin");

  const [activeUserId, setActiveUserId] = useState(user.id);
  const [allUsers, setAllUsers] = useState([]);

  const [proyectos, setProyectos] = useState([]);
  const [resumen, setResumen] = useState({
    userId: user.id,
    diasTrabajados: 0,
    horasTotales: 0,
    horasImputadas: 0,
    fechasTrabajadas: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    getAllUsers()
      .then(setAllUsers)
      .catch((err) => console.error(err));
  }, [isAdmin]);

  useEffect(() => {
    getAllTasks()
      .then(setProyectos)
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (authLoading || !activeUserId || !user.sesameEmployeeId) return;
    setIsLoading(true);
    (async () => {
      const { from, to } = getRangoDelPeriodo("mes");
      const [diasData, horasData] = await Promise.all([
        getDiasSesame(user.sesameEmployeeId, from, to),
        getImputacionesPorRango(activeUserId, from, to),
      ]);
      const diasConTrabajo = diasData.filter((d) => d.secondsWorked > 0);
      const fechas = diasConTrabajo.map((d) => d.date.slice(0, 10));
      const sumaHoras = horasData.reduce((sum, r) => sum + r.hours, 0);
      const totalHoras = fechas.length * (user.dailyHours ?? 7.5);

      setResumen({
        userId: activeUserId,
        diasTrabajados: fechas.length,
        horasTotales: totalHoras,
        horasImputadas: sumaHoras,
        fechasTrabajadas: fechas,
      });
      setIsLoading(false);
    })();
  }, [authLoading, activeUserId, user]);

  if (authLoading) return <p>Cargando usuario…</p>;

  return (
    <div className="imputacion-container">
      <h2>Imputación de Horas</h2>

      {isAdmin && (
        <div className="user-filter">
          <label htmlFor="userSelect">Usuario:</label>
          <select
            id="userSelect"
            value={activeUserId}
            onChange={(e) => setActiveUserId(e.target.value)}
          >
            <option value="">— Selecciona usuario —</option>
            {allUsers.map((u) => (
              <option key={u._id} value={u._id}>
                {u.nombre} ({u.email})
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoading ? (
        <p>Cargando datos…</p>
      ) : (
        <>
          <div className="resumen-horas">
            <p>
              <strong>Días trabajados:</strong> {resumen.diasTrabajados}
            </p>
            <p>
              <strong>Horas totales:</strong> {resumen.horasTotales.toFixed(2)}h
            </p>
            <p>
              <strong>Horas imputadas:</strong>{" "}
              {resumen.horasImputadas.toFixed(2)}h
            </p>
            <p>
              <strong>Horas restantes:</strong>{" "}
              {(resumen.horasTotales - resumen.horasImputadas).toFixed(2)}h
            </p>
          </div>

          <FormularioImputacionConReparto
            resumen={resumen}
            tareas={proyectos}
            onSaved={() => setActiveUserId((id) => id)}
          />
        </>
      )}
    </div>
  );
}
