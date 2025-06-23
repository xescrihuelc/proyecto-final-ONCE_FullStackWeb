// src/pages/Imputacion/VistaImputacion.jsx

import React, { useState } from "react";
import CalendarioResumen from "../../components/CalendarioResumen/CalendarioResumen";
import ResumenHoras from "../../components/ResumenHoras/ResumenHoras";
import FormularioImputacionConReparto from "../../components/FormularioImputacionConReparto/FormularioImputacionConReparto"; // lo crearemos enseguida
import "./VistaImputacion.css"; // puedes crear un estilo limpio si quieres

export default function VistaImputacion() {
    const [resumen, setResumen] = useState(null);

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
