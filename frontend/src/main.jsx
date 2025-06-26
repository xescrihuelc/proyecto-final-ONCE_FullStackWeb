// ===== main.jsx corregido =====
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ProyectoProvider } from "./context/ProyectoContext";

ReactDOM.createRoot(document.getElementById("root")).render(
    <AuthProvider>
        <ProyectoProvider>
            <App />
        </ProyectoProvider>
    </AuthProvider>
);
