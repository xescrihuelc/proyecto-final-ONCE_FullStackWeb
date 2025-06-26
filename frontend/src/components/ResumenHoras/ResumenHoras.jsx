import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../../context/AuthContext";
import { getDiasSesame } from "../../services/sesameService";
import { getImputacionesPorRango } from "../../services/imputacionService";
import { getRangoDelPeriodo } from "../../utils/dateUtils";

export default function ResumenHoras({ periodo = "mes", onResumenCalculado }) {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function cargarResumen() {
            setLoading(true);
            try {
                const { from, to } = getRangoDelPeriodo(periodo);

                // A) Días trabajados (Sesame)
                const diasData = await getDiasSesame(
                    user.sesameEmployeeId,
                    from,
                    to
                );
                const trabajados = diasData.filter((d) => d.secondsWorked > 0);
                const fechasTrabajadas = trabajados.map((d) =>
                    d.date.slice(0, 10)
                );

                // B) Imputaciones existentes
                const imputaciones = await getImputacionesPorRango(
                    user.id,
                    from,
                    to
                );

                // Cálculo
                const dailyHours = user.dailyHours ?? 7.5;
                const horasTotales = trabajados.length * dailyHours;
                const horasImputadas = imputaciones.reduce(
                    (sum, r) => sum + (r.hours || 0),
                    0
                );

                // Avisamos al padre con todos los datos
                onResumenCalculado?.({
                    userId: user.id,
                    diasTrabajados: trabajados.length,
                    horasTotales,
                    horasImputadas,
                    fechasTrabajadas,
                });
            } catch (err) {
                console.error("Error al cargar resumen:", err);
            } finally {
                setLoading(false);
            }
        }

        if (!authLoading && user?.id && user?.sesameEmployeeId) {
            cargarResumen();
        }
    }, [periodo, user, authLoading, onResumenCalculado]);

    if (loading || authLoading) {
        return <p>Cargando resumen de {periodo}…</p>;
    }

    // (En este componente la visualización queda a cargo de VistaImputacion)
    return null;
}

ResumenHoras.propTypes = {
    periodo: PropTypes.oneOf(["dia", "semana", "mes"]).isRequired,
    onResumenCalculado: PropTypes.func.isRequired,
};
