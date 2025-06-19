// ===== Archivo: main.jsx =====

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ProyectoProvider } from "./context/ProyectoContext";

ReactDOM.createRoot(document.getElementById("root")).render(
    //<React.StrictMode>
    <AuthProvider>
        <ProyectoProvider>
            <App />
        </ProyectoProvider>
    </AuthProvider>
    //</React.StrictMode>
);
