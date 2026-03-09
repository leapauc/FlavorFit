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
/**
 * @swagger
 * /recipes/category_recipe:
 *   get:
 *     summary: Liste des catégories de recettes
 */
router.get("/category_recipe", getCategoryRecipe);
/**
 * @swagger
 * /recipes/difficulty:
 *   get:
 *     summary: Liste des niveaux de difficulté
 */
router.get("/difficulty", getDifficultyLevel);
/**
 * @swagger
 * /recipes/price:
 *   get:
 *     summary: Liste des niveaux de prix
 */
router.get("/price", getPriceLevel);
/**
 * @swagger
 * /recipes/ecoscore:
 *   get:
 *     summary: Liste des niveaux d'ecoscore
 */
router.get("/ecoscore", getEcoscoreLevel);

/**
 * @swagger
 * /recipes/filtered:
 *   post:
 *     summary: Filtrer les recettes selon ingrédients exclus
 *     tags:
 *       - Recettes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               excludedIngredients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["tomate", "lait"]
 *     responses:
 *       200:
 *         description: Recettes filtrées
 */
router.post("/filtered", getFilteredRecipe);

/**
 * @swagger
 * /recipes/auto_planning:
 *   post:
 *     summary: Génère un planning automatique de recettes
 *     tags:
 *       - Recettes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               excludedIngredients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["tomate", "lait"]
 *               mealsToPlan:
 *                 type: object
 *                 example:
 *                   monday:
 *                     breakfast: true
 *                     lunch: true
 *                     dinner: true
 *                   tuesday:
 *                     breakfast: true
 *                     lunch: true
 *                     dinner: false
 *     responses:
 *       200:
 *         description: Planning généré
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post("/auto_planning", generateAutoRecipePlanning);

// ROUTES DYNAMIQUES
/**
 * @swagger
 * /recipes:
 *   get:
 *     summary: Récupère toutes les recettes
 *     description: Renvoie la liste complète des recettes enregistrées.
 *     tags:
 *       - Recettes
 *     responses:
 *       200:
 *         description: Liste des recettes récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_recipe:
 *                     type: integer
 *                     example: 1
 *                   title:
 *                     type: string
 *                     example: "Lasagnes maison"
 *                   categorie:
 *                     type: string
 *                     example: "Viande"
 *                   created_by:
 *                     type: integer
 *                     example: 3
 *                   difficulty:
 *                     type: string
 *                     example: "moyenne"
 *                   price:
 *                     type: string
 *                     example: "moyen"
 *                   ecoscore:
 *                     type: string
 *                     example: "B"
 *                   time_prepa:
 *                     type: integer
 *                     example: 45
 *                   proportion:
 *                     type: integer
 *                     example: 4
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur serveur"
 */
router.get("/", getAllRecipe);

/**
 * @swagger
 * /recipes/{id_recipe}:
 *   get:
 *     summary: Récupère une recette par ID
 *     tags:
 *       - Recettes
 *     parameters:
 *       - in: path
 *         name: id_recipe
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Recette trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_recipe:
 *                   type: integer
 *                   example: 1
 *                 title:
 *                   type: string
 *                   example: "Lasagnes maison"
 *                 categorie:
 *                   type: string
 *                   example: "Viande"
 *                 created_by:
 *                   type: integer
 *                   example: 3
 *                 difficulty:
 *                   type: string
 *                   example: "moyenne"
 *                 price:
 *                   type: string
 *                   example: "moyen"
 *                 ecoscore:
 *                   type: string
 *                   example: "B"
 *                 time_prepa:
 *                   type: integer
 *                   example: 45
 *                 proportion:
 *                   type: integer
 *                   example: 4
 *       404:
 *         description: Recette non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Recette non trouvée"
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id_recipe", getRecipeById);

/**
 * @swagger
 * /recipes/{id_recipe}/all_info_recipe:
 *   get:
 *     summary: Récupère tous les détails d'une recette
 *     description: Inclut ingrédients, nutrition, description et informations du créateur.
 *     tags:
 *       - Recettes
 *     parameters:
 *       - in: path
 *         name: id_recipe
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Détails de la recette récupérés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_praticien:
 *                   type: integer
 *                   example: 3
 *                 title:
 *                   type: string
 *                   example: "Lasagnes maison"
 *                 categorie:
 *                   type: string
 *                   example: "Viande"
 *                 servings:
 *                   type: integer
 *                   example: 4
 *                 prepTime:
 *                   type: integer
 *                   example: 45
 *                 difficulty:
 *                   type: string
 *                   example: "moyenne"
 *                 price:
 *                   type: string
 *                   example: "moyen"
 *                 ecoscore:
 *                   type: string
 *                   example: "B"
 *                 kcal:
 *                   type: number
 *                   example: 450
 *                 proteine:
 *                   type: number
 *                   example: 35
 *                 lipide:
 *                   type: number
 *                   example: 20
 *                 glucide:
 *                   type: number
 *                   example: 40
 *                 sugar:
 *                   type: number
 *                   example: 8
 *                 fiber:
 *                   type: number
 *                   example: 5
 *                 salt:
 *                   type: number
 *                   example: 2
 *                 ag:
 *                   type: number
 *                   example: 8
 *                 cholesterol:
 *                   type: number
 *                   example: 50
 *                 url:
 *                   type: string
 *                   example: "https://exemple.com/lasagnes"
 *                 description:
 *                   type: string
 *                   example: "Recette familiale traditionnelle"
 *                 ingredients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Boeuf haché"
 *                       quantity:
 *                         type: number
 *                         example: 300
 *                       unit:
 *                         type: string
 *                         example: "g"
 *                       alim_grp_nom_fr:
 *                         type: string
 *                         example: "Viande"
 *                       alim_ssgrp_nom_fr:
 *                         type: string
 *                         example: "Boeuf"
 *       404:
 *         description: Recette non trouvée
 */
router.get("/:id_recipe/all_info_recipe", getAllInfoRecipeById);

/**
 * @swagger
 * /recipes/by_praticien/{id_praticien}:
 *   get:
 *     summary: Récupère toutes les recettes d'un praticien
 *     description: Renvoie toutes les recettes créées par un praticien donné.
 *     tags:
 *       - Recettes
 *     parameters:
 *       - in: path
 *         name: id_praticien
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du praticien
 *         example: 3
 *     responses:
 *       200:
 *         description: Recettes récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_recipe:
 *                     type: integer
 *                     example: 1
 *                   title:
 *                     type: string
 *                     example: "Lasagnes maison"
 *                   categorie:
 *                     type: string
 *                     example: "Viande"
 *                   created_by:
 *                     type: integer
 *                     example: 3
 *                   difficulty:
 *                     type: string
 *                     example: "moyenne"
 *                   price:
 *                     type: string
 *                     example: "moyen"
 *                   ecoscore:
 *                     type: string
 *                     example: "B"
 *                   time_prepa:
 *                     type: integer
 *                     example: 45
 *                   proportion:
 *                     type: integer
 *                     example: 4
 *       404:
 *         description: Aucune recette trouvée pour ce praticien
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Aucune recette trouvée"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur serveur"
 */
router.get("/by_praticien/:id_praticien", getRecipeByPraticien);

/**
 * @swagger
 * /recipes:
 *   post:
 *     summary: Crée une nouvelle recette
 *     tags:
 *       - Recettes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_praticien
 *               - title
 *               - ingredients
 *             properties:
 *               id_praticien:
 *                 type: integer
 *                 example: 3
 *               title:
 *                 type: string
 *                 example: "Lasagnes maison"
 *               categorie:
 *                 type: string
 *                 example: "Viande"
 *               servings:
 *                 type: integer
 *                 example: 4
 *               prepTime:
 *                 type: integer
 *                 example: 45
 *               difficulty:
 *                 type: string
 *                 example: "moyenne"
 *               price:
 *                 type: string
 *                 example: "moyen"
 *               ecoscore:
 *                 type: string
 *                 example: "B"
 *               url:
 *                 type: string
 *                 example: "https://exemple.com/lasagnes"
 *               description:
 *                 type: string
 *                 example: "Recette familiale traditionnelle"
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Boeuf haché"
 *                     quantity:
 *                       type: number
 *                       example: 300
 *                     unit:
 *                       type: string
 *                       example: "g"
 *                     unit_g:
 *                       type: number
 *                       example: 300
 *     responses:
 *       201:
 *         description: Recette créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_recipe:
 *                   type: integer
 *                   example: 5
 *                 nutrition:
 *                   type: object
 *                   properties:
 *                     kcal:
 *                       type: number
 *                       example: 450
 *                     proteine:
 *                       type: number
 *                       example: 35
 */
router.post("", createRecipe);

/**
 * @swagger
 * /recipes/{id_recipe}:
 *   put:
 *     summary: Met à jour une recette existante
 *     tags:
 *       - Recettes
 *     parameters:
 *       - in: path
 *         name: id_recipe
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Lasagnes revisitées"
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Boeuf haché"
 *                     quantity:
 *                       type: number
 *                       example: 300
 *                     unit:
 *                       type: string
 *                       example: "g"
 *                     unit_g:
 *                       type: number
 *                       example: 300
 *     responses:
 *       200:
 *         description: Recette mise à jour
 *       500:
 *         description: Erreur serveur
 */
router.put("/:id_recipe", updateRecipe);

/**
 * @swagger
 * /recipes/{id_recipe}:
 *   delete:
 *     summary: Supprime une recette
 *     tags:
 *       - Recettes
 *     parameters:
 *       - in: path
 *         name: id_recipe
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: Recette et ingrédients supprimés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Recette et ses ingrédients supprimés avec succès"
 *                 deletedRecipe:
 *                   type: object
 *       404:
 *         description: Recette non trouvée
 */
router.delete("/:id_recipe", deleteRecipe);

module.exports = router;
