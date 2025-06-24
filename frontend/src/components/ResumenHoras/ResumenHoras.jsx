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

                const dias = await getDiasSesame(
                    user.sesameEmployeeId,
                    from,
                    to
                );
                const imputaciones = await getImputacionesPorRango(
                    user.id,
                    from,
                    to
                );

                console.log("✅ Dias Sesame:", dias);
                console.log("✅ Imputaciones:", imputaciones);

                const diasHabiles = dias.filter((d) => d.secondsWorked > 0);
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

                console.log("✅ Resumen calculado con éxito");
            } catch (err) {
                console.error("❌ Error al cargar resumen:", err);
            } finally {
                setLoading(false);
            }
        };

        // 🛡️ Validaciones clave
        if (authLoading) return;
        if (!user) {
            console.warn("⛔ No hay usuario cargado aún");
            return;
        }
        if (!user.id) {
            console.warn("⛔ El usuario no tiene 'id'", user);
            return;
        }
        if (!user.sesameEmployeeId) {
            console.warn("⛔ El usuario no tiene 'sesameEmployeeId'", user);
            return;
        }

        console.log("🧩 Usuario listo en resumen:", user);
        cargarDatos();
    }, [periodo, user, authLoading]);

    const dailyHours = user?.dailyHours ?? 7.5;
    const horasTotales = diasTrabajados * dailyHours;
    const horasRestantes = horasTotales - horasImputadas;

    if (loading || authLoading) return <p>Cargando resumen...</p>;

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
