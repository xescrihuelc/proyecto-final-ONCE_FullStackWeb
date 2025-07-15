const mongoose = require("mongoose");
const { Schema } = mongoose;

const fichajeSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  secondsWorked: { type: Number, required: true },
});

const sesameSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  employeeId: { type: String, required: true },
  days: {
    type: [fichajeSchema],
    default: [],
  },
});

const sesameUserSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  employeeId: { type: String, required: true },
  firstName: String,
  lastName: String,
  email: String,
  imageProfileURL: String,
  jobChargeName: String,
});

const Sesame = mongoose.model("Sesame", sesameSchema);
const SesameUser = mongoose.model("SesameUser", sesameUserSchema);

module.exports = { Sesame, SesameUser };
