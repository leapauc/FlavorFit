const express = require("express");
const {
  getAllGroups,
  getAllIngredientForAGroup,
  getMeasuringContener,
  getIngredientUnitWeight,
  getAllDistinctIngredient,
} = require("../controller/ingredient.controller");

const router = express.Router();

router.get("/groups", getAllGroups);
router.get("/group/:alim_grp_nom_fr", getAllIngredientForAGroup);
router.get("/measuring_contener", getMeasuringContener);
router.get("/:id_ingredient/unit_weight", getIngredientUnitWeight);
router.get("/distinct_ingredient", getAllDistinctIngredient);

module.exports = router;
