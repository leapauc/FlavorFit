const express = require("express");
const router = express.Router();
const mailController = require("../controller/mails.controller");

router.post("/send-planning-email", mailController.sendPlanningEmail);

module.exports = router;
