// ===== Archivo: components/BtnPrimary/BtnPrimary.jsx =====

import React from "react";
import "./BtnPrimary.css";

export default function BtnPrimary({ children, onClick, disabled }) {
    return (
        <button className="btn-primary" onClick={onClick} disabled={disabled}>
            {children}
        </button>
    );
}
