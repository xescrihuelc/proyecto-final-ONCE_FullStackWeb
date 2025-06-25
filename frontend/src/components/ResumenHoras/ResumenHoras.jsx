// src/components/ResumenHoras/ResumenHoras.jsx
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../../context/AuthContext";
import { getDiasSesame } from "../../services/sesameService";
import { getImputacionesPorRango } from "../../services/imputacionService";
import { getRangoDelPeriodo } from "../../utils/dateUtils";

export default function ResumenHoras({ periodo = "mes", onResumenCalculado }) {
    const { user, loading: authLoading } = useAuth();
    const [diasTrabajados, setDiasTrabajados] = useState(0);
    const [horasTotales, setHorasTotales] = useState(0);
    const [horasImputadas, setHorasImputadas] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function cargarResumen() {
            setLoading(true);
            try {
                const { from, to } = getRangoDelPeriodo(periodo);
                const diasData = await getDiasSesame(
                    user.sesameEmployeeId,
                    from,
                    to
                );
                const imputaciones = await getImputacionesPorRango(
                    user.id,
                    from,
                    to
                );

                const diasHabiles = diasData.filter(
                    (d) => d.secondsWorked > 0
                ).length;
                const dailyHours = user.dailyHours ?? 7.5;
                const totales = diasHabiles * dailyHours;
                const totalImputadas = imputaciones.reduce(
                    (sum, imp) => sum + (imp.hours ?? 0),
                    0
                );

                setDiasTrabajados(diasHabiles);
                setHorasTotales(totales);
                setHorasImputadas(totalImputadas);

                onResumenCalculado?.({
                    diasTrabajados: diasHabiles,
                    horasTotales: totales,
                    horasImputadas: totalImputadas,
                    horasRestantes: totales - totalImputadas,
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
        // <-- QUITAMOS onResumenCalculado de aquí:
    }, [periodo, user, authLoading]);

    if (loading || authLoading) {
        return <p>Cargando resumen de {periodo}...</p>;
    }

    const horasRestantes = horasTotales - horasImputadas;
    const labels = { dia: "hoy", semana: "esta semana", mes: "este mes" };
    const label = labels[periodo] || periodo;

    return (
        <div className="resumen-horas">
            <p>
                <strong>Días trabajados {label}:</strong> {diasTrabajados}
            </p>
            <p>
                <strong>Horas totales {label}:</strong>{" "}
                {horasTotales.toFixed(2)}h
            </p>
            <p>
                <strong>Horas imputadas {label}:</strong>{" "}
                {horasImputadas.toFixed(2)}h
            </p>
            <p>
                <strong>Horas restantes {label}:</strong>{" "}
                {horasRestantes.toFixed(2)}h
            </p>
        </div>
    );
}

ResumenHoras.propTypes = {
    periodo: PropTypes.oneOf(["dia", "semana", "mes"]).isRequired,
    onResumenCalculado: PropTypes.func,
};
