import React from "react";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";

export default function Header({ onLogout }) {
  const { user } = useAuth();

  return (
    <header className="header">
      <h1>Imputación de Horas</h1>
      {user && <div className="header-user-info"></div>}
    </header>
  );
}
