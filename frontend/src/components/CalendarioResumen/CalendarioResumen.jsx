// src/components/CalendarioResumen/CalendarioResumen.jsx
import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
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
    getDay,
} from "date-fns";
import "./CalendarioResumen.css";

const diasSemana = ["L", "M", "X", "J", "V", "S", "D"];
const viewMap = { dia: "day", semana: "week", mes: "month" };
const buttonLabels = { dia: "Día", semana: "Semana", mes: "Mes" };

export default function CalendarioResumen({ periodo = "mes", onRangoChange }) {
    const { user } = useAuth();
    const [view, setView] = useState(periodo);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [diasSesame, setDiasSesame] = useState([]);

    // Cuando cambia el prop `periodo`, sincronizamos la vista interna
    useEffect(() => {
        setView(periodo);
    }, [periodo]);

    const engView = viewMap[view] || "month";

    // Calcula from/to según view y currentDate
    const rango = useMemo(() => {
        let from, to;
        if (engView === "day") {
            from = startOfDay(currentDate);
            to = endOfDay(currentDate);
        } else if (engView === "week") {
            from = startOfWeek(currentDate, { weekStartsOn: 1 });
            to = endOfWeek(currentDate, { weekStartsOn: 1 });
        } else {
            from = startOfMonth(currentDate);
            to = endOfMonth(currentDate);
        }
        // avisamos al padre
        onRangoChange &&
            onRangoChange({
                from: format(from, "yyyy-MM-dd"),
                to: format(to, "yyyy-MM-dd"),
            });
        return { from, to };
    }, [currentDate, engView, onRangoChange]);

    // Traer datos de Sesame para colorear la vista
    useEffect(() => {
        if (!user?.sesameEmployeeId) return;
        (async () => {
            const fromISO = format(rango.from, "yyyy-MM-dd");
            const toISO = format(rango.to, "yyyy-MM-dd");
            const dias = await getDiasSesame(
                user.sesameEmployeeId,
                fromISO,
                toISO
            );
            setDiasSesame(dias);
        })();
    }, [rango, user]);

    // Navegación
    const goPrev = () =>
        setCurrentDate((d) =>
            engView === "day"
                ? subDays(d, 1)
                : engView === "week"
                ? subWeeks(d, 1)
                : subMonths(d, 1)
        );
    const goNext = () =>
        setCurrentDate((d) =>
            engView === "day"
                ? addDays(d, 1)
                : engView === "week"
                ? addWeeks(d, 1)
                : addMonths(d, 1)
        );
    const goToday = () => setCurrentDate(new Date());

    // Generar array de celdas
    const diasParaRender = useMemo(() => {
        if (engView === "month") {
            const start = startOfMonth(currentDate);
            const end = endOfMonth(currentDate);
            const shift = (getDay(start) + 6) % 7;
            const blanks = Array.from({ length: shift }).map(() => null);
            const monthDays = [];
            let cursor = start;
            while (cursor <= end) {
                monthDays.push(new Date(cursor));
                cursor = addDays(cursor, 1);
            }
            return [...blanks, ...monthDays];
        } else {
            const days = [];
            let cursor = rango.from;
            while (cursor <= rango.to) {
                days.push(new Date(cursor));
                cursor = addDays(cursor, 1);
            }
            return days;
        }
    }, [currentDate, engView, rango]);

    return (
        <div className="calendario-resumen">
            <div className="calendario-header">
                <div className="controls">
                    <button onClick={goPrev}>←</button>
                    <button onClick={goToday}>Hoy</button>
                    <button onClick={goNext}>→</button>
                </div>
                <h3 className="titulo">
                    {engView === "day" &&
                        format(currentDate, "EEEE, d MMM yyyy")}
                    {engView === "week" &&
                        `${format(rango.from, "d MMM")} – ${format(
                            rango.to,
                            "d MMM yyyy"
                        )}`}
                    {engView === "month" && format(currentDate, "MMMM yyyy")}
                </h3>
                <div className="view-switch">
                    {Object.keys(viewMap).map((key) => (
                        <button
                            key={key}
                            className={view === key ? "active" : ""}
                            onClick={() => setView(key)}
                        >
                            {buttonLabels[key]}
                        </button>
                    ))}
                </div>
            </div>

            {engView !== "day" && (
                <div className="dias-semana">
                    {diasSemana.map((d, i) => (
                        <span key={i}>{d}</span>
                    ))}
                </div>
            )}

            <div
                className={`grilla ${
                    engView === "month" ? "grilla-mes" : "grilla-semana"
                }`}
            >
                {diasParaRender.map((day, idx) => {
                    if (!day) return <div key={idx} className="dia blank" />;
                    const iso = format(day, "yyyy-MM-dd");
                    const entry = diasSesame.find((d) =>
                        d.date.startsWith(iso)
                    );
                    const worked = entry && entry.secondsWorked > 0;
                    return (
                        <div
                            key={iso}
                            className={`dia ${
                                worked ? "trabajado" : "no-trabajado"
                            }`}
                            title={
                                worked
                                    ? `${(entry.secondsWorked / 3600).toFixed(
                                          2
                                      )}h`
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

CalendarioResumen.propTypes = {
    periodo: PropTypes.oneOf(["dia", "semana", "mes"]),
    onRangoChange: PropTypes.func,
};
