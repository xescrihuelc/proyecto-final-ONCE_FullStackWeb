const mongoose = require("mongoose");
const { Sesame } = require("../models/sesame.model");

const isDateFormat = async (dateStr) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) {
    return false;
  } else {
    return true;
  }
};


const checkImportantField = async (employeeIds, from, to) => {
    let err_msg = new String();

    if (!employeeIds) {
        err_msg = "No 'employeeIds' (ObjectId) field recieved";
        return [false, err_msg];
    } else if (employeeIds.constructor !== Array) {
        err_msg = "'employeeIds' must be an array";
        return [false, err_msg];
    }

    if (from) {
      const isValidDate = await isDateFormat(from);

      if (!isValidDate) {
        err_msg = "Invalid 'from' format field (Date 'YYYY-MM-DD') recieved";
        return [false, err_msg];
      }
    }

    if (to) {
      const isValidDate = await isDateFormat(to);
      
      if (!isValidDate) {
        err_msg = "Invalid 'to' format field (Date 'YYYY-MM-DD') recieved";
        return [false, err_msg];
      }
    }

    return [true];
};

const getWorkedDays = async (req, res) => {
  try {
    const { employeeIds, from, to, limit = 10, page = 1 } = req.body;

    const areImportantFieldsPresent = await checkImportantField(employeeIds, from, to);
    

    if (areImportantFieldsPresent[0] == false) {
        return res.status(406).json({ error: `${areImportantFieldsPresent[1]}` });
    }

    const skip = (page - 1) * limit;
    const paginatedIds = employeeIds.slice(skip, skip + limit);

    // Validate required inputs
    if (
      !employeeIds ||
      !Array.isArray(employeeIds) ||
      employeeIds.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "employeeIds must be a non-empty array." });
    }
    if (!from || !to) {
      return res
        .status(400)
        .json({ error: "Both 'from' and 'to' dates are required." });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (isNaN(fromDate) || isNaN(toDate)) {
      return res
        .status(400)
        .json({ error: "Invalid date format. Use YYYY-MM-DD." });
    }

    // Paginate employee IDs
    const total = employeeIds.length;
    const skip = (page - 1) * limit;
    const paginatedIds = employeeIds.slice(skip, skip + limit);
    const lastPage = Math.ceil(total / limit);

    // Generate list of date strings in the range
    const daysInRange = [];
    for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
      daysInRange.push(new Date(d).toISOString().split("T")[0]);
    }

    // Fetch and format data
    const data = await Promise.all(
      paginatedIds.map(async (employeeId) => {
        const sesameDoc = await Sesame.findOne({ employeeId });

        // Build a lookup map for quick access
        const dayMap = {};
        if (sesameDoc?.days?.length) {
          for (const entry of sesameDoc.days) {
            const dateStr =
              typeof entry.date === "string"
                ? entry.date
                : new Date(entry.date).toISOString().split("T")[0];
            dayMap[dateStr] = entry.secondsWorked;
          }
        }

        // Create the final `days` array for this employee
        const days = daysInRange.map((date) => ({
          date,
          secondsWorked: dayMap[date] || 0,
        }));

        return {
          employeeId,
          days,
        };
      })
    );

    // Return the response
    return res.json({
      data,
      meta: {
        currentPage: page,
        lastPage: lastPage,
        total: total,
        perPage: limit,
      },
    });
  } catch (err) {
    console.error("Error in getWorkedDays:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getWorkedDays };
