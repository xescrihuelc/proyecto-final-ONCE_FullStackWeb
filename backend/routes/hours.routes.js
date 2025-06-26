const express = require("express");
const router = express.Router();
const hoursController = require("../controllers/hours.controller");

router.get("/", hoursController.getHours);
router.get("/daterange", hoursController.getImputacionesPorUsuarioYRango);
router.patch("/", hoursController.imputeHours);

module.exports = router;
