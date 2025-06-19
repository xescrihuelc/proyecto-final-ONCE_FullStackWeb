const express = require("express");
const router = express.Router();
const {
    createTemplate,
    patchTemplate,
    deleteTemplate,
    getTemplate,
} = require("../controllers/template.controller");

router.get("/", getTemplate);

router.post("/", createTemplate);

router.patch("/:id", patchTemplate);

router.delete("/:id", deleteTemplate);

module.exports = router;
