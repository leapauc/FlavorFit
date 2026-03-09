const express = require("express");
const {
  getAllPatient,
  getAllPatientByPraticien,
  getPatientById,
  getContactPatientById,
  getConstraintPatientById,
  createPatient,
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
 *     description: Renvoie toutes les informations des patients enregistrés dans la base de données.
 *     tags:
 *       - Patients
 *     responses:
 *       200:
 *         description: Liste complète des patients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_patient:
 *                     type: integer
 *                     description: Identifiant unique du patient
 *                     example: 1
 *                   id_praticien:
 *                     type: integer
 *                     description: Identifiant du praticien associé
 *                     example: 1
 *                   lastname:
 *                     type: string
 *                     description: Nom du patient
 *                     example: "RICHARD"
 *                   firstname:
 *                     type: string
 *                     description: Prénom du patient
 *                     example: "Léonie"
 *                   age:
 *                     type: integer
 *                     description: Age du patient
 *                     example: 21
 *                   email:
 *                     type: string
 *                     description: Adresse email
 *                     example: "leonie124@yahoo.fr"
 *                   phone:
 *                     type: string
 *                     description: Numéro de téléphone
 *                     example: "0645125478"
 *                   address:
 *                     type: array
 *                     description: Adresse complète
 *                     items:
 *                       type: string
 *                     example: ["45 rue de la Lyre","","45125","Châlette-sur-Loing"]
 *                   pathologies:
 *                     type: array
 *                     description: Liste des identifiants de pathologies
 *                     items:
 *                       type: integer
 *                     example: [1,3]
 *                   allergies:
 *                     type: array
 *                     description: Liste des allergies du patient
 *                     items:
 *                       type: string
 *                     example: ["cacahuète","noix"]
 *                   conviction:
 *                     type: array
 *                     description: Liste des identifiants de convictions
 *                     items:
 *                       type: integer
 *                     example: [2]
 *                   history:
 *                     type: string
 *                     description: Historique médical du patient
 *                     example: "infractus à 41 ans"
 *                   other:
 *                     type: string
 *                     description: Informations complémentaires
 *                     example: "nombreux antécédents familiaux"
 *       500:
 *         description: Erreur serveur
 */
router.get("/", getAllPatient);

/**
 * @swagger
 * /patient/all/{id_praticien}:
 *   get:
 *     summary: Récupère tous les patients d'un praticien
 *     description: Retourne la liste des patients associés à un praticien spécifique. Les pathologies et convictions sont retournées sous forme de noms.
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id_praticien
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant du praticien
 *         example: 1
 *     responses:
 *       200:
 *         description: Liste des patients du praticien
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
 *                   lastname:
 *                     type: string
 *                     example: "RICHARD"
 *                   firstname:
 *                     type: string
 *                     example: "Léonie"
 *                   email:
 *                     type: string
 *                     example: "leonie124@yahoo.fr"
 *                   pathologies:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["diabétique"]
 *                   allergies:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["cacahuète"]
 *                   convictions:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["végétarien"]
 *                   history:
 *                     type: string
 *                     example: "infractus à 41 ans"
 *                   other:
 *                     type: string
 *                     example: "antécédents familiaux"
 *       500:
 *         description: Erreur serveur
 */
router.get("/all/:id_praticien", getAllPatientByPraticien);

/**
 * @swagger
 * /patient/{id_patient}:
 *   get:
 *     summary: Récupère un patient par ID
 *     description: Retourne toutes les informations d'un patient spécifique.
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id_patient
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant du patient
 *         example: 5
 *     responses:
 *       200:
 *         description: Patient trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Patient non trouvé
 *         content:
 *           application/json:
 *             example:
 *               message: "Patient non trouvé"
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id_patient", getPatientById);

/**
 * @swagger
 * /patient/{id_patient}/contact:
 *   get:
 *     summary: Récupère les informations de contact d'un patient
 *     description: Retourne uniquement les informations de contact (nom, prénom, age, email, téléphone et adresse).
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id_patient
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Informations de contact du patient
 *         content:
 *           application/json:
 *             example:
 *               lastname: "RICHARD"
 *               firstname: "Léonie"
 *               age: 21
 *               email: "leonie124@yahoo.fr"
 *               phone: "0645125478"
 *               address: ["45 rue de la Lyre","","45125","Châlette-sur-Loing"]
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
 *     summary: Récupère les contraintes médicales d'un patient
 *     description: Retourne les pathologies, allergies, convictions et informations médicales d'un patient.
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id_patient
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Contraintes du patient
 *         content:
 *           application/json:
 *             example:
 *               pathologies: ["diabétique"]
 *               allergies: ["cacahuète"]
 *               convictions: ["végétarien"]
 *               history: "infractus à 41 ans"
 *               other: "antécédents familiaux"
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
 *     summary: Créer un nouveau patient
 *     description: Ajoute un patient dans la base de données. Les pathologies et convictions envoyées sous forme de texte sont converties en identifiants dans la base.
 *     tags:
 *       - Patients
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             id_praticien: 1
 *             lastname: "RICHARD"
 *             firstname: "Léonie"
 *             age: 21
 *             email: "leonie124@yahoo.fr"
 *             phone: "0645125478"
 *             address: ["45 rue de la Lyre","","45125","Châlette-sur-Loing"]
 *             pathologies: ["diabète"]
 *             allergies: ["cacahuète"]
 *             conviction: ["végétarien"]
 *             history: "infractus à 41 ans"
 *             other: "antécédents familiaux"
 *     responses:
 *       201:
 *         description: Patient créé avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post("", createPatient);

/**
 * @swagger
 * /patient/{id_patient}/contact:
 *   put:
 *     summary: Met à jour les informations de contact d'un patient
 *     description: Modifie les informations personnelles d'un patient.
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id_patient
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             lastname: "DUPONT"
 *             firstname: "Jean"
 *             age: 53
 *             email: "jean.dupont@email.fr"
 *             phone: "0600000000"
 *             address: ["12 rue Victor Hugo","","75000","Paris"]
 *     responses:
 *       200:
 *         description: Contact mis à jour
 *       404:
 *         description: Patient non trouvé
 */
router.put("/:id_patient/contact", updateContactPatient);

/**
 * @swagger
 * /patient/{id_patient}/constraint:
 *   put:
 *     summary: Met à jour les contraintes médicales d'un patient
 *     description: Modifie les pathologies, allergies, convictions et historique médical.
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id_patient
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             pathologies: ["diabète"]
 *             allergies: ["pollen"]
 *             conviction: ["végétarien"]
 *             history: "opération du genou"
 *             other: "suivi annuel"
 *     responses:
 *       200:
 *         description: Contraintes mises à jour
 *       404:
 *         description: Patient non trouvé
 */
router.put("/:id_patient/constraint", updateConstraintPatient);

/**
 * @swagger
 * /patient/{id_patient}:
 *   delete:
 *     summary: Supprime un patient
 *     description: Supprime définitivement un patient de la base de données.
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id_patient
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: Patient supprimé
 *         content:
 *           application/json:
 *             example:
 *               message: "Patient supprimé"
 *       404:
 *         description: Patient non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete("/:id_patient", deletePatient);

module.exports = router;
