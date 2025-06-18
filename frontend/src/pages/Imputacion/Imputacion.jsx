import React, { useState } from 'react';
import BtnPrimary from '../../components/BtnPrimary/BtnPrimary';
import './Imputacion.css';

export default function Imputacion() {
  const [fecha, setFecha] = useState('');
  const [proyecto, setProyecto] = useState('');
  const [actividad, setActividad] = useState('');
  const [horas, setHoras] = useState('');
  const [comentarios, setComentarios] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    alert(`Horas imputadas: ${horas} en proyecto ${proyecto} el ${fecha}`);
    setFecha('');
    setProyecto('');
    setActividad('');
    setHoras('');
    setComentarios('');
  };

  return (
    <div className="imputacion-container">
     <section className="dashboard-header">
    <img src="/LOGO_Ajuntament_VIC_AZUL con parentesis.png" alt="Logo VIC" className="dashboard-logo" />
    </section>
      <h2 className="imputacion-title">Imputación de horas</h2>
      <form onSubmit={handleSubmit} className="imputacion-form">
        <label className="imputacion-label">
          Fecha:
          <input
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            required
            className="imputacion-input"
          />
        </label>
        <label className="imputacion-label">
          Proyecto:
          <input
            type="text"
            value={proyecto}
            onChange={e => setProyecto(e.target.value)}
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
            onChange={e => setActividad(e.target.value)}
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
            onChange={e => setHoras(e.target.value)}
            min="0"
            step="0.1"
            required
            className="imputacion-input"
          />
        </label>
        <label className="imputacion-label">
          Comentarios:
          <textarea
            value={comentarios}
            onChange={e => setComentarios(e.target.value)}
            placeholder="Opcional"
            className="imputacion-textarea"
          />
        </label>
        <BtnPrimary className="imputacion-btn">Guardar</BtnPrimary>
      </form>
    </div>
  );
}
