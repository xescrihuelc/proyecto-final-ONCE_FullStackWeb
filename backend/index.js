const PORT = 8080;

const express = require("express");
const cors = require("cors");
const { dbConnection } = require("./db");
// const { auth } = require("./middlewares/auth");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");

const templateRoutes = require("./routes/template.routes");

const main = () => {
    const app = express();
    app.use(cors());
    app.use(express.json());
    console.log("Mongo URL: ", process.env.MONGO_URI);

    // app.use("/ingredients", auth, templateRoutes);
    app.use("/", templateRoutes);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    dbConnection();

    app.listen(PORT, () => {
        console.log(`App listening on port ${PORT}`);
    });
};

main();
