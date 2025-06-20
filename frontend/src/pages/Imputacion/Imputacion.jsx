// src/pages/Imputacion/Imputacion.jsx

import React, { useState, useEffect } from "react";
import BtnPrimary from "../../components/BtnPrimary/BtnPrimary";
import "./Imputacion.css";
import { useAuth } from "../../context/AuthContext";

export default function Imputacion() {
    const { user } = useAuth();
    const [fecha, setFecha] = useState("");
    const [proyecto, setProyecto] = useState("");
    const [actividad, setActividad] = useState("");
    const [horas, setHoras] = useState("");
    const [comentarios, setComentarios] = useState("");
    const [imputaciones, setImputaciones] = useState([]);

    useEffect(() => {
        const guardadas =
            JSON.parse(localStorage.getItem("imputaciones")) || [];
        setImputaciones(guardadas);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (horas > 7.5) {
            alert("No puedes imputar más de 7,5 horas por día.");
            return;
        }

        const nueva = {
            id: Date.now(),
            fecha,
            proyecto,
            actividad,
            horas: parseFloat(horas),
            comentarios,
            userId: user?.id,
            nombreUsuario: user?.nombre,
            timestamp: new Date().toISOString(),
        };

        const actualizadas = [...imputaciones, nueva];
        setImputaciones(actualizadas);
        localStorage.setItem("imputaciones", JSON.stringify(actualizadas));

        setFecha("");
        setProyecto("");
        setActividad("");
        setHoras("");
        setComentarios("");
    };

    return (
        <div className="imputacion-container">
            <section className="dashboard-header">
                <img
                    src="/LOGO_Ajuntament_VIC_AZUL con parentesis.png"
                    alt="Logo VIC"
                    className="dashboard-logo"
                />
            </section>

            <h2 className="imputacion-title">Imputación de horas</h2>
            <form onSubmit={handleSubmit} className="imputacion-form">
                <label className="imputacion-label">
                    Fecha:
                    <input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        required
                        className="imputacion-input"
                    />
                </label>
                <label className="imputacion-label">
                    Proyecto:
                    <input
                        type="text"
                        value={proyecto}
                        onChange={(e) => setProyecto(e.target.value)}
                        placeholder="Nombre del proyecto"
                        required
                        className="imputacion-input"
                    />
                </label>
                <label className="imputacion-label">
                    Actividad:
                    <input
                        type="text"
                        value={actividad}
                        onChange={(e) => setActividad(e.target.value)}
                        placeholder="Descripción actividad"
                        required
                        className="imputacion-input"
                    />
                </label>
                <label className="imputacion-label">
                    Horas:
                    <input
                        type="number"
                        value={horas}
                        onChange={(e) => setHoras(e.target.value)}
                        min="0"
                        max="7.5"
                        step="0.1"
                        required
                        className="imputacion-input"
                    />
                </label>
                <label className="imputacion-label">
                    Comentarios:
                    <textarea
                        value={comentarios}
                        onChange={(e) => setComentarios(e.target.value)}
                        placeholder="Opcional"
                        className="imputacion-textarea"
                    />
                </label>
                <BtnPrimary className="imputacion-btn">Guardar</BtnPrimary>
            </form>

            <section className="imputacion-resumen">
                <h3>Resumen de tus imputaciones (local)</h3>
                {imputaciones.length === 0 ? (
                    <p className="resumen-vacio">
                        No has registrado horas todavía.
                    </p>
                ) : (
                    <ul className="resumen-lista">
                        {imputaciones.map((i, idx) => (
                            <li key={idx}>
                                <strong>{i.fecha}</strong> – {i.proyecto} (
                                {i.horas} h)
                                <br />
                                <em>{i.actividad}</em>
                                {i.comentarios && <p>💬 {i.comentarios}</p>}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
