
import MisProyectos from "../../components/ListaProyectos/MisProyectos";
import BuscadorTareas from "../../components/ListaProyectos/BuscadorTareas";

const AsignacionProyecto = () => {
    return (
        <div className="container">
            <h2>Gestión de Proyectos</h2>
            <BuscadorTareas />
            <MisProyectos />
        </div>
    );
};

export default AsignacionProyecto;
