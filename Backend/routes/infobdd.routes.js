const express = require("express");
const {
  getPathologies,
  getConvictions,
  getRestrictions,
  getIngredients,
  getFruitVegetableWeight,
  getMeatFishEggWeight,
} = require("../controller/infobdd.controller");

const router = express.Router();

router.get("/pathologies", getPathologies);
router.get("/convictions", getConvictions);
router.get("/restrictions", getRestrictions);
router.get("/ingredients", getIngredients);
router.get("/fruit_vegetable_weight", getFruitVegetableWeight);
router.get("/meat_fish_egg_weight", getMeatFishEggWeight);

module.exports = router;
