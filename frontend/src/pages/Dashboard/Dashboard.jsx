// ===== Archivo: pages/Dashboard/Dashboard.jsx =====

// src/pages/Dashboard/Dashboard.jsx
import React from "react";
import "./Dashboard.css";

const Dashboard = () => {
    return (
        <main className="dashboard-container">
            <section className="dashboard-header">
                <img
                    src="/LOGO_Ajuntament_VIC_AZUL con parentesis.png"
                    alt="Logo VIC"
                    className="dashboard-logo"
                />
            </section>
            <div className="dashboard-header">
                <h1 className="dashboard-title">
                    Panel de Control - Equipo VIC
                </h1>
            </div>

            <section className="dashboard-welcome">
                <p>
                    Bienvenido a la plataforma de gestión y automatización de
                    imputación de horas en proyectos europeos.
                </p>
                <p>
                    Aquí podrás ver un resumen rápido de tu actividad, estado de
                    proyectos y notificaciones importantes.
                </p>
            </section>

            <section className="dashboard-cards">
                <div className="card">
                    <h2>Horas imputadas</h2>
                    <p className="card-value">120 h</p>
                </div>
                <div className="card">
                    <h2>Proyectos activos</h2>
                    <p className="card-value">5</p>
                </div>
                <div className="card">
                    <h2>Notificaciones</h2>
                    <p className="card-value">3 nuevas</p>
                </div>
            </section>
        </main>
    );
};

export default Dashboard;
