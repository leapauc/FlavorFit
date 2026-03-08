const express = require("express");
const {
  getAllRecipe,
  getRecipeById,
  getRecipeByPraticien,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getCategoryRecipe,
  getDifficultyLevel,
  getPriceLevel,
  getEcoscoreLevel,
  getAllInfoRecipeById,
  getFilteredRecipe,
  generateAutoRecipePlanning,
} = require("../controller/recipe.controller");

const router = express.Router();

// ROUTES STATIQUES
router.get("/category_recipe", getCategoryRecipe);
router.get("/difficulty", getDifficultyLevel);
router.get("/price", getPriceLevel);
router.get("/ecoscore", getEcoscoreLevel);
router.post("/filtered", getFilteredRecipe);
router.post("/auto_planning", generateAutoRecipePlanning);

// ROUTES DYNAMIQUES
router.get("/", getAllRecipe);
router.get("/:id_recipe", getRecipeById);
router.get("/:id_recipe/all_info_recipe", getAllInfoRecipeById);
router.get("/by_praticien/:id_praticien", getRecipeByPraticien);
router.post("", createRecipe);
router.put("/:id_recipe", updateRecipe);
router.delete("/:id_recipe", deleteRecipe);

module.exports = router;
