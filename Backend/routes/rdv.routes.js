const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getOne,
  updateAppointment,
  deleteAppointment,
  getByPraticien,
  getByPatient,
} = require("../controller/rdv.controller");

// CRUD RDV
router.post("/", createAppointment);
router.get("/:id", getOne);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

// Listes
router.get("/praticien/:id_praticien", getByPraticien);
router.get("/patient/id_patient", getByPatient);

module.exports = router;
