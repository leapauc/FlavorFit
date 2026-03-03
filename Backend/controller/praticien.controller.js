const pool = require("../db");

// -------------------------
// GET all praticiens
// -------------------------
exports.getAllPraticien = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM praticiens ORDER BY id_praticien"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// -------------------------
// GET praticien by ID
// -------------------------
exports.getPraticienById = async (req, res) => {
  const { id_praticien } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM praticiens WHERE id_praticien = $1",
      [id_praticien]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Praticien non trouvé" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// -------------------------
// POST create praticien
// -------------------------
exports.createPraticien = async (req, res) => {
  const { lastname, firstname, email, password_hash, phone } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO praticiens (lastname, firstname, email, password_hash, phone)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [lastname, firstname, email, password_hash, phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    if (err.code === "23505") {
      // unique_violation
      return res.status(400).json({ error: "Email déjà utilisé" });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// -------------------------
// PUT update praticien
// -------------------------
exports.updatePraticien = async (req, res) => {
  const { id_praticien } = req.params;
  const { lastname, firstname, email, password_hash, phone } = req.body;
  try {
    const result = await pool.query(
      `UPDATE praticiens 
       SET lastname=$1, firstname=$2, email=$3, password_hash=$4, phone=$5
       WHERE id_praticien=$6
       RETURNING *`,
      [lastname, firstname, email, password_hash, phone, id_praticien]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Praticien non trouvé" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// -------------------------
// DELETE praticien
// -------------------------
exports.deletePraticien = async (req, res) => {
  const { id_praticien } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM praticiens WHERE id_praticien=$1 RETURNING *",
      [id_praticien]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Praticien non trouvé" });
    }
    res.json({ message: "Praticien supprimé", praticien: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
