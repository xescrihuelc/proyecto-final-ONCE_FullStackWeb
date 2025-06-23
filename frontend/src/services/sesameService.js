import { API_URL } from "../utils/config";

export const getDiasSesame = async (employeeId, from, to) => {
    const res = await fetch(
        `${API_URL}/sesame/simulacion?employeeId=${employeeId}&from=${from}&to=${to}`
    );
    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Error al consultar días trabajados");
    }

    return await res.json();
};
