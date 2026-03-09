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

/**
 * @swagger
 * /planning/{id_planning}/details:
 *   get:
 *     summary: Récupère le planning détaillé
 *     description: |
 *       Retourne le **planning complet structuré par jour et repas**.
 *       Chaque jour contient deux repas :
 *       - Midi
 *       - Dîner
 *
 *       Si aucune recette n'est assignée, la valeur est `null`.
 *
 *     tags:
 *       - Planning
 *
 *     parameters:
 *       - in: path
 *         name: id_planning
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant du planning
 *         example: 12
 *
 *     responses:
 *       200:
 *         description: Planning détaillé
 *         content:
 *           application/json:
 *             example:
 *               id_planning: 12
 *               id_patient: 5
 *               start_day: "2025-03-10"
 *               nb_people: 2
 *               details:
 *                 Lundi:
 *                   Midi:
 *                     id: 101
 *                     title: "Poulet curry"
 *                   Dîner: null
 *                 Mardi:
 *                   Midi: null
 *                   Dîner:
 *                     id: 55
 *                     title: "Saumon riz légumes"
 *
 *       404:
 *         description: Planning non trouvé
 *
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id_planning/details", getPlanningDetailsById);

/**
 * @swagger
 * /planning/recipe/shopping_list:
 *   post:
 *     summary: Génère une liste de courses
 *     description: |
 *       Génère une **liste de courses agrégée** à partir de plusieurs recettes.
 *
 *       Les ingrédients identiques sont regroupés et leurs quantités sont additionnées.
 *
 *     tags:
 *       - Planning
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipeIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *             example:
 *               recipeIds: [1, 4, 7]
 *
 *     responses:
 *       200:
 *         description: Liste de courses générée
 *         content:
 *           application/json:
 *             example:
 *               Fruits et légumes:
 *                 - name: "Carotte"
 *                   quantity_g: 300
 *                 - name: "Oignon"
 *                   quantity_g: 120
 *
 *               Viandes:
 *                 - name: "Poulet"
 *                   quantity_g: 500
 *
 *       400:
 *         description: recipeIds manquant
 *
 *       500:
 *         description: Erreur serveur
 */
router.post("/recipe/shopping_list", generateShoppingList);

/**
 * @swagger
 * /planning/{id_patient}/{id_planning}:
 *   get:
 *     summary: Récupère un planning spécifique d'un patient
 *     tags:
 *       - Planning
 *
 *     parameters:
 *       - in: path
 *         name: id_patient
 *         required: true
 *         schema:
 *           type: integer
 *         example: 3
 *
 *       - in: path
 *         name: id_planning
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
 *
 *     responses:
 *       200:
 *         description: Planning trouvé
 *         content:
 *           application/json:
 *             example:
 *               id_planning: 12
 *               id_patient: 3
 *               start_day: "2025-03-10"
 *               nb_people: 2
 *
 *       404:
 *         description: Planning non trouvé
 *
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id_patient/:id_planning", getPlanningByIdPatientById);

/**
 * @swagger
 * /planning/{id_patient}:
 *   get:
 *     summary: Récupère tous les plannings d'un patient
 *     tags:
 *       - Planning
 *
 *     parameters:
 *       - in: path
 *         name: id_patient
 *         required: true
 *         schema:
 *           type: integer
 *         example: 3
 *
 *     responses:
 *       200:
 *         description: Liste des plannings
 *         content:
 *           application/json:
 *             example:
 *               - id_planning: 10
 *                 id_patient: 3
 *                 start_day: "2025-02-01"
 *                 nb_people: 2
 *
 *               - id_planning: 12
 *                 id_patient: 3
 *                 start_day: "2025-03-10"
 *                 nb_people: 2
 *
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id_patient", getAllPlanningPatientById);

/**
 * @swagger
 * /planning/{id_patient}:
 *   post:
 *     summary: Crée un nouveau planning pour un patient
 *     tags:
 *       - Planning
 *
 *     parameters:
 *       - in: path
 *         name: id_patient
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             startDate: "2025-03-10"
 *             nbPeople: 2
 *             planning:
 *               Lundi:
 *                 Midi:
 *                   id: 10
 *                 Dîner:
 *                   id: 12
 *               Mardi:
 *                 Midi: null
 *                 Dîner:
 *                   id: 8
 *
 *     responses:
 *       201:
 *         description: Planning créé
 *         content:
 *           application/json:
 *             example:
 *               message: "Planning saved"
 *
 *       500:
 *         description: Erreur serveur
 */
router.post("/:id_patient", createPlanningPatientById);

/**
 * @swagger
 * /planning/{id_planning}:
 *   put:
 *     summary: Met à jour un planning
 *     tags:
 *       - Planning
 *
 *     parameters:
 *       - in: path
 *         name: id_planning
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
 *
 *     responses:
 *       200:
 *         description: Planning mis à jour
 *
 *       500:
 *         description: Erreur serveur
 */
router.put("/:id_planning", updatePlanningById);

/**
 * @swagger
 * /planning/{id_planning}:
 *   delete:
 *     summary: Supprime un planning
 *     tags:
 *       - Planning
 *
 *     parameters:
 *       - in: path
 *         name: id_planning
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
 *
 *     responses:
 *       200:
 *         description: Planning supprimé
 *
 *       500:
 *         description: Erreur serveur
 */
router.delete("/:id_planning", deletePlanningById);

module.exports = router;
