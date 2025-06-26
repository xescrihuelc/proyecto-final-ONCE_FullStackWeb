// src/services/imputacionService.js
import { API_URL } from "../utils/config";
import { getToken } from "./authService";

export const getImputacionesPorRango = async (userId, from, to) => {
    const url = `${API_URL}/tasks/hours?userId=${userId}&from=${from}&to=${to}`;
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Error ${res.status}: ${txt}`);
    }
    return res.json();
};

export const postImputacionesDistribuidas = async (imputaciones) => {
    const url = `${API_URL}/hours`;
    const res = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(imputaciones),
    });
    if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || `Error ${res.status}`);
    }
    return res.json();
};
