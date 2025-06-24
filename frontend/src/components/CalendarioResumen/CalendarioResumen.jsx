// src/components/CalendarioResumen/CalendarioResumen.jsx

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDiasSesame } from "../../services/sesameService";
import { getRangoDelPeriodo } from "../../utils/dateUtils";
import "./CalendarioResumen.css";

const diasSemana = ["D", "L", "M", "X", "J", "V", "S"];

export default function CalendarioResumen({ periodo = "mes" }) {
    const { user } = useAuth();
    const [diasMes, setDiasMes] = useState([]); // Array completo de días
    const [diasNoTrabajados, setDiasNoTrabajados] = useState(new Set()); // Set de fechas no trabajadas

    useEffect(() => {
        const cargarDias = async () => {
            const { from, to } = getRangoDelPeriodo(periodo);
            try {
                const dias = await getDiasSesame(
                    user.sesameEmployeeId,
                    from,
                    to
                );

                setDiasMes(dias);

                // Filtramos y guardamos en un Set para búsquedas O(1)
                const noTrabajados = new Set(
                    dias
                        .filter((d) => d.secondsWorked === 0)
                        .map((d) => d.date.split("T")[0]) // normaliza fecha a "YYYY-MM-DD"
                );
                setDiasNoTrabajados(noTrabajados);
            } catch (err) {
                console.error("Error al cargar calendario:", err);
            }
        };

        if (user?.sesameEmployeeId) {
            cargarDias();
        }
    }, [periodo, user]);

    return (
        <div className="calendario-resumen">
            <div className="cabecera">
                {diasSemana.map((d) => (
                    <span key={d} className="dia-semana">
                        {d}
                    </span>
                ))}
            </div>
            <div className="grilla">
                {diasMes.map((dia) => {
                    const fechaISO = dia.date.split("T")[0]; // "YYYY-MM-DD"
                    const numero = new Date(dia.date).getDate();
                    const esNoTrabajado = diasNoTrabajados.has(fechaISO);

                    return (
                        <div
                            key={dia.date}
                            className={`dia ${
                                esNoTrabajado ? "no-trabajado" : "trabajado"
                            }`}
                            title={
                                esNoTrabajado
                                    ? "No trabajado"
                                    : `Trabajado: ${dia.secondsWorked / 3600}h`
                            }
                        >
                            {numero}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
