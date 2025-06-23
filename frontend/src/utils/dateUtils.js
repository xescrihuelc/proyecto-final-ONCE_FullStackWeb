// src/utils/dateUtils.js

/**
 * Devuelve el rango { from, to } para el periodo actual según el tipo.
 * @param {"dia"|"semana"|"mes"} periodo
 */
export function getRangoDelPeriodo(periodo = "mes") {
    const hoy = new Date();
    let from, to;

    switch (periodo) {
        case "dia":
            from = new Date(hoy);
            to = new Date(hoy);
            break;

        case "semana":
            const diaSemana = hoy.getDay(); // 0 (Domingo) - 6 (Sábado)
            const lunes = new Date(hoy);
            lunes.setDate(hoy.getDate() - ((diaSemana + 6) % 7)); // lunes de esta semana
            from = new Date(lunes);
            to = new Date(lunes);
            to.setDate(from.getDate() + 6); // domingo siguiente
            break;

        case "mes":
        default:
            from = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            to = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
            break;
    }

    return {
        from: from.toISOString().split("T")[0],
        to: to.toISOString().split("T")[0],
    };
}
