const express = require("express");
const router = express.Router();
const sesameController = require("../controllers/sesame.controller");

router.get("/employees", sesameController.getSesameUser);
router.post("/worked-absence-days", sesameController.getWorkedDays);
router.get("/worked-absence-days", sesameController.getWorkedDays);
module.exports = router;
