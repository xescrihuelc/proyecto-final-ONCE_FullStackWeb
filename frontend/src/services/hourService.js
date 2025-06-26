import { API_URL } from "../utils/config";

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

    return await res.json();  
};
