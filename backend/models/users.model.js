const mongoose = require("mongoose");
const { Schema } = mongoose;

const usersSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  name: { type: String, required: true },
  surnames: String,
  email: { type: String, required: true },
  password: { type: String, required: true },
  roles: {
    type: [String],
    enum: ["director", "admin", "user"],
    default: ["user"],
    required: true,
  },
  dailyHours: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sesameEmployeeId: {
    type: String,
    required: true,
  },
  imageProfileURL: String,
  jobChargeName: String,
  signature: {
    data: { type: Buffer }, // Store the image in binary format
    contentType: { type: String }, // Store the content type of the image as 'image/png', 'image/jpeg', etc...
  },
});

const Users = mongoose.model("Users", usersSchema);

module.exports = { Users };
