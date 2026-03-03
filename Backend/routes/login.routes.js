const express = require("express");
const { loginPraticien } = require("../controller/login.controller");

const router = express.Router();

router.post("/", loginPraticien);

module.exports = router;
