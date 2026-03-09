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

/**
 * @swagger
 * /infobdd/pathologies:
 *   get:
 *     summary: Récupère toutes les pathologies classées par type
 *     description: |
 *       Retourne la liste des **pathologies regroupées par type**.
 *       Les pathologies sont agrégées sous forme de texte grâce à la fonction PostgreSQL `STRING_AGG`.
 *
 *       Exemple de types :
 *       - Pathologies digestives
 *       - Pathologies cardiovasculaires
 *       - Pathologies métaboliques
 *
 *     tags:
 *       - InfoBDD
 *
 *     responses:
 *       200:
 *         description: Liste des pathologies par type
 *         content:
 *           application/json:
 *             example:
 *               - type: "Pathologies métaboliques"
 *                 string_agg: "diabète, obésité"
 *
 *               - type: "Pathologies cardiovasculaires"
 *                 string_agg: "hypertension, cholestérol"
 *
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             example:
 *               error: "Erreur serveur"
 */
router.get("/pathologies", getPathologies);

/**
 * @swagger
 * /infobdd/convictions:
 *   get:
 *     summary: Récupère toutes les convictions alimentaires
 *     description: |
 *       Retourne la liste des **convictions alimentaires** disponibles dans la base.
 *
 *       Exemple :
 *       - végétarien
 *       - végan
 *       - halal
 *       - casher
 *
 *     tags:
 *       - InfoBDD
 *
 *     responses:
 *       200:
 *         description: Liste des convictions
 *         content:
 *           application/json:
 *             example:
 *               - name: "végétarien"
 *               - name: "végan"
 *               - name: "halal"
 *
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             example:
 *               error: "Erreur serveur"
 */
router.get("/convictions", getConvictions);

/**
 * @swagger
 * /infobdd/restrictions:
 *   get:
 *     summary: Récupère les restrictions alimentaires
 *     description: |
 *       Retourne la liste des **restrictions alimentaires**
 *       pouvant être appliquées dans un régime alimentaire.
 *
 *       Exemple :
 *       - sans lactose
 *       - sans gluten
 *       - faible en sel
 *
 *     tags:
 *       - InfoBDD
 *
 *     responses:
 *       200:
 *         description: Liste des restrictions
 *         content:
 *           application/json:
 *             example:
 *               - name: "sans gluten"
 *               - name: "sans lactose"
 *               - name: "faible en sel"
 *
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             example:
 *               error: "Erreur serveur"
 */
router.get("/restrictions", getRestrictions);

/**
 * @swagger
 * /infobdd/ingredients:
 *   get:
 *     summary: Récupère la liste des ingrédients
 *     description: |
 *       Retourne tous les **ingrédients présents dans la table CIQUAL**
 *       utilisés pour les calculs nutritionnels et les plans alimentaires.
 *
 *       Les ingrédients sont retournés **triés par ordre alphabétique**.
 *
 *     tags:
 *       - InfoBDD
 *
 *     responses:
 *       200:
 *         description: Liste des ingrédients
 *         content:
 *           application/json:
 *             example:
 *               - ingredient: "Banane"
 *               - ingredient: "Carotte"
 *               - ingredient: "Poulet"
 *
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             example:
 *               error: "Erreur serveur"
 */
router.get("/ingredients", getIngredients);

/**
 * @swagger
 * /infobdd/fruit_vegetable_weight:
 *   get:
 *     summary: Récupère le poids moyen des fruits et légumes
 *     description: |
 *       Retourne le **poids moyen en grammes** des fruits et légumes.
 *
 *       Ces données permettent de :
 *       - convertir une portion en grammes
 *       - générer des plans alimentaires
 *       - calculer les apports nutritionnels
 *
 *     tags:
 *       - InfoBDD
 *
 *     responses:
 *       200:
 *         description: Liste des poids moyens des fruits et légumes
 *         content:
 *           application/json:
 *             example:
 *               - name: "Banane"
 *                 g_weight: 120
 *
 *               - name: "Pomme"
 *                 g_weight: 150
 *
 *               - name: "Carotte"
 *                 g_weight: 80
 *
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             example:
 *               error: "Erreur serveur"
 */
router.get("/fruit_vegetable_weight", getFruitVegetableWeight);

/**
 * @swagger
 * /infobdd/meat_fish_egg_weight:
 *   get:
 *     summary: Récupère le poids moyen des viandes poissons et oeufs
 *     description: |
 *       Retourne le **poids moyen en grammes des produits animaux**
 *       utilisés dans les plans alimentaires :
 *
 *       - viandes
 *       - poissons
 *       - oeufs
 *
 *       Ces données incluent également :
 *       - le type d'animal
 *       - l'image associée
 *
 *     tags:
 *       - InfoBDD
 *
 *     responses:
 *       200:
 *         description: Liste des poids moyens des aliments animaux
 *         content:
 *           application/json:
 *             example:
 *               - name: "Poulet"
 *                 animal: "volaille"
 *                 img: "poulet.png"
 *                 g_weight: 150
 *
 *               - name: "Saumon"
 *                 animal: "poisson"
 *                 img: "saumon.png"
 *                 g_weight: 120
 *
 *               - name: "Oeuf"
 *                 animal: "oeuf"
 *                 img: "oeuf.png"
 *                 g_weight: 60
 *
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             example:
 *               error: "Erreur serveur"
 */
router.get("/meat_fish_egg_weight", getMeatFishEggWeight);

module.exports = router;
