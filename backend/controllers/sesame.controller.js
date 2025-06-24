const mongoose = require("mongoose");
const { Sesame } = require("../models/sesame.model");

const getWorkedDays = async (req, res) => {
    try {
        const { employeeIds, from, to, limit = 10, page = 1 } = req.body;

        const skip = (page - 1) * limit;
        const paginatedIds = employeeIds.slice(skip, skip + limit);

        const fromDate = new Date(from);
        const toDate = new Date(to);

        const total = employeeIds.length;
        const lastPage = Math.ceil(total / limit);

        const data = await Promise.all(
            paginatedIds.map(async (employeeId) => {
                const sesameDoc = await Sesame.findOne({ employeeId });

                const days = [];

                for (
                    let date = new Date(fromDate);
                    date <= toDate;
                    date.setDate(date.getDate() + 1)
                ) {
                    const currentDate = new Date(date);

                    // Comparación robusta por año, mes y día
                    const matchedDay = sesameDoc?.days.find((d) => {
                        const dDate = new Date(d.date);
                        return (
                            dDate.getFullYear() === currentDate.getFullYear() &&
                            dDate.getMonth() === currentDate.getMonth() &&
                            dDate.getDate() === currentDate.getDate()
                        );
                    });

                    days.push({
                        date: currentDate.toISOString().split("T")[0],
                        secondsWorked: matchedDay?.secondsWorked || 0,
                    });
                }

                return {
                    employeeId,
                    days,
                };
            })
        );

        return res.json({
            data,
            meta: {
                currentPage: page,
                lastPage,
                total,
                perPage: limit,
            },
        });
    } catch (err) {
        console.error("❌ Error en getWorkedDays:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { getWorkedDays };
