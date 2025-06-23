// src/services/hourService.js
import { API_URL } from "../utils/config";

// POST: Crear un nuevo registro de horas
export const createHourRecord = async (registro) => {
    const res = await fetch(`${API_URL}/hours`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(registro),
    });

    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Error al guardar el registro de horas");
    }

    return await res.json(); // puedes devolver el registro creado si quieres
};
