const express = require("express");
const { loginPraticien } = require("../controller/login.controller");

const router = express.Router();

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authentification d'un praticien
 *     description: |
 *       Permet à un **praticien de se connecter à l'application** en utilisant son **email et son mot de passe**.
 *
 *       Fonctionnement :
 *
 *       1. Vérifie que **l'email et le mot de passe sont fournis**.
 *       2. Recherche le praticien dans la base de données.
 *       3. Vérifie que le **mot de passe correspond au hash stocké en base** grâce à la fonction PostgreSQL `crypt`.
 *       4. Si les identifiants sont valides :
 *          - la **date de dernière connexion (`last_conn`) est mise à jour**
 *          - les informations du praticien sont retournées.
 *
 *       ⚠️ Aucun token JWT n'est généré dans cette implémentation.
 *
 *     tags:
 *       - Authentification
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Adresse email du praticien
 *                 example: "praticien@email.com"
 *
 *               password:
 *                 type: string
 *                 description: Mot de passe du praticien
 *                 example: "MonMotDePasse123"
 *
 *           example:
 *             email: "praticien@email.com"
 *             password: "MonMotDePasse123"
 *
 *     responses:
 *
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *
 *                 message:
 *                   type: string
 *                   example: "Connexion réussie"
 *
 *                 praticien:
 *                   type: object
 *                   description: Informations du praticien connecté
 *                   properties:
 *
 *                     id_praticien:
 *                       type: integer
 *                       example: 1
 *
 *                     firstname:
 *                       type: string
 *                       example: "Jean"
 *
 *                     lastname:
 *                       type: string
 *                       example: "Dupont"
 *
 *                     email:
 *                       type: string
 *                       example: "praticien@email.com"
 *
 *                     phone:
 *                       type: string
 *                       example: "0612345678"
 *
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-10T14:30:00Z"
 *
 *                     last_conn:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-12-01T09:20:00Z"
 *
 *       400:
 *         description: Champs requis manquants
 *         content:
 *           application/json:
 *             example:
 *               message: "Email et mot de passe requis"
 *
 *       401:
 *         description: Identifiants incorrects
 *         content:
 *           application/json:
 *             example:
 *               message: "Email ou mot de passe incorrect"
 *
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             example:
 *               message: "Erreur serveur"
 */
router.post("/", loginPraticien);

module.exports = router;
