// ===== Archivo: services/imputacionService.js =====

// src/services/imputacionService.js

export const getDiasHabiles = async (mes = "06", anio = "2025") => {
    // Datos simulados basados en el PDF que enviaste
    return [
        { fecha: "2025-06-03", dia: "Lunes", control: 1 },
        { fecha: "2025-06-04", dia: "Martes", control: 1 },
        { fecha: "2025-06-05", dia: "Miércoles", control: 1 },
        { fecha: "2025-06-06", dia: "Jueves", control: 1 },
        { fecha: "2025-06-07", dia: "Viernes", control: 0 }, // no trabajable
        { fecha: "2025-06-10", dia: "Lunes", control: 1 },
        // ...añade más simulados
    ];
};
