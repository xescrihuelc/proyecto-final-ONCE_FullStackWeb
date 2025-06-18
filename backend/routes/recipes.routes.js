const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    // Encontrar una receta a partir de
    // los ingredientes guardados
    // Nombre - Ingredientes - Procedimiento
    // {[]}
    res.send("Get all recipes");
});

module.exports = router;
