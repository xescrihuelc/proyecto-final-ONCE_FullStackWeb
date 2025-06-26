const { Hours } = require("../models/hours.model");
const mongoose = require("mongoose");

/* Check functions */

// Utility to check if a string is in YYYY-MM-DD format
const isDateFormat = (dateStr) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
};

// Validation helper for getHours and similar
const check_getHoursFields = (userIds, date) => {
    if (!userIds) {
        return [false, "No 'userIds' provided"];
    }

    if (!Array.isArray(userIds)) {
        return [false, "'userIds' must be an array"];
    }

    if (!date) {
        return [false, "No 'date' provided"];
    }

    if (!isDateFormat(date)) {
        return [false, "Date must be in YYYY-MM-DD"];
    }

    return [true];
};

// Validation helper for getImputacionesPorUsuarioYRango and imputeHours
const validateFields = (obj, rules) => {
    for (const rule of rules) {
        const value = obj[rule.name];
        if (
            rule.required &&
            (value === undefined || value === null || value === "")
        ) {
            return [false, `Missing parameter: ${rule.name}`];
        }

        if (rule.type === "date" && value && !isDateFormat(value)) {
            return [false, `Invalid date format for: ${rule.name}`];
        }

        if (
            rule.type === "nonEmptyArray" &&
            (!Array.isArray(value) || value.length === 0)
        ) {
            return [false, `${rule.name} must be a non-empty array`];
        }
    }
    return [true];
};

/* Endpoints functions */

const getHours = async (req, res) => {
    try {
        const { userIds, date } = req.body;
        const dateProper = new Date(date);
        const normalizedDate = new Date(
            Date.UTC(
                dateProper.getUTCFullYear(),
                dateProper.getUTCMonth(),
                dateProper.getUTCDate()
            )
        );

        const [ok, errMsg] = check_getHoursFields(userIds, date);
        if (!ok) {
            return res.status(400).json({ error: errMsg });
        }

        const filter = {
            date: normalizedDate,
        };

        if (userIds.length > 0) {
            const objectUserIds = userIds.map(
                (id) => new mongoose.Types.ObjectId(id)
            );
            filter.userId = { $in: objectUserIds };
        }

        const records = await Hours.find(filter).lean();
        const result = {};
        for (const rec of records) {
            const userId = rec.userId.toString();
            if (!result[userId]) {
                result[userId] = {
                    userId: userId,
                    date: date,
                    tasks: [],
                };
            }
            result[userId].tasks.push({
                taskId: rec.taskId.toString(),
                hours: rec.hours,
            });
        }

        return res.json({ data: Object.values(result) });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const getImputacionesPorUsuarioYRango = async (req, res) => {
    try {
        const { userId, from, to } = req.query;

        const [ok, errMsg] = validateFields(req.query, [
            { name: "userId", required: true, type: "string" },
            { name: "from", required: true, type: "date" },
            { name: "to", required: true, type: "date" },
        ]);

        if (!ok) {
            return res.status(400).json({ error: errMsg });
        }

        const records = await Hours.find({
            userId,
            date: { $gte: new Date(from), $lte: new Date(to) },
        }).lean();

        return res.json({ data: records });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const imputeHours = async (req, res) => {
    try {
        const { date, userId, tasks } = req.body;

        const [ok, errMsg] = validateFields(req.body, [
            { name: "userId", required: true },
            { name: "date", required: true, type: "date" },
            { name: "tasks", required: true, type: "nonEmptyArray" },
        ]);

        if (!ok) {
            return res.status(400).json({ error: errMsg });
        }

        const dateProper = new Date(date);
        const normalizedDate = new Date(
            Date.UTC(
                dateProper.getUTCFullYear(),
                dateProper.getUTCMonth(),
                dateProper.getUTCDate()
            )
        );

        for (const task of tasks) {
            const { taskId, hours } = task;

            if (!taskId || typeof hours !== "number" || hours < 0) {
                return res.status(400).json({
                    error: "Each task must have a valid 'taskId' and non-negative 'hours'",
                });
            }

            await Hours.updateOne(
                { userId, taskId, date: normalizedDate },
                { $set: { hours } },
                { upsert: true }
            );
        }

        return res.status(200).json({ message: "Hours imputed successfully." });
    } catch (err) {
        console.error("Error imputing hours:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
};

module.exports = {
    getHours,
    getImputacionesPorUsuarioYRango,
    imputeHours,
};
