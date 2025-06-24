// src/pages/Imputacion/VistaImputacion.jsx

import React, { useState } from "react";
import CalendarioResumen from "../../components/CalendarioResumen/CalendarioResumen";
import ResumenHoras from "../../components/ResumenHoras/ResumenHoras";
import FormularioImputacionConReparto from "../../components/FormularioImputacionConReparto/FormularioImputacionConReparto";
import { useAuth } from "../../context/AuthContext";
import "./VistaImputacion.css";

export default function VistaImputacion() {
    const { user, loading } = useAuth();
    const [resumen, setResumen] = useState(null);

    if (loading || !user) {
        return <p>Cargando resumen...</p>;
    }

    return (
        <div className="vista-imputacion-container">
            <h2>Panel de Imputación de Horas</h2>

            {/* Calendario visual de los días del mes */}
            <CalendarioResumen periodo="mes" />

            {/* Resumen de horas del usuario para el periodo */}
            <ResumenHoras
                periodo="mes"
                onResumenCalculado={(resumenData) => setResumen(resumenData)}
            />

            {/* Formulario de imputación avanzado */}
            {resumen && <FormularioImputacionConReparto resumen={resumen} />}
        </div>
    );
}
