const mongoose = require("mongoose");
const { Sesame } = require("../models/sesame.model");

// Utility to check if a string is in YYYY-MM-DD format
const isDateFormat = (dateStr) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
};

// Validation helper for required fields
const checkImportantField = (employeeIds, from, to) => {
  if (!employeeIds)
    return [false, "No 'employeeIds' (ObjectId) field received"];
  if (!Array.isArray(employeeIds))
    return [false, "'employeeIds' must be an array"];

  if (from && !isDateFormat(from)) {
    return [false, "Invalid 'from' format field (Date 'YYYY-MM-DD') received"];
  }

  if (to && !isDateFormat(to)) {
    return [false, "Invalid 'to' format field (Date 'YYYY-MM-DD') received"];
  }

  return [true];
};

// Normalize a date to 'YYYY-MM-DD'
const getDateString = (date) => new Date(date).toISOString().split("T")[0];

// Generate an array of date strings between two dates
const getDateRangeStrings = (from, to) => {
  const dates = [];
  const current = new Date(from);
  const end = new Date(to);

  while (current <= end) {
    dates.push(getDateString(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

// Main controller
const getWorkedDays = async (req, res) => {
  try {
    const { employeeIds, from, to, limit = 10, page = 1 } = req.body;

    const [isValid, errorMsg] = checkImportantField(employeeIds, from, to);
    if (!isValid) {
      return res.status(406).json({ error: errorMsg });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (isNaN(fromDate) || isNaN(toDate)) {
      return res
        .status(400)
        .json({ error: "Invalid date format. Use YYYY-MM-DD." });
    }

    // Pagination logic
    const total = employeeIds.length;
    const skip = (page - 1) * limit;
    const paginatedIds = employeeIds.slice(skip, skip + limit);
    const lastPage = Math.ceil(total / limit);

    const dateStrings = getDateRangeStrings(fromDate, toDate);

    // Fetch and format worked day data
    const data = await Promise.all(
      paginatedIds.map(async (employeeId) => {
        const sesameDoc = await Sesame.findOne({
          employeeId: { $regex: `^${employeeId}$`, $options: "i" },
        }).lean();

        const workedDaysMap = {};
        if (sesameDoc && Array.isArray(sesameDoc.days)) {
          for (const entry of sesameDoc.days) {
            const dateKey = getDateString(entry.date);
            workedDaysMap[dateKey] = entry.secondsWorked;
          }
        }

        const days = dateStrings.map((dateStr) => ({
          date: dateStr,
          secondsWorked: workedDaysMap[dateStr] || 0,
        }));

        return { employeeId, days };
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
    console.error("Error in getWorkedDays:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getWorkedDays };
