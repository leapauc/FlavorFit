const express = require("express");
const router = express.Router();
const { generatedPDF } = require("../controller/pdf.controller");

// CRUD RDV
router.post("/generate", generatedPDF);

module.exports = router;
