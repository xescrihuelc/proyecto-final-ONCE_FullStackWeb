// src/components/ResumenHoras/ResumenHoras.jsx

import { useEffect, useState } from "react";
import { getDiasSesame } from "../../services/sesameService";
import { getImputacionesPorRango } from "../../services/imputacionService";
import { useAuth } from "../../context/AuthContext";
import { getRangoDelPeriodo } from "../../utils/dateUtils";

export default function ResumenHoras({ periodo = "mes", onResumenCalculado }) {
    const { user } = useAuth();
    const [diasTrabajados, setDiasTrabajados] = useState(0);
    const [horasImputadas, setHorasImputadas] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);

                const { from, to } = getRangoDelPeriodo(periodo);
                const [dias, imputaciones] = await Promise.all([
                    getDiasSesame(user.id, from, to),
                    getImputacionesPorRango(user.id, from, to),
                ]);

                const diasHabiles = dias.filter((d) => d.tipo === "WD"); // solo días trabajados
                const horasTotales = diasHabiles.length * user.dailyHours;
                const horasImputadas = imputaciones.reduce(
                    (acc, imp) => acc + imp.horas,
                    0
                );

                setDiasTrabajados(diasHabiles.length);
                setHorasImputadas(horasImputadas);

                onResumenCalculado?.({
                    diasTrabajados: diasHabiles.length,
                    horasTotales,
                    horasImputadas,
                    horasRestantes: horasTotales - horasImputadas,
                });
            } catch (err) {
                console.error("Error al cargar resumen:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            cargarDatos();
        }
    }, [periodo, user]);

    if (loading) return <p>Cargando resumen...</p>;

    const horasTotales = diasTrabajados * user.dailyHours;
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
