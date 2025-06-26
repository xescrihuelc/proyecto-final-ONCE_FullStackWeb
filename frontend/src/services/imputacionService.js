import { API_URL } from "../utils/config";

export const getImputacionesPorRango = async (userId, from, to) => {
    const url = `${API_URL}/tasks/hours?userId=${userId}&from=${from}&to=${to}`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`Error ${res.status}: ${msg}`);
        }
        return await res.json();
    } catch (err) {
        console.error("❌ Fallo en fetch de imputaciones:", url, err);
        return [];
    }
};

export const postImputacionesDistribuidas = async (imputaciones) => {
    const res = await fetch(`${API_URL}/hours`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imputaciones),
    });

    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Error al guardar imputaciones");
    }

    return await res.json();
};