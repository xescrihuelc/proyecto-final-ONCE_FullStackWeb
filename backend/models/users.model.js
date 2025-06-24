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
    enum: ["admin", "user"],
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
});

const Users = mongoose.model("Users", usersSchema);

module.exports = { Users };
