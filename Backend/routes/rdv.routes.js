const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getOne,
  updateAppointment,
  deleteAppointment,
  getByPraticien,
  getByPatient,
} = require("../controller/rdv.controller");

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Crée un nouveau RDV
 *     description: Ajoute un rendez-vous pour un patient et un praticien.
 *     tags:
 *       - RDV
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_praticien
 *               - id_patient
 *               - date_appointment
 *             properties:
 *               id_praticien:
 *                 type: integer
 *                 example: 1
 *               id_patient:
 *                 type: integer
 *                 example: 10
 *               date_appointment:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-15T14:30:00Z"
 *               duration:
 *                 type: integer
 *                 example: 60
 *               notes:
 *                 type: string
 *                 example: "RDV initial de suivi"
 *     responses:
 *       201:
 *         description: RDV créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_appointment:
 *                   type: integer
 *                   example: 5
 *                 id_praticien:
 *                   type: integer
 *                   example: 1
 *                 id_patient:
 *                   type: integer
 *                   example: 10
 *                 date_appointment:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-03-15T14:30:00Z"
 *                 duration:
 *                   type: integer
 *                   example: 60
 *                 notes:
 *                   type: string
 *                   example: "RDV initial de suivi"
 *       400:
 *         description: Requête invalide (champs manquants)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "id_praticien, id_patient et date_appointment requis"
 *       500:
 *         description: Erreur serveur lors de la création du RDV
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur création RDV"
 */
router.post("/", createAppointment);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Récupère un RDV par son ID
 *     description: Renvoie les informations complètes d'un rendez-vous spécifique.
 *     tags:
 *       - RDV
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du RDV à récupérer
 *         example: 5
 *     responses:
 *       200:
 *         description: RDV trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_appointment:
 *                   type: integer
 *                   example: 5
 *                 id_praticien:
 *                   type: integer
 *                   example: 1
 *                 id_patient:
 *                   type: integer
 *                   example: 10
 *                 date_appointment:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-03-15T14:30:00Z"
 *                 duration:
 *                   type: integer
 *                   example: 60
 *                 notes:
 *                   type: string
 *                   example: "RDV initial de suivi"
 *       404:
 *         description: RDV non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "RDV non trouvé"
 *       500:
 *         description: Erreur serveur lors de la récupération du RDV
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur récupération RDV"
 */
router.get("/:id", getOne);

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Met à jour un RDV
 *     description: Modifie la date, la durée ou les notes d'un rendez-vous existant.
 *     tags:
 *       - RDV
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du RDV à modifier
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date_appointment:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-16T15:00:00Z"
 *               duration:
 *                 type: integer
 *                 example: 45
 *               notes:
 *                 type: string
 *                 example: "Modification date et durée"
 *     responses:
 *       200:
 *         description: RDV mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_appointment:
 *                   type: integer
 *                   example: 5
 *                 id_praticien:
 *                   type: integer
 *                   example: 1
 *                 id_patient:
 *                   type: integer
 *                   example: 10
 *                 date_appointment:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-03-16T15:00:00Z"
 *                 duration:
 *                   type: integer
 *                   example: 45
 *                 notes:
 *                   type: string
 *                   example: "Modification date et durée"
 *       404:
 *         description: RDV non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "RDV non trouvé"
 *       500:
 *         description: Erreur serveur lors de la modification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur modification RDV"
 */
router.put("/:id", updateAppointment);

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Supprime un RDV
 *     description: Supprime un rendez-vous existant par son ID.
 *     tags:
 *       - RDV
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du RDV à supprimer
 *         example: 5
 *     responses:
 *       200:
 *         description: RDV supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "RDV supprimé avec succès"
 *       404:
 *         description: RDV non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "RDV non trouvé"
 *       500:
 *         description: Erreur serveur lors de la suppression
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur suppression RDV"
 */
router.delete("/:id", deleteAppointment);

/**
 * @swagger
 * /appointments/praticien/{id_praticien}:
 *   get:
 *     summary: Liste des RDV pour un praticien
 *     description: Renvoie tous les rendez-vous d'un praticien donné avec les noms des patients.
 *     tags:
 *       - RDV
 *     parameters:
 *       - in: path
 *         name: id_praticien
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Liste des RDV récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_appointment:
 *                     type: integer
 *                     example: 5
 *                   id_praticien:
 *                     type: integer
 *                     example: 1
 *                   id_patient:
 *                     type: integer
 *                     example: 10
 *                   date_appointment:
 *                     type: string
 *                     format: date-time
 *                     example: "2026-03-15T14:30:00Z"
 *                   duration:
 *                     type: integer
 *                     example: 60
 *                   notes:
 *                     type: string
 *                     example: "RDV initial de suivi"
 *                   firstname:
 *                     type: string
 *                     example: "Léonie"
 *                   lastname:
 *                     type: string
 *                     example: "RICHARD"
 *       500:
 *         description: Erreur serveur lors de la récupération
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur récupération RDV"
 */
router.get("/praticien/:id_praticien", getByPraticien);

/**
 * @swagger
 * /appointments/patient/{id_patient}:
 *   get:
 *     summary: Liste des RDV pour un patient
 *     description: Renvoie tous les rendez-vous d’un patient donné.
 *     tags:
 *       - RDV
 *     parameters:
 *       - in: path
 *         name: id_patient
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: RDV(s) du patient récupéré(s)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_appointment:
 *                   type: integer
 *                   example: 5
 *                 id_praticien:
 *                   type: integer
 *                   example: 1
 *                 id_patient:
 *                   type: integer
 *                   example: 10
 *                 date_appointment:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-03-15T14:30:00Z"
 *                 duration:
 *                   type: integer
 *                   example: 60
 *                 notes:
 *                   type: string
 *                   example: "RDV initial de suivi"
 *       404:
 *         description: Aucun RDV trouvé pour ce patient
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Aucun RDV trouvé"
 *       500:
 *         description: Erreur serveur lors de la récupération
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur récupération RDV"
 */
router.get("/patient/id_patient", getByPatient);

module.exports = router;
