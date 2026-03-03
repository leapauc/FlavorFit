const express = require("express");
const { firstPasswordEmail } = require("../controller/admin.controller");

const router = express.Router();

router.get("/:id_praticien/firstPassword", firstPasswordEmail);

module.exports = router;
