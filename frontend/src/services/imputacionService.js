// src/services/imputacionService.js

import { API_URL } from "../utils/config";

// Obtener días trabajados desde Sesame
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

    return await res.json();
};

// Obtener imputaciones del backend por usuario y rango
export const getImputacionesPorRango = async (userId, from, to) => {
    const res = await fetch(
        `${API_URL}/hours?userId=${userId}&from=${from}&to=${to}`
    );
    if (!res.ok) throw new Error("Error al obtener imputaciones");
    return await res.json();
};

// POST: Guardar varias imputaciones distribuidas
export const postImputacionesDistribuidas = async (imputaciones) => {
    const res = await fetch(`${API_URL}/hours`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(imputaciones),
    });

    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Error al guardar imputaciones");
    }

    return await res.json(); // devuelve las imputaciones guardadas
};
