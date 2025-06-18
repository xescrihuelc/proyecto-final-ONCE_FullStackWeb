const PORT = 8080;

const express = require("express");
const cors = require("cors");
const { dbConnection } = require("./db");
const { auth } = require("./middlewares/auth");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");

// const env = require("./config")

const recipesRoutes = require("./routes/recipes.routes");
const ingredientsRoutes = require("./routes/ingredients.routes");
const usersRoutes = require("./routes/users.routes");

const main = () => {
    const app = express();
    app.use(cors());
    app.use(express.json());
    // console.log("OpenAI: ", process.env.OPENAI_KEY);
    // console.log("OpenAI: ", process.env.OPENAI_KEY);

    app.use("/recipes", auth, recipesRoutes);
    app.use("/ingredients", auth, ingredientsRoutes);
    app.use("/", usersRoutes);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    dbConnection();

    app.listen(PORT, () => {
        console.log(`App listening on port ${PORT}`);
    });
};

main();
