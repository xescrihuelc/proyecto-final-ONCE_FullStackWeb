import { useEffect, useState } from "react";
import { getDiasSesame } from "../../services/sesameService";
import { getImputacionesPorRango } from "../../services/imputacionService";
import { useAuth } from "../../context/AuthContext";
import { getRangoDelPeriodo } from "../../utils/dateUtils";

export default function ResumenHoras({ periodo = "mes", onResumenCalculado }) {
    const { user, loading: authLoading } = useAuth();
    const [diasTrabajados, setDiasTrabajados] = useState(0);
    const [horasImputadas, setHorasImputadas] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                const { from, to } = getRangoDelPeriodo(periodo);

                const [diasResponse, imputaciones] = await Promise.all([
                    getDiasSesame(user.sesameEmployeeId, from, to),
                    getImputacionesPorRango(user.id, from, to),
                ]);

                console.log("DIAS RAW:", diasResponse);

                const dias = diasResponse || [];

                // ✅ Si tiene segundos trabajados, lo contamos como día hábil
                const diasHabiles = dias.filter((d) => d.secondsWorked > 0);

                // ✅ Usamos fallback si no viene dailyHours
                const dailyHours = user?.dailyHours ?? 7.5;

                const horasTotales = diasHabiles.length * dailyHours;
                const totalImputadas = imputaciones.reduce(
                    (acc, imp) => acc + imp.horas,
                    0
                );

                setDiasTrabajados(diasHabiles.length);
                setHorasImputadas(totalImputadas);

                onResumenCalculado?.({
                    diasTrabajados: diasHabiles.length,
                    horasTotales,
                    horasImputadas: totalImputadas,
                    horasRestantes: horasTotales - totalImputadas,
                });
            } catch (err) {
                console.error("Error al cargar resumen:", err);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && user?.id && user?.sesameEmployeeId) {
            console.log("USER EN RESUMEN:", user);
            cargarDatos();
        }
    }, [periodo, user, authLoading]);

    if (loading || authLoading) return <p>Cargando resumen...</p>;

    const dailyHours = user?.dailyHours ?? 7.5;
    const horasTotales = diasTrabajados * dailyHours;
    const horasRestantes = horasTotales - horasImputadas;

    return (
        <div className="resumen-horas">
            <p>
                <strong>Horas trabajadas este {periodo}:</strong> {horasTotales}
            </p>
            <p>
                <strong>Horas imputadas este {periodo}:</strong>{" "}
                {horasImputadas}
            </p>
            <p>
                <strong>Horas restantes por imputar:</strong> {horasRestantes}
            </p>
        </div>
    );
}
