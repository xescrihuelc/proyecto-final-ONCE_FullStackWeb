const PORT = 8080;

const express = require("express");
const cors = require("cors");
const { dbConnection } = require("./db");
// const { auth } = require("./middlewares/auth");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");

const tasksRoutes = require("./routes/tasks.routes");
const usersRoutes = require("./routes/users.routes");
const sesameRoutes = require("./routes/sesame.routes");
const hoursRoutes = require("./routes/hours.routes");

const main = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // app.use("/template", auth, templateRoutes);
  app.use("/tasks", tasksRoutes);
  app.use("/users", usersRoutes);
  app.use("/hours", hoursRoutes);
  app.use("/sesame", sesameRoutes);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  dbConnection();

  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
};

main();
