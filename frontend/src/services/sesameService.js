// src/services/sesameService.js

import { API_URL } from "../utils/config";

// Petición POST con body, como espera el backend
export const getDiasSesame = async (employeeId, from, to) => {
    const res = await fetch(`${API_URL}/sesame/worked-absence-days`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            employeeIds: [employeeId],
            from,
            to,
        }),
    });

    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Error al consultar días trabajados");
    }

    const data = await res.json();
    console.log("RESPUESTA BRUTA DE /sesame:", data);
    // Extraer días desde la respuesta estructurada
    const dias = data.data[0]?.days || [];

    // Mapear tipo si tu backend no lo da
    return dias.map((d) => ({
        ...d,
        tipo: d.secondsWorked > 0 ? "WD" : "OA", // WD = trabajado, OA = otro/ausente
    }));
};
