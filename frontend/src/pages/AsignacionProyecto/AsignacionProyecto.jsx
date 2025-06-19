// ===== Archivo: pages/AsignacionProyecto/AsignacionProyecto.jsx =====

import ListaProyectos from "../../components/ListaProyectos/ListaProyectos";
import MisProyectos from "../../components/ListaProyectos/MisProyectos";

const AsignacionProyecto = () => {
    return (
        <div className="container">
            <h2>Gestión de Proyectos</h2>
            <ListaProyectos />
            <MisProyectos />
        </div>
    );
};

export default AsignacionProyecto;
