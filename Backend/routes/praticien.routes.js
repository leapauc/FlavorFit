const express = require("express");
const {
  getAllPraticien,
  getPraticienById,
  createPraticien,
  updatePraticien,
  deletePraticien,
} = require("../controller/praticien.controller");

const router = express.Router();

/**
 * @swagger
 * /praticiens:
 *   get:
 *     summary: Récupère la liste de tous les praticiens
 *     description: Renvoie toutes les informations des praticiens enregistrés dans la base.
 *     tags:
 *       - Praticiens
 *     responses:
 *       200:
 *         description: Liste des praticiens récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_praticien:
 *                     type: integer
 *                     example: 1
 *                   lastname:
 *                     type: string
 *                     example: "DUPOND"
 *                   firstname:
 *                     type: string
 *                     example: "Monique"
 *                   email:
 *                     type: string
 *                     example: "monique.dupond@gmail.com"
 *                   password_hash:
 *                     type: string
 *                     example: "123456789"
 *                   phone:
 *                     type: string
 *                     example: "0645125478"
 *                   date_creation:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-12-01T10:00:00Z"
 *                   last_conn:
 *                     type: string
 *                     format: date-time
 *                     example: null
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
router.get("/", getAllPraticien);

/**
 * @swagger
 * /praticiens/{id_praticien}:
 *   get:
 *     summary: Récupère un praticien par son ID
 *     description: Renvoie les informations d'un praticien spécifique.
 *     tags:
 *       - Praticiens
 *     parameters:
 *       - in: path
 *         name: id_praticien
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du praticien à récupérer
 *         example: 1
 *     responses:
 *       200:
 *         description: Praticien trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_praticien:
 *                   type: integer
 *                   example: 1
 *                 lastname:
 *                   type: string
 *                   example: "DUPOND"
 *                 firstname:
 *                   type: string
 *                   example: "Monique"
 *                 email:
 *                   type: string
 *                   example: "monique.dupond@gmail.com"
 *                 password_hash:
 *                   type: string
 *                   example: "123456789"
 *                 phone:
 *                   type: string
 *                   example: "0645125478"
 *                 date_creation:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-12-01T10:00:00Z"
 *                 last_conn:
 *                   type: string
 *                   format: date-time
 *                   example: null
 *       404:
 *         description: Praticien non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Praticien non trouvé"
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
router.get("/:id_praticien", getPraticienById);

/**
 * @swagger
 * /praticiens:
 *   post:
 *     summary: Crée un nouveau praticien
 *     description: Ajoute un praticien dans la base de données.
 *     tags:
 *       - Praticiens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lastname
 *               - firstname
 *               - email
 *               - password_hash
 *               - phone
 *             properties:
 *               lastname:
 *                 type: string
 *                 example: "DUPOND"
 *               firstname:
 *                 type: string
 *                 example: "Monique"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "monique.dupond@gmail.com"
 *               password_hash:
 *                 type: string
 *                 example: "motDePasse123"
 *               phone:
 *                 type: string
 *                 example: "0645125478"
 *     responses:
 *       201:
 *         description: Praticien créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_praticien:
 *                   type: integer
 *                   example: 3
 *                 lastname:
 *                   type: string
 *                   example: "DUPOND"
 *                 firstname:
 *                   type: string
 *                   example: "Monique"
 *                 email:
 *                   type: string
 *                   example: "monique.dupond@gmail.com"
 *                 password_hash:
 *                   type: string
 *                   example: "motDePasse123"
 *                 phone:
 *                   type: string
 *                   example: "0645125478"
 *                 date_creation:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-12-01T10:00:00Z"
 *                 last_conn:
 *                   type: string
 *                   format: date-time
 *                   example: null
 *       400:
 *         description: Requête invalide ou email déjà existant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email déjà utilisé"
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
router.post("", createPraticien);

/**
 * @swagger
 * /praticiens/{id_praticien}:
 *   put:
 *     summary: Met à jour un praticien
 *     description: Met à jour les informations d'un praticien existant par son ID.
 *     tags:
 *       - Praticiens
 *     parameters:
 *       - name: id_praticien
 *         in: path
 *         required: true
 *         description: ID du praticien à mettre à jour
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lastname:
 *                 type: string
 *                 example: "DUPOND"
 *               firstname:
 *                 type: string
 *                 example: "Monique"
 *               email:
 *                 type: string
 *                 example: "monique.dupond@gmail.com"
 *               password_hash:
 *                 type: string
 *                 example: "nouveauMotDePasse123"
 *               phone:
 *                 type: string
 *                 example: "0645125478"
 *     responses:
 *       200:
 *         description: Praticien mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_praticien:
 *                   type: integer
 *                   example: 1
 *                 lastname:
 *                   type: string
 *                   example: "DUPOND"
 *                 firstname:
 *                   type: string
 *                   example: "Monique"
 *                 email:
 *                   type: string
 *                   example: "monique.dupond@gmail.com"
 *                 password_hash:
 *                   type: string
 *                   example: "nouveauMotDePasse123"
 *                 phone:
 *                   type: string
 *                   example: "0645125478"
 *                 date_creation:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-12-01T10:00:00Z"
 *                 last_conn:
 *                   type: string
 *                   format: date-time
 *                   example: null
 *       404:
 *         description: Praticien non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Praticien non trouvé"
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
router.put("/:id_praticien", updatePraticien);

/**
 * @swagger
 * /praticiens/{id_praticien}:
 *   delete:
 *     summary: Supprime un praticien
 *     description: Supprime un praticien existant par son ID.
 *     tags:
 *       - Praticiens
 *     parameters:
 *       - name: id_praticien
 *         in: path
 *         required: true
 *         description: ID du praticien à supprimer
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Praticien supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Praticien supprimé"
 *                 praticien:
 *                   type: object
 *                   properties:
 *                     id_praticien:
 *                       type: integer
 *                       example: 1
 *                     lastname:
 *                       type: string
 *                       example: "DUPOND"
 *                     firstname:
 *                       type: string
 *                       example: "Monique"
 *                     email:
 *                       type: string
 *                       example: "monique.dupond@gmail.com"
 *                     phone:
 *                       type: string
 *                       example: "0645125478"
 *                     date_creation:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-12-01T10:00:00Z"
 *                     last_conn:
 *                       type: string
 *                       format: date-time
 *                       example: null
 *       404:
 *         description: Praticien non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Praticien non trouvé"
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
router.delete("/:id_praticien", deletePraticien);

module.exports = router;
