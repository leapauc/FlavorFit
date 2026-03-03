const pool = require("../db");

/**
 * Créer un RDV
 */
exports.createAppointment = async (req, res) => {
  try {
    const { id_praticien, id_patient, date_appointment, duration, notes } =
      req.body;

    if (!id_praticien || !id_patient || !date_appointment) {
      return res.status(400).json({
        message: "id_praticien, id_patient et date_appointment requis",
      });
    }

    const result = await pool.query(
      `INSERT INTO appointments
       (id_praticien, id_patient, date_appointment, duration, notes)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [id_praticien, id_patient, date_appointment, duration || 60, notes],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur création RDV" });
  }
};

/**
 * Modifier un RDV
 */
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date_appointment, duration, notes } = req.body;

    const result = await pool.query(
      `UPDATE appointments
       SET date_appointment = $1,
           duration = $2,
           notes = $3
       WHERE id_appointment = $4
       RETURNING *`,
      [date_appointment, duration, notes, id],
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "RDV non trouvé" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur modification RDV" });
  }
};

/**
 * Supprimer un RDV
 */
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM appointments
       WHERE id_appointment = $1
       RETURNING *`,
      [id],
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "RDV non trouvé" });

    res.json({ message: "RDV supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur suppression RDV" });
  }
};

/**
 * Liste des RDV par praticien
 */
exports.getByPraticien = async (req, res) => {
  try {
    const { id_praticien } = req.params;

    const result = await pool.query(
      `SELECT a.*, p.firstname, p.lastname
       FROM appointments a
       JOIN patients p ON a.id_patient = p.id_patient
       WHERE a.id_praticien = $1
       ORDER BY date_appointment`,
      [id_praticien],
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur récupération RDV" });
  }
};

/**
 * Récupérer un RDV par ID
 */
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM appointments WHERE id_appointment = $1`,
      [id],
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "RDV non trouvé" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur récupération RDV" });
  }
};

exports.getByPatient = async (req, res) => {
  try {
    const { id_patient } = req.params;

    const result = await pool.query(
      `SELECT * FROM appointments WHERE id_patient = $1`,
      [id_patient],
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Aucun RDV trouvé" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur récupération RDV" });
  }
};
