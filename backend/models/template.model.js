const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    userId: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unit: String,
    createdAt: { type: Date, default: Date.now },
});

const Template = mongoose.model("Template", templateSchema);

module.exports = { Template };
