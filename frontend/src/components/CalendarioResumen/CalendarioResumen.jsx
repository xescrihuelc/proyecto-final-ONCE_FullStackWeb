// src/components/CalendarioResumen/CalendarioResumen.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDiasSesame } from "../../services/sesameService";
import {
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    addDays,
    subDays,
    addWeeks,
    subWeeks,
    addMonths,
    subMonths,
    format,
} from "date-fns";
import "./CalendarioResumen.css";

const diasSemana = ["L", "M", "X", "J", "V", "S", "D"];

export default function CalendarioResumen({ initialView = "month" }) {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState(initialView);
    const [diasMes, setDiasMes] = useState([]);

    const rango = useMemo(() => {
        if (view === "day")
            return { from: startOfDay(currentDate), to: endOfDay(currentDate) };
        if (view === "week")
            return {
                from: startOfWeek(currentDate, { weekStartsOn: 1 }),
                to: endOfWeek(currentDate, { weekStartsOn: 1 }),
            };
        return { from: startOfMonth(currentDate), to: endOfMonth(currentDate) };
    }, [currentDate, view]);

    useEffect(() => {
        if (!user?.sesameEmployeeId) return;
        (async () => {
            const fromISO = rango.from.toISOString().split("T")[0];
            const toISO = rango.to.toISOString().split("T")[0];
            const dias = await getDiasSesame(
                user.sesameEmployeeId,
                fromISO,
                toISO
            );
            setDiasMes(dias);
        })();
    }, [rango, user]);

    const goPrev = () =>
        setCurrentDate((d) =>
            view === "day"
                ? subDays(d, 1)
                : view === "week"
                ? subWeeks(d, 1)
                : subMonths(d, 1)
        );
    const goNext = () =>
        setCurrentDate((d) =>
            view === "day"
                ? addDays(d, 1)
                : view === "week"
                ? addWeeks(d, 1)
                : addMonths(d, 1)
        );
    const goToday = () => setCurrentDate(new Date());

    const diasParaRender = useMemo(() => {
        const days = [];
        let cursor = new Date(rango.from);
        while (cursor <= rango.to) {
            days.push(new Date(cursor));
            cursor = addDays(cursor, 1);
        }
        return days;
    }, [rango]);

    return (
        <div className="calendario-resumen">
            <div className="calendario-header">
                <div className="controls">
                    <button onClick={goPrev}>←</button>
                    <button onClick={goToday}>Hoy</button>
                    <button onClick={goNext}>→</button>
                </div>
                <h3 className="titulo">
                    {view === "day" && format(currentDate, "EEEE, d MMM yyyy")}
                    {view === "week" &&
                        `${format(rango.from, "d MMM")} – ${format(
                            rango.to,
                            "d MMM yyyy"
                        )}`}
                    {view === "month" && format(currentDate, "MMMM yyyy")}
                </h3>
                <div className="view-switch">
                    {["day", "week", "month"].map((v) => (
                        <button
                            key={v}
                            className={view === v ? "active" : ""}
                            onClick={() => setView(v)}
                        >
                            {v === "day"
                                ? "Día"
                                : v === "week"
                                ? "Semana"
                                : "Mes"}
                        </button>
                    ))}
                </div>
            </div>

            {view !== "day" && (
                <div className="dias-semana">
                    {diasSemana.map((d, i) => (
                        <span key={i}>{d}</span>
                    ))}
                </div>
            )}

            <div className="grilla">
                {diasParaRender.map((day) => {
                    const iso = day.toISOString().split("T")[0];
                    const entry = diasMes.find((d) => d.date.startsWith(iso));
                    const trabajado = entry && entry.secondsWorked > 0;
                    return (
                        <div
                            key={iso}
                            className={`dia ${
                                trabajado ? "trabajado" : "no-trabajado"
                            }`}
                            title={
                                trabajado
                                    ? `${entry.secondsWorked / 3600}h`
                                    : "No trabajado"
                            }
                        >
                            {format(day, "d")}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
