const mongoose = require("mongoose");
const { MONGO_URI } = require("./config");

// Conexión a la db de Mongo
const dbConnection = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("BBDD conectada con exito");
    } catch (error) {
        console.error(error);
        throw new Error("Error al conectarse a la base de datos");
    }
};

module.exports = { dbConnection };
