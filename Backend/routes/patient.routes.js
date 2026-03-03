const express = require("express");
const {
  getAllPatient,
  getAllPatientByPraticien,
  getPatientById,
  getContactPatientById,
  getConstraintPatientById,
  getAllPlanningPatientById,
  getPlanningByIdPatientById,
  createPatient,
  createPlanningPatientById,
  updateContactPatient,
  updateConstraintPatient,
  deletePatient,
} = require("../controller/patient.controller");

const router = express.Router();

/**
 * @swagger
 * /patient:
 *   get:
 *     summary: Récupère tous les patients
 *     description: Renvoie toutes les informations des patients enregistrés dans la base.
 *     tags:
 *       - Patients
 *     responses:
 *       200:
 *         description: Liste des patients récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_patient:
 *                     type: integer
 *                     example: 1
 *                   id_praticien:
 *                     type: integer
 *                     example: 1
 *                   lastname:
 *                     type: string
 *                     example: "RICHARD"
 *                   firstname:
 *                     type: string
 *                     example: "Léonie"
 *                   age:
 *                     type: integer
 *                     example: 21
 *                   email:
 *                     type: string
 *                     example: "leonie124@yahoo.fr"
 *                   phone:
 *                     type: string
 *                     example: "0645125478"
 *                   address:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["45 rue de la Lyre","","45125","Châlette-sur-Loing"]
 *                   date_creation:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-12-01T10:00:00Z"
 *                   pathologies:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["diabétique"]
 *                   allergies:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["cacahuète", "noix"]
 *                   conviction:
 *                     type: string
 *                     example: "végétarien"
 *                   history:
 *                     type: string
 *                     example: "infractus à 41 ans"
 *                   other:
 *                     type: string
 *                     example: "nombreux antécédents familiaux"
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
router.get("/", getAllPatient);

/**
 * @swagger
 * /patient/{id_praticien}:
 *   get:
 *     summary: Récupère tous les patients d'un praticien
 *     description: Renvoie la liste des patients liés à un praticien donné.
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id_praticien
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du praticien
 *     responses:
 *       200:
 *         description: Liste des patients récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Patient'
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
router.get("/all/:id_praticien", getAllPatientByPraticien);

/**
 * @swagger
 * /patient/{id_patient}:
 *   get:
 *     summary: Récupère un patient par ID
 *     description: Renvoie toutes les informations d'un patient spécifique.
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id_patient
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du patient
 *     responses:
 *       200:
 *         description: Patient récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       404:
 *         description: Patient non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Patient non trouvé"
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
router.get("/:id_patient", getPatientById);

/**
 * @swagger
 * /patient/{id_patient}/contact:
 *   get:
 *     summary: Récupère les informations de contact d'un patient
 *     description: Renvoie uniquement les colonnes lastname, firstname, age, email, phone, address.
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id_patient
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du patient
 *     responses:
 *       200:
 *         description: Contact du patient récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lastname:
 *                   type: string
 *                   example: "RICHARD"
 *                 firstname:
 *                   type: string
 *                   example: "Léonie"
 *                 age:
 *                   type: integer
 *                   example: 21
 *                 email:
 *                   type: string
 *                   example: "leonie124@yahoo.fr"
 *                 phone:
 *                   type: string
 *                   example: "0645125478"
 *                 address:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["45 rue de la Lyre","","45125","Châlette-sur-Loing"]
 *       404:
 *         description: Patient non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id_patient/contact", getContactPatientById);

/**
 * @swagger
 * /patient/{id_patient}/constraint:
 *   get:
 *     summary: Récupère les contraintes d'un patient
 *     description: Renvoie uniquement les colonnes pathologies, allergies, conviction, history et other.
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id_patient
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du patient
 *     responses:
 *       200:
 *         description: Contraintes du patient récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pathologies:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["diabétique"]
 *                 allergies:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["cacahuète", "noix"]
 *                 conviction:
 *                   type: string
 *                   example: "végétarien"
 *                 history:
 *                   type: string
 *                   example: "infractus à 41 ans"
 *                 other:
 *                   type: string
 *                   example: "nombreux antécédents familiaux"
 *       404:
 *         description: Patient non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id_patient/constraint", getConstraintPatientById);

/**
 * @swagger
 * /patient:
 *   post:
 *     summary: Crée un nouveau patient
 *     description: Ajoute un patient dans la base de données avec toutes ses informations.
 *     tags:
 *       - Patients
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_praticien
 *               - lastname
 *               - firstname
 *               - email
 *               - phone
 *             properties:
 *               id_praticien:
 *                 type: integer
 *                 example: 1
 *               lastname:
 *                 type: string
 *                 example: "RICHARD"
 *               firstname:
 *                 type: string
 *                 example: "Léonie"
 *               age:
 *                 type: integer
 *                 example: 21
 *               email:
 *                 type: string
 *                 example: "leonie124@yahoo.fr"
 *               phone:
 *                 type: string
 *                 example: "0645125478"
 *               address:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["45 rue de la Lyre","","45125","Châlette-sur-Loing"]
 *               pathologies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["diabétique"]
 *               allergies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["cacahuète", "noix"]
 *               conviction:
 *                 type: string
 *                 example: "végétarien"
 *               history:
 *                 type: string
 *                 example: "infractus à 41 ans"
 *               other:
 *                 type: string
 *                 example: "nombreux antécédents familiaux"
 *     responses:
 *       201:
 *         description: Patient créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
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
router.post("", createPatient);

/**
 * @swagger
 * /patient/{id_patient}/contact:
 *   put:
 *     summary: Met à jour les informations de contact d'un patient
 *     description: Modifie lastname, firstname, age, email, phone et address d'un patient spécifique.
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id_patient
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du patient à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lastname:
 *                 type: string
 *                 example: "RICHARD"
 *               firstname:
 *                 type: string
 *                 example: "Léonie"
 *               age:
 *                 type: integer
 *                 example: 21
 *               email:
 *                 type: string
 *                 example: "leonie124@yahoo.fr"
 *               phone:
 *                 type: string
 *                 example: "0645125478"
 *               address:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["45 rue de la Lyre","","45125","Châlette-sur-Loing"]
 *     responses:
 *       200:
 *         description: Informations de contact mises à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       404:
 *         description: Patient non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Patient non trouvé"
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
router.put("/:id_patient/contact", updateContactPatient);

/**
 * @swagger
 * /patient/{id_patient}/constraint:
 *   put:
 *     summary: Met à jour les contraintes médicales d'un patient
 *     description: Modifie pathologies, allergies, conviction, history et other d'un patient spécifique.
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id_patient
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du patient à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pathologies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["diabétique"]
 *               allergies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["cacahuète", "noix"]
 *               conviction:
 *                 type: string
 *                 example: "végétarien"
 *               history:
 *                 type: string
 *                 example: "infractus à 41 ans"
 *               other:
 *                 type: string
 *                 example: "nombreux antécédents familiaux"
 *     responses:
 *       200:
 *         description: Contraintes du patient mises à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       404:
 *         description: Patient non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Patient non trouvé"
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
router.put("/:id_patient/constraint", updateConstraintPatient);

/**
 * @swagger
 * /patient/{id_patient}:
 *   delete:
 *     summary: Supprime un patient
 *     description: Supprime un patient spécifique de la base de données.
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id_patient
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du patient à supprimer
 *     responses:
 *       200:
 *         description: Patient supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Patient supprimé"
 *                 patient:
 *                   $ref: '#/components/schemas/Patient'
 *       404:
 *         description: Patient non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Patient non trouvé"
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
router.delete("/:id_patient", deletePatient);

module.exports = router;
