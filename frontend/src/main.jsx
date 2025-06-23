// ===== Archivo: main.jsx =====

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProyectoProvider } from "./context/ProyectoContext";

const Root = () => {
    const { loading } = useAuth();

    if (loading) return <div>Cargando usuario...</div>;

    return (
        <ProyectoProvider>
            <App />
        </ProyectoProvider>
    );
};

ReactDOM.createRoot(document.getElementById("root")).render(
    //<React.StrictMode>
    <AuthProvider>
        <Root />
    </AuthProvider>
    //</React.StrictMode>
);
