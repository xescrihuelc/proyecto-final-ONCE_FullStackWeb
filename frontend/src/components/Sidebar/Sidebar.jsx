import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <h2>Menú</h2>
      <ul>
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/imputacion" className={({ isActive }) => isActive ? 'active' : ''}>
            Imputación de horas
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
