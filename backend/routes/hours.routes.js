const express = require("express");
const router = express.Router();
const hoursController = require("../controllers/hours.controller");

router.get("/", hoursController.getHours);
router.get("/", hoursController.getImputacionesPorUsuarioYRango);

module.exports = router;
