const express = require("express");
const {
  getAllPlanningPatientById,
  getPlanningByIdPatientById,
  getPlanningDetailsById,
  createPlanningPatientById,
  updatePlanningById,
  deletePlanningById,
  generateShoppingList,
} = require("../controller/planning.controller");

const router = express.Router();

/* ===========================
   ROUTES SPÉCIFIQUES D'ABORD
=========================== */

router.get("/:id_planning/details", getPlanningDetailsById);
router.post("/recipe/shopping_list", generateShoppingList);

router.get("/:id_patient/:id_planning", getPlanningByIdPatientById);

router.get("/:id_patient", getAllPlanningPatientById);

/* ===========================
   CRUD
=========================== */

router.post("/:id_patient", createPlanningPatientById);

router.put("/:id_planning", updatePlanningById);

router.delete("/:id_planning", deletePlanningById);

module.exports = router;
