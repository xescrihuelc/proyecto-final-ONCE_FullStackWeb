const mongoose = require("mongoose");
const { Schema } = mongoose;

// Sub-schema for storing an image blob and its MIME type
const signatureSchema = new Schema(
  {
    data: Buffer, // Binary image data
    contentType: String, // MIME type, e.g. 'image/png'
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    surnames: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: { type: [String], default: [] },
    dailyHours: { type: Number, default: 0 },
    sesameEmployeeId: { type: String, required: true },
    imageProfileURL: String,
    jobChargeName: String,
    isActive: { type: Boolean, default: true },
    // Signature field: always present as an object, may hold image blob
    signature: {
      type: signatureSchema,
      default: {},
    },
  },
  { timestamps: true }
);

const Users = mongoose.model("Users", userSchema);

module.exports = { Users };
