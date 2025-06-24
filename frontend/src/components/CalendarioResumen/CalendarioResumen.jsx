// src/components/CalendarioResumen/CalendarioResumen.jsx

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDiasSesame } from "../../services/sesameService";
import { getRangoDelPeriodo } from "../../utils/dateUtils";
import "./CalendarioResumen.css";

const diasSemana = ["D", "L", "M", "X", "J", "V", "S"];

export default function CalendarioResumen({ periodo = "mes" }) {
    const { user } = useAuth();
    const [diasMes, setDiasMes] = useState([]);
    const [diasNoTrabajados, setDiasNoTrabajados] = useState([]);

    useEffect(() => {
        const cargarDias = async () => {
            const { from, to } = getRangoDelPeriodo(periodo);
            try {
                const respuesta = await getDiasSesame(
                    user.sesameEmployeeId,
                    from,
                    to
                );
                const dias = await getDiasSesame(
                    user.sesameEmployeeId,
                    from,
                    to
                );

                setDiasMes(dias);

                const noTrabajados = dias
                    .filter((d) => d.tipo !== "WD")
                    .map((d) => d.date);
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
                    const fecha = new Date(dia.date);
                    const numero = fecha.getDate();
                    const esNoTrabajado = !dia.tipo || dia.tipo !== "WD";

                    return (
                        <div
                            key={dia.date}
                            className={`dia ${
                                esNoTrabajado ? "no-trabajado" : "trabajado"
                            }`}
                            title={dia.tipo}
                        >
                            {numero}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
