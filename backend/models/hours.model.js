const mongoose = require("mongoose");
const { Schema } = mongoose;

const hoursSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  userId: { type: Schema.Types.ObjectId, required: true, ref: "Users" },
  taskId: { type: Schema.Types.ObjectId, required: true, ref: "Tasks" },
  date: { type: Date, required: true },
  hours: Number,
});

const Hours = mongoose.model("Hours", hoursSchema);

module.exports = { Hours };
