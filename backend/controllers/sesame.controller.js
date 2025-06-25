// backend/controllers/sesame.controller.js

const { Sesame } = require("../models/sesame.model");

// Utility to check if a string is in YYYY-MM-DD format
const isDateFormat = (dateStr) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
};

// Validation helper for required fields
const checkImportantField = (employeeIds, from, to) => {
    if (!employeeIds) {
        return [false, "No 'employeeIds' provided"];
    }
    if (!Array.isArray(employeeIds)) {
        return [false, "'employeeIds' must be an array"];
    }
    if (!isDateFormat(from) || !isDateFormat(to)) {
        return [false, "Dates must be in YYYY-MM-DD"];
    }
    return [true];
};

const getWorkedDays = async (req, res) => {
    try {
        const { employeeIds, from, to, limit = 10, page = 1 } = req.body;

        // Validaciones básicas
        const [ok, errMsg] = checkImportantField(employeeIds, from, to);
        if (!ok) {
            return res.status(400).json({ error: errMsg });
        }

        const skip = (page - 1) * limit;
        const paginatedIds = employeeIds.slice(skip, skip + limit);
        const fromDate = new Date(from);
        const toDate = new Date(to);

        const total = employeeIds.length;
        const lastPage = Math.ceil(total / limit);

        const data = await Promise.all(
            paginatedIds.map(async (employeeId) => {
                const sesameDoc = await Sesame.findOne({ employeeId });
                const days =
                    sesameDoc?.days.filter((d) => {
                        const dDate = new Date(d.date);
                        return dDate >= fromDate && dDate <= toDate;
                    }) || [];
                return { employeeId, days };
            })
        );

        res.json({
            data,
            meta: { currentPage: page, lastPage, total, perPage: limit },
        });
    } catch (err) {
        console.error("❌ Error en getWorkedDays:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { getWorkedDays };
