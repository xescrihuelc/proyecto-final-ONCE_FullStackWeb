const { Hours } = require("../models/hours.model");
const mongoose = require("mongoose");

// Utility to check if a string is in YYYY-MM-DD format
const isDateFormat = (dateStr) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
};

// Validation helper for getHours and similar
const checkImportantField = (userIds, date) => {
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

        const [ok, errMsg] = checkImportantField(userIds, date);
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
        let { userId, from, to } = req.query;

        if (!isDateFormat(from) || !isDateFormat(to)) {
            return res.status(400).json({
                error: "Missing or invalid parameters: from, to",
            });
        }

        // Si userId es vacío, no filtramos por usuario
        const filter = {
            date: { $gte: new Date(from), $lte: new Date(to) },
        };

        if (userId) {
            filter.userId = userId;
        }

        const records = await Hours.find(filter).lean();

        return res.json({ data: records });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const imputeHours = async (req, res) => {
    console.log(
        "📥 [controller] imputeHours payload:",
        JSON.stringify(req.body, null, 2)
    );
    try {
        const { date, userId, tasks } = req.body;

        if (
            !userId ||
            !isDateFormat(date) ||
            !Array.isArray(tasks) ||
            tasks.length === 0
        ) {
            return res.status(400).json({
                error: "Invalid input. 'userId', valid 'date', and non-empty 'tasks' array are required.",
            });
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
