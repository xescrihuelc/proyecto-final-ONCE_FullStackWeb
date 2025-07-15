const mongoose = require("mongoose");
const { Schema } = mongoose;

const signatureSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  userId: { type: ObjectId, required: true },
  signature: {
    data: { type: Buffer, required: true }, // Store the image in binary format
    contentType: { type: String, required: true }, // Store the content type of the image as 'image/png', 'image/jpeg', etc...
  },
});

const Signatures = mongoose.model("Signatures", signatureSchema);

module.exports = { Signatures };
