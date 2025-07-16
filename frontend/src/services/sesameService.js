// src/services/sesameService.js

import { API_URL } from "../utils/config";

export const getDiasSesame = async (employeeId, from, to) => {
    const params = new URLSearchParams({
        employeeIds: employeeId,
        from,
        to,
    });

    const url = `${API_URL}/sesame/worked-absence-days?${params.toString()}`;
    const res = await fetch(url, {
        method: "GET",
    });

    if (!res.ok) {
        // Mejor manejo de error si no es JSON válido
        let errorText = await res.text();
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(
                errorJson.error || "Error al consultar días trabajados"
            );
        } catch {
            throw new Error(`Error al consultar días trabajados: ${errorText}`);
        }
    }

    const data = await res.json();
    console.log("RESPUESTA BRUTA DE /sesame:", data);

    return data.data[0]?.days || [];
};

export const getSesameUser = async (email) => {
    const params = new URLSearchParams({ email });
    const url = `${API_URL}/sesame/employees?${params.toString()}`;
    const res = await fetch(url, {
        method: "GET",
    });

    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Error al consultar usuario de Sesame");
    }

    const { data } = await res.json();
    console.log("RESPUESTA BRUTA DE /sesame employee:", data);

    // Return the first (and only) employee object
    return data[0] || null;
};
