const mongoose = require("mongoose");
const { Schema } = mongoose;

const signSchema = new mongoose.Schema({
    _id: Schema.Types.ObjectId,
    userId: { type: ObjectId, required: true },
    sign: {
        data: { type: Buffer, required: true }, // Store the image in binary format
        contentType: { type: String, required: true }, // Store the content type of the image as 'image/png', 'image/jpeg', etc...
    },
});

const Signs = mongoose.model("Signs", signSchema);

module.exports = { Signs };
