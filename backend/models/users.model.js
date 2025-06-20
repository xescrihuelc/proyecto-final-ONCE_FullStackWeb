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
    dailyHours: Number,
    isActive: Boolean,
    assignedTasks: {
        type: [Schema.Types.ObjectId],
    },
});

const Users = mongoose.model("Users", usersSchema);

module.exports = { Users };
