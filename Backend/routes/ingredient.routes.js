const express = require("express");
const {
  getAllGroups,
  getAllIngredientForAGroup,
  getMeasuringContener,
  getIngredientUnitWeight,
  getAllDistinctIngredient,
} = require("../controller/ingredient.controller");

const router = express.Router();

/**
 * @swagger
 * /ingredients/groups:
 *   get:
 *     summary: Récupère tous les groupes d'aliments
 *     description: |
 *       Retourne la liste des **groupes alimentaires distincts**
 *       présents dans la base de données des ingrédients.
 *
 *       Exemple de groupes :
 *       - Fruits
 *       - Légumes
 *       - Produits céréaliers
 *       - Viandes
 *       - Produits laitiers
 *
 *     tags:
 *       - Ingredients
 *
 *     responses:
 *       200:
 *         description: Liste des groupes d'aliments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   alim_grp_nom_fr:
 *                     type: string
 *                     example: "Fruits"
 *
 *             example:
 *               - alim_grp_nom_fr: "Fruits"
 *               - alim_grp_nom_fr: "Légumes"
 *               - alim_grp_nom_fr: "Produits céréaliers"
 *
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             example:
 *               error: "Erreur serveur"
 */
router.get("/groups", getAllGroups);

/**
 * @swagger
 * /ingredients/group/{alim_grp_nom_fr}:
 *   get:
 *     summary: Récupère tous les ingrédients d'un groupe
 *     description: |
 *       Retourne la liste des ingrédients appartenant à un **groupe alimentaire spécifique**.
 *
 *       Les résultats contiennent :
 *       - l'identifiant de l'ingrédient
 *       - le sous-groupe
 *       - le sous-sous-groupe
 *       - le nom de l'ingrédient
 *
 *     tags:
 *       - Ingredients
 *
 *     parameters:
 *       - in: path
 *         name: alim_grp_nom_fr
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom du groupe alimentaire
 *         example: "Fruits"
 *
 *     responses:
 *       200:
 *         description: Liste des ingrédients du groupe
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *
 *                   id_ingredient:
 *                     type: integer
 *                     example: 120
 *
 *                   alim_ssgrp_nom_fr:
 *                     type: string
 *                     example: "Fruits frais"
 *
 *                   alim_ssssgrp_nom_fr:
 *                     type: string
 *                     example: "Fruits tropicaux"
 *
 *                   alim_nom_fr:
 *                     type: string
 *                     example: "Banane"
 *
 *             example:
 *               - id_ingredient: 120
 *                 alim_ssgrp_nom_fr: "Fruits frais"
 *                 alim_ssssgrp_nom_fr: "Fruits tropicaux"
 *                 alim_nom_fr: "Banane"
 *
 *               - id_ingredient: 121
 *                 alim_ssgrp_nom_fr: "Fruits frais"
 *                 alim_ssssgrp_nom_fr: "Fruits rouges"
 *                 alim_nom_fr: "Fraise"
 *
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             example:
 *               error: "Erreur serveur"
 */
router.get("/group/:alim_grp_nom_fr", getAllIngredientForAGroup);

/**
 * @swagger
 * /ingredients/measuring_contener:
 *   get:
 *     summary: Récupère les contenants de mesure
 *     description: |
 *       Retourne les **contenants utilisés pour mesurer les aliments**
 *       avec leur poids moyen en grammes.
 *
 *       Exemple :
 *       - cuillère à soupe
 *       - cuillère à café
 *       - tasse
 *       - verre
 *
 *     tags:
 *       - Ingredients
 *
 *     responses:
 *       200:
 *         description: Liste des contenants de mesure
 *         content:
 *           application/json:
 *             example:
 *               - name: "Cuillère à soupe"
 *                 weight: 15
 *
 *               - name: "Cuillère à café"
 *                 weight: 5
 *
 *               - name: "Tasse"
 *                 weight: 250
 *
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             example:
 *               error: "Erreur serveur"
 */
router.get("/measuring_contener", getMeasuringContener);

/**
 * @swagger
 * /ingredients/{id_ingredient}/unit_weight:
 *   get:
 *     summary: Récupère le poids unitaire d'un ingrédient
 *     description: |
 *       Retourne les informations de **poids unitaire d'un ingrédient**
 *       à partir de la fonction PostgreSQL :
 *
 *       ```
 *       get_ingredient_unit_weight(id_ingredient)
 *       ```
 *
 *       Cette fonction permet de récupérer les unités de mesure
 *       associées à un ingrédient.
 *
 *     tags:
 *       - Ingredients
 *
 *     parameters:
 *       - in: path
 *         name: id_ingredient
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant de l'ingrédient
 *         example: 120
 *
 *     responses:
 *       200:
 *         description: Poids unitaire de l'ingrédient
 *         content:
 *           application/json:
 *             example:
 *               id_ingredient: 120
 *               ingredient: "Banane"
 *               unit: "pièce"
 *               weight: 120
 *
 *       404:
 *         description: Ingrédient non trouvé
 *         content:
 *           application/json:
 *             example:
 *               error: "Ingrédient non trouvé"
 *
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             example:
 *               error: "Erreur serveur"
 */
router.get("/:id_ingredient/unit_weight", getIngredientUnitWeight);

/**
 * @swagger
 * /ingredients/distinct_ingredient:
 *   get:
 *     summary: Récupère la liste distincte des ingrédients
 *     description: |
 *       Retourne une liste **distincte des ingrédients disponibles**
 *       avec leur groupe, sous-groupe et sous-sous-groupe.
 *
 *       Le nom de l'aliment est nettoyé avec `split_part` pour
 *       supprimer les informations supplémentaires après une virgule.
 *
 *     tags:
 *       - Ingredients
 *
 *     responses:
 *       200:
 *         description: Liste des ingrédients distincts
 *         content:
 *           application/json:
 *             example:
 *               - alim_grp_nom_fr: "Fruits"
 *                 alim_ssgrp_nom_fr: "Fruits frais"
 *                 alim_ssssgrp_nom_fr: "Fruits tropicaux"
 *                 alim_nom_fr: "Banane"
 *
 *               - alim_grp_nom_fr: "Légumes"
 *                 alim_ssgrp_nom_fr: "Légumes racines"
 *                 alim_ssssgrp_nom_fr: "Carottes"
 *                 alim_nom_fr: "Carotte"
 *
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             example:
 *               error: "Erreur serveur"
 */
router.get("/distinct_ingredient", getAllDistinctIngredient);

module.exports = router;
