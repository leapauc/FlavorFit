const express = require("express");
const router = express.Router();
const mailController = require("../controller/mails.controller");

/**
 * @swagger
 * /send-planning-email:
 *   post:
 *     summary: Envoie un planning alimentaire par email avec un PDF généré dynamiquement
 *     description: |
 *       Cette route génère un **planning alimentaire au format PDF** à partir des données envoyées
 *       dans le `payload`.
 *       Le PDF est généré par un **script Python**, puis envoyé en **pièce jointe par email**
 *       à l'utilisateur via **Nodemailer (Gmail)**.
 *
 *       Étapes du traitement :
 *
 *       1. Validation des données envoyées (email, startDate, payload).
 *       2. Envoi des données au script Python `generatePDF.py`.
 *       3. Génération du PDF du planning alimentaire.
 *       4. Récupération du PDF via `stdout`.
 *       5. Envoi du PDF en pièce jointe dans un email.
 *
 *       Le fichier joint aura le nom :
 *
 *       ```
 *       MealPlan-{startDate}.pdf
 *       ```
 *
 *     tags:
 *       - Email
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - startDate
 *               - payload
 *             properties:
 *
 *               email:
 *                 type: string
 *                 description: Adresse email du destinataire
 *                 example: "client@email.com"
 *
 *               firstName:
 *                 type: string
 *                 description: Prénom du destinataire
 *                 example: "Jean"
 *
 *               lastName:
 *                 type: string
 *                 description: Nom du destinataire
 *                 example: "Dupont"
 *
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Date de début du planning alimentaire
 *                 example: "2025-12-01"
 *
 *               payload:
 *                 type: object
 *                 description: Données utilisées pour générer le PDF du planning alimentaire
 *                 properties:
 *
 *                   patient:
 *                     type: object
 *                     description: Informations du patient
 *                     properties:
 *                       firstname:
 *                         type: string
 *                         example: "Jean"
 *                       lastname:
 *                         type: string
 *                         example: "Dupont"
 *
 *                   planning:
 *                     type: array
 *                     description: Liste des jours du planning alimentaire
 *                     items:
 *                       type: object
 *                       properties:
 *
 *                         day:
 *                           type: string
 *                           example: "Lundi"
 *
 *                         meals:
 *                           type: object
 *                           properties:
 *
 *                             breakfast:
 *                               type: string
 *                               example: "Flocons d'avoine, lait d'amande, banane"
 *
 *                             lunch:
 *                               type: string
 *                               example: "Poulet grillé, quinoa, légumes verts"
 *
 *                             dinner:
 *                               type: string
 *                               example: "Saumon, riz complet, brocolis"
 *
 *           example:
 *             email: "client@email.com"
 *             firstName: "Jean"
 *             lastName: "Dupont"
 *             startDate: "2025-12-01"
 *             payload:
 *               patient:
 *                 firstname: "Jean"
 *                 lastname: "Dupont"
 *               planning:
 *                 - day: "Lundi"
 *                   meals:
 *                     breakfast: "Flocons d'avoine, lait d'amande, banane"
 *                     lunch: "Poulet grillé, quinoa, légumes verts"
 *                     dinner: "Saumon, riz complet, brocolis"
 *                 - day: "Mardi"
 *                   meals:
 *                     breakfast: "Yaourt nature, granola, fruits rouges"
 *                     lunch: "Salade de thon, avocat, tomates"
 *                     dinner: "Omelette, légumes grillés"
 *
 *     responses:
 *
 *       200:
 *         description: Email envoyé avec succès avec le PDF en pièce jointe
 *         content:
 *           application/json:
 *             example:
 *               message: "Email envoyé avec PDF"
 *
 *       400:
 *         description: Données manquantes dans la requête
 *         content:
 *           application/json:
 *             examples:
 *
 *               emailManquant:
 *                 summary: Email ou date manquante
 *                 value:
 *                   message: "Email ou date manquante"
 *
 *               payloadManquant:
 *                 summary: Payload manquant
 *                 value:
 *                   message: "Payload manquant pour génération PDF"
 *
 *       500:
 *         description: Erreur serveur ou erreur lors de la génération du PDF
 *         content:
 *           application/json:
 *             examples:
 *
 *               erreurPDF:
 *                 summary: Erreur génération PDF
 *                 value:
 *                   message: "Erreur génération PDF"
 *
 *               pdfVide:
 *                 summary: PDF vide
 *                 value:
 *                   message: "PDF vide"
 *
 *               erreurServeur:
 *                 summary: Erreur interne
 *                 value:
 *                   message: "Erreur serveur"
 */
router.post("/send-planning-email", mailController.sendPlanningEmail);

module.exports = router;
