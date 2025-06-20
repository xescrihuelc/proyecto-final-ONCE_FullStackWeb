const mongoose = require("mongoose");
const { Schema } = mongoose;

const tasksSchema = new mongoose.Schema({
    _id: Schema.Types.ObjectId,
    estructura: { type: String, required: true },
    lineaTrabajo: { type: String, required: true },
    subnivel: { type: String, required: true },
    subtarea: String,
    isActive: {
        type: Boolean,
        default: true
    },
});

const Tasks = mongoose.model("Tasks", tasksSchema);

module.exports = { Tasks };


