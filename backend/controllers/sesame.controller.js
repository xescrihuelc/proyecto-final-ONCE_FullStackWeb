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
          const isoDate = new Date(date).toISOString().split("T")[0];

          const matchedDay = sesameDoc?.days.find(
            (d) => new Date(d.date).toISOString().split("T")[0] === isoDate
          );

          days.push({
            date: isoDate,
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
        lastPage: lastPage,
        total: total,
        perPage: limit,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getWorkedDays };
