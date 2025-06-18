const express = require("express");
const router = express.Router();
const {
    createIngredient,
    patchIngredient,
    deleteIngredient,
    getIngredient,
} = require("../controllers/ingredient.controller");

router.get("/", getIngredient);

router.post("/", createIngredient);

router.patch("/:id", patchIngredient);

router.delete("/:id", deleteIngredient);

module.exports = router;
