import { API_URL } from "../utils/config";

// Obtener días trabajados o ausencias simuladas desde Sesame
export const getDiasSesame = async (
    sesameEmployeeId,
    fechaInicio,
    fechaFin
) => {
    const res = await fetch(
        `${API_URL}/sesame/simulacion?employeeId=${sesameEmployeeId}&from=${fechaInicio}&to=${fechaFin}`
    );

    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Error al consultar días trabajados");
    }

    return await res.json(); // devuelve data.data[0].days
};
