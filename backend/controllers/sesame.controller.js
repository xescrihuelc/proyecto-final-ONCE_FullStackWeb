// backend/controllers/sesame.controller.js

const { Sesame, SesameUser } = require("../models/sesame.model");

// Utility to check if a string is in YYYY-MM-DD format
const isDateFormat = (dateStr) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
};

// Validation helper for required fields
const checkImportantField = (employeeIds, from, to) => {
  if (!employeeIds) {
    return [false, "No 'employeeIds' provided"];
  }
  if (
    !Array.isArray(employeeIds) ||
    employeeIds.some((id) => typeof id !== "string")
  ) {
    return [false, "'employeeIds' must be an array of strings"];
  }
  if (!isDateFormat(from) || !isDateFormat(to)) {
    return [false, "Dates must be in YYYY-MM-DD"];
  }
  return [true];
};

const getWorkedDays = async (req, res) => {
  try {
    // Extract all parameters from query string
    const {
      employeeIds: rawEmployeeIds,
      from: rawFrom,
      to: rawTo,
      limit: rawLimit = "10",
      page: rawPage = "1",
    } = req.query;

    // Parse and decode employeeIds
    if (!rawEmployeeIds) {
      return res
        .status(400)
        .json({ error: "'employeeIds' query parameter is required" });
    }
    let employeeIds;
    if (Array.isArray(rawEmployeeIds)) {
      employeeIds = rawEmployeeIds;
    } else if (typeof rawEmployeeIds === "string") {
      try {
        const decoded = decodeURIComponent(rawEmployeeIds);
        // Support comma-separated values
        employeeIds = decoded
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id);
      } catch (e) {
        return res
          .status(400)
          .json({ error: "'employeeIds' could not be decoded" });
      }
    } else {
      return res
        .status(400)
        .json({ error: "'employeeIds' must be a string or array of strings" });
    }

    // Decode dates
    if (!rawFrom || !rawTo) {
      return res
        .status(400)
        .json({ error: "'from' and 'to' query parameters are required" });
    }
    let from = rawFrom;
    let to = rawTo;
    try {
      from = decodeURIComponent(rawFrom);
      to = decodeURIComponent(rawTo);
    } catch (e) {
      return res
        .status(400)
        .json({ error: "'from' or 'to' could not be decoded" });
    }

    // Parse pagination
    const limit = parseInt(rawLimit, 10);
    const page = parseInt(rawPage, 10);
    if (isNaN(limit) || limit <= 0 || isNaN(page) || page <= 0) {
      return res
        .status(400)
        .json({ error: "'limit' and 'page' must be positive integers" });
    }

    // Basic validations
    const [ok, errMsg] = checkImportantField(employeeIds, from, to);
    if (!ok) {
      return res.status(400).json({ error: errMsg });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (fromDate > toDate) {
      return res
        .status(400)
        .json({ error: "'from' must be before or equal to 'to'" });
    }

    // Pagination logic
    const total = employeeIds.length;
    const lastPage = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginatedIds = employeeIds.slice(skip, skip + limit);

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

const getSesameUser = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res
        .status(400)
        .json({ error: "'email' query parameter is required" });
    }
    if (Array.isArray(email)) {
      return res.status(400).json({ error: "'email' must be a single string" });
    }

    let decodedEmail;
    try {
      decodedEmail = decodeURIComponent(email);
    } catch (e) {
      return res.status(400).json({ error: "'email' could not be decoded" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(decodedEmail)) {
      return res
        .status(400)
        .json({ error: "'email' must be a valid email address" });
    }

    const user = await SesameUser.findOne({ email: decodedEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const formattedUser = {
      id: user.id || user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      imageProfileURL: user.imageProfileURL,
      jobChargeName: user.jobChargeName,
    };

    res.json({
      data: [formattedUser],
      meta: {
        currentPage: 1,
        lastPage: 1,
        total: 1,
        perPage: 1,
      },
    });
  } catch (err) {
    console.error("❌ Error en getSesameUser:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getWorkedDays, getSesameUser };
