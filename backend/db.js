// backend/db.js
const mongoose = require("mongoose");
const { MONGO_URI } = require("./config-local");
const dbConnection = async () => {
  try {
    await mongoose.connect(MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log("✅ Conectado a MongoDB:", MONGO_URI);
  } catch (err) {
    console.error("❌ Error conectando a MongoDB:", err);
    throw err;
  }
};

module.exports = { dbConnection };
