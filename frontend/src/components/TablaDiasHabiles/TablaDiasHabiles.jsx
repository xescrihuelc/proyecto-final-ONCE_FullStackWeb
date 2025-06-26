
import React, { useEffect, useState } from "react";
import { getDiasHabiles } from "../../services/imputacionService";
import "./TablaDiasHabiles.css";

const TablaDiasHabiles = () => {
    const [dias, setDias] = useState([]);
    const [registro, setRegistro] = useState({});

    useEffect(() => {
        const cargarDias = async () => {
            const data = await getDiasHabiles();
            setDias(data);
        };
        cargarDias();
    }, []);

    const handleChange = (fecha, valor) => {
        setRegistro({ ...registro, [fecha]: parseFloat(valor) });
    };

    const totalHoras = Object.values(registro).reduce((a, b) => a + b, 0);
    const horasObjetivo = dias.filter((d) => d.control === 1).length * 7.5;
    const progreso = Math.min((totalHoras / horasObjetivo) * 100, 100);

    return (
        <div className="tabla-horas-container">
            <h3>
                Horas imputadas: {totalHoras.toFixed(1)} / {horasObjetivo} h
            </h3>
            <div className="progreso-container">
                <div
                    className="progreso-barra"
                    style={{ width: `${progreso}%` }}
                />
            </div>
            <table className="tabla-horas">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Día</th>
                        <th>Horas</th>
                    </tr>
                </thead>
                <tbody>
                    {dias.map((d) => (
                        <tr
                            key={d.fecha}
                            className={d.control === 0 ? "inhabil" : ""}
                        >
                            <td>{d.fecha}</td>
                            <td>{d.dia}</td>
                            <td>
                                {d.control ? (
                                    <input
                                        type="number"
                                        step="0.25"
                                        min="0"
                                        max="7.5"
                                        value={registro[d.fecha] || ""}
                                        onChange={(e) =>
                                            handleChange(
                                                d.fecha,
                                                e.target.value
                                            )
                                        }
                                    />
                                ) : (
                                    <em>No laborable</em>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TablaDiasHabiles;
