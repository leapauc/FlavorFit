const express = require("express");
const router = express.Router();
const { generatedPDF } = require("../controller/pdf.controller");

/**
 * @swagger
 * /pdf/generate:
 *   post:
 *     summary: Génère un PDF à partir de données envoyées
 *     description: |
 *       Cette route permet de **générer un fichier PDF dynamiquement**
 *       à partir des données envoyées dans le corps de la requête.
 *
 *       Fonctionnement :
 *
 *       1. Les données JSON envoyées sont transmises au script Python `generatePDF.py`.
 *       2. Le script Python génère un document PDF.
 *       3. Le PDF est renvoyé au serveur Node via `stdout`.
 *       4. L'API renvoie le fichier PDF au client sous forme de **téléchargement**.
 *
 *       Le PDF est envoyé avec les headers suivants :
 *
 *       ```
 *       Content-Type: application/pdf
 *       Content-Disposition: attachment; filename=rapport.pdf
 *       ```
 *
 *       Cette route est utilisée pour :
 *
 *       - générer des **plans alimentaires**
 *       - créer des **rapports nutritionnels**
 *       - exporter des **documents patients**
 *
 *     tags:
 *       - PDF
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Données utilisées pour générer le PDF
 *             properties:
 *
 *               patient:
 *                 type: object
 *                 description: Informations du patient
 *                 properties:
 *                   firstname:
 *                     type: string
 *                     example: "Jean"
 *
 *                   lastname:
 *                     type: string
 *                     example: "Dupont"
 *
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Date de début du planning
 *                 example: "2025-12-01"
 *
 *               planning:
 *                 type: array
 *                 description: Liste des jours du planning alimentaire
 *                 items:
 *                   type: object
 *                   properties:
 *
 *                     day:
 *                       type: string
 *                       example: "Lundi"
 *
 *                     breakfast:
 *                       type: string
 *                       example: "Flocons d'avoine, lait d'amande, banane"
 *
 *                     lunch:
 *                       type: string
 *                       example: "Poulet grillé, quinoa, légumes verts"
 *
 *                     dinner:
 *                       type: string
 *                       example: "Saumon, riz complet, brocolis"
 *
 *           example:
 *             patient:
 *               firstname: "Jean"
 *               lastname: "Dupont"
 *
 *             startDate: "2025-12-01"
 *
 *             planning:
 *               - day: "Lundi"
 *                 breakfast: "Flocons d'avoine, lait d'amande, banane"
 *                 lunch: "Poulet grillé, quinoa, légumes verts"
 *                 dinner: "Saumon, riz complet, brocolis"
 *
 *               - day: "Mardi"
 *                 breakfast: "Yaourt nature, granola, fruits rouges"
 *                 lunch: "Salade de thon, avocat, tomates"
 *                 dinner: "Omelette, légumes grillés"
 *
 *     responses:
 *
 *       200:
 *         description: PDF généré avec succès
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *
 *       500:
 *         description: Erreur lors de la génération du PDF
 *         content:
 *           application/json:
 *             examples:
 *
 *               erreurGeneration:
 *                 summary: Erreur script Python
 *                 value:
 *                   message: "Erreur génération PDF"
 *
 *               erreurServeur:
 *                 summary: Erreur serveur
 *                 value:
 *                   message: "Erreur serveur"
 */
router.post("/generate", generatedPDF);

module.exports = router;
