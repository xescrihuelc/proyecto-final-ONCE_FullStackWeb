// src/services/hourService.js
import { API_URL } from "../utils/config";
import { getToken } from "./authService";

export const patchHourRecord = async (payload) => {
    console.log("💡 [hourService] PATCH /hours – payload:", payload);

    const res = await fetch(`${API_URL}/hours`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
    });

    console.log(`💡 [hourService] response status: ${res.status}`);
    let data;
    try {
        data = await res.json();
        console.log("💡 [hourService] response JSON:", data);
    } catch (parseErr) {
        console.warn("💡 [hourService] no JSON en la respuesta:", parseErr);
    }

    if (!res.ok) {
        const message = data?.error || `Error ${res.status}`;
        console.error("💥 [hourService] lanza error:", message);
        throw new Error(message);
    }

    return data;
};
