import MisProyectos from "../../components/ListaProyectos/MisProyectos";
import BuscadorTareas from "../../components/ListaProyectos/BuscadorTareas";
import CrearProyecto from "../../components/ListaProyectos/CrearProyecto";

const AsignacionProyecto = () => {
    return (
        <div className="container">
            <h2>Gestión de Proyectos</h2>
            <BuscadorTareas />
            <MisProyectos />
            <CrearProyecto />
        </div>
    );
};

export default AsignacionProyecto;
