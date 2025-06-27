// src/components/CalendarioResumen/CalendarioResumen.jsx
import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import PropTypes from "prop-types";
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDiasSesame } from "../../services/sesameService";
import "./CalendarioResumen.css";

const diasSemana = ["L", "M", "X", "J", "V", "S", "D"];
const viewMap = { dia: "day", semana: "week", mes: "month" };

export default function CalendarioResumen({
  periodo,
  onRangoChange,
  selectedUser,
}) {
  const { user } = useAuth();
  if (!selectedUser) {
    selectedUser = user;
  }

  const [view, setView] = useState(periodo);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [diasMes, setDiasMes] = useState([]);

  useEffect(() => {
    setView(periodo);
  }, [periodo]);

  const engView = viewMap[view] || "month";

  const computeRango = (viewType, date) => {
    if (viewType === "day") {
      return { from: startOfDay(date), to: endOfDay(date) };
    }
    if (viewType === "week") {
      return {
        from: startOfWeek(date, { weekStartsOn: 1 }),
        to: endOfWeek(date, { weekStartsOn: 1 }),
      };
    }
    return {
      from: startOfMonth(date),
      to: endOfMonth(date),
    };
  };

  const reportRango = ({ from, to }) => {
    onRangoChange({
      from: format(from, "yyyy-MM-dd"),
      to: format(to, "yyyy-MM-dd"),
    });
  };

  const goPrev = () => {
    setCurrentDate((d) => {
      const next =
        engView === "day"
          ? subDays(d, 1)
          : engView === "week"
          ? subWeeks(d, 1)
          : subMonths(d, 1);
      reportRango(computeRango(engView, next));
      return next;
    });
  };
  const goNext = () => {
    setCurrentDate((d) => {
      const next =
        engView === "day"
          ? addDays(d, 1)
          : engView === "week"
          ? addWeeks(d, 1)
          : addMonths(d, 1);
      reportRango(computeRango(engView, next));
      return next;
    });
  };
  const goToday = () => {
    const today = new Date();
    setCurrentDate(today);
    reportRango(computeRango(engView, today));
  };

  useEffect(() => {
    const { from, to } = computeRango(engView, currentDate);
    if (!selectedUser?.sesameEmployeeId) return;
    (async () => {
      const dias = await getDiasSesame(
        selectedUser.sesameEmployeeId,
        format(from, "yyyy-MM-dd"),
        format(to, "yyyy-MM-dd")
      );
      setDiasMes(dias);
    })();
  }, [engView, currentDate, user, selectedUser]);

  const diasParaRender = useMemo(() => {
    if (engView === "month") {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const shift = (getDay(start) + 6) % 7;
      const blanks = Array.from({ length: shift }).map(() => null);
      const days = [];
      let cursor = start;
      while (cursor <= end) {
        days.push(new Date(cursor));
        cursor = addDays(cursor, 1);
      }
      return [...blanks, ...days];
    }
    const { from, to } = computeRango(engView, currentDate);
    const days = [];
    let cursor = from;
    while (cursor <= to) {
      days.push(new Date(cursor));
      cursor = addDays(cursor, 1);
    }
    return days;
  }, [engView, currentDate]);

  return (
    <div className="calendario-resumen">
      <div className="calendario-header">
        <div className="controls">
          <button onClick={goPrev}>←</button>
          <button onClick={goToday}>Hoy</button>
          <button onClick={goNext}>→</button>
        </div>

        <h3 className="titulo">
          {engView === "day" && format(currentDate, "EEEE, d MMM yyyy")}
          {engView === "week" &&
            (() => {
              const { from, to } = computeRango("week", currentDate);
              return `${format(from, "d MMM")} – ${format(to, "d MMM yyyy")}`;
            })()}
          {engView === "month" && format(currentDate, "MMMM yyyy")}
        </h3>
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
          const entry = diasMes.find((d) => d.date.startsWith(iso));
          const worked = entry && entry.secondsWorked > 0;
          return (
            <div
              key={iso}
              className={`dia ${worked ? "trabajado" : "no-trabajado"}`}
              title={
                worked
                  ? `${(entry.secondsWorked / 3600).toFixed(2)}h`
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
  periodo: PropTypes.oneOf(["dia", "semana", "mes"]).isRequired,
  onRangoChange: PropTypes.func.isRequired,
  selectedUser: PropTypes.func.isRequired,
};
