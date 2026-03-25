const pool = require("../db");

const getPathologyIds = async (names = []) => {
  if (!names.length) return [];

  const { rows } = await pool.query(
    `SELECT id_pathology FROM pathologies WHERE name = ANY($1)`,
    [names],
  );

  return rows.map((r) => r.id_pathology);
};

const getConvictionIds = async (names = []) => {
  if (!names.length) return [];

  const { rows } = await pool.query(
    `SELECT id_conviction FROM convictions WHERE name = $1`,
    [names],
  );

  return rows.map((r) => r.id_conviction);
};

const getRestrictionIds = async (names = []) => {
  if (!names.length) return [];

  const { rows } = await pool.query(
    `SELECT id_restriction FROM restrictions WHERE name = $1`,
    [names],
  );

  return rows.map((r) => r.id_restriction);
};

// -------------------------
// GET Tous les patients
// -------------------------
exports.getAllPatient = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM patients");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// -------------------------
// GET Tous les patients d'un praticien
// -------------------------
exports.getAllPatientByPraticien = async (req, res) => {
  const { id_praticien } = req.params;
  try {
    const result = await pool.query(
      `SELECT   
        id_patient,p.lastname,p.firstname,p.email,
          ARRAY_REMOVE(ARRAY_AGG(DISTINCT pa.name), NULL) AS pathologies,
          p.allergies,
          ARRAY_REMOVE(ARRAY_AGG(DISTINCT c.name), NULL) AS convictions,
          p.history,
          p.other
      FROM patients p
      -- Jointure pour pathologies
      LEFT JOIN pathologies pa ON pa.id_pathology = ANY(p.pathologies)
      -- Jointure pour convictions
      LEFT JOIN convictions c ON c.id_conviction = ANY(p.conviction)
      WHERE id_praticien = $1
      GROUP BY p.id_patient, p.allergies, p.history, p.other
      ORDER BY p.lastname, p.firstname`,
      [id_praticien],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// -------------------------
// GET Patient par ID
// -------------------------
exports.getPatientById = async (req, res) => {
  const { id_patient } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM patients WHERE id_patient = $1",
      [id_patient],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Patient non trouvé" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// -------------------------
// GET Contact patient par ID
// -------------------------
exports.getContactPatientById = async (req, res) => {
  const { id_patient } = req.params;
  try {
    const result = await pool.query(
      `SELECT lastname, firstname, age, email, phone, address
       FROM patients
       WHERE id_patient = $1`,
      [id_patient],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Patient non trouvé" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// -------------------------
// GET Contrainte patient par ID
// -------------------------
exports.getConstraintPatientById = async (req, res) => {
  const { id_patient } = req.params;
  try {
    const result = await pool.query(
      `SELECT   
          ARRAY_REMOVE(ARRAY_AGG(DISTINCT pa.name), NULL) AS pathologies,
          p.allergies,
          ARRAY_REMOVE(ARRAY_AGG(DISTINCT c.name), NULL) AS convictions,
          p.history,
          p.other
      FROM patients p
      -- Jointure pour pathologies
      LEFT JOIN pathologies pa ON pa.id_pathology = ANY(p.pathologies)
      -- Jointure pour convictions
      LEFT JOIN convictions c ON c.id_conviction = ANY(p.conviction)
      WHERE id_patient = $1
      GROUP BY p.id_patient, p.allergies, p.history, p.other
      ORDER BY p.lastname, p.firstname;`,
      [id_patient],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Patient non trouvé" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// -------------------------
// POST Créer un patient
// -------------------------
exports.createPatient = async (req, res) => {
  const {
    id_praticien,
    lastname,
    firstname,
    age,
    email,
    phone,
    address,
    pathologies, // ex: ['diabète de type 1', 'obésité']
    allergies,
    conviction, // ex: ['végan'] ou 'végan'
    history,
    other,
  } = req.body;

  try {
    /* =========================
       1️⃣ Conversion pathologies
       ========================= */
    let pathologyIds = null;

    if (Array.isArray(pathologies) && pathologies.length > 0) {
      const pathologyResult = await pool.query(
        `SELECT id_pathology
         FROM pathologies
         WHERE name = ANY($1::text[])`,
        [pathologies],
      );

      pathologyIds = pathologyResult.rows.map((r) => r.id_pathology);
    }

    /* =========================
       2️⃣ Conversion convictions
       ========================= */
    let convictionIds = null;

    const convictionArray =
      typeof conviction === "string" ? [conviction] : conviction;

    if (Array.isArray(convictionArray) && convictionArray.length > 0) {
      const convictionResult = await pool.query(
        `SELECT id_conviction
         FROM convictions
         WHERE name = ANY($1::text[])`,
        [convictionArray],
      );

      convictionIds = convictionResult.rows.map((r) => r.id_conviction);
    }

    /* =========================
       3️⃣ INSERT patient
       ========================= */
    const result = await pool.query(
      `INSERT INTO patients
      (id_praticien, lastname, firstname, age, email, phone, address,
       pathologies, allergies, conviction, history, other)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        id_praticien,
        lastname,
        firstname,
        age,
        email,
        phone,
        address,
        pathologyIds,
        allergies,
        convictionIds,
        history,
        other,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// -------------------------
// PUT Mettre à jour contact patient
// -------------------------
exports.updateContactPatient = async (req, res) => {
  const { id_patient } = req.params;
  const { lastname, firstname, age, email, phone, address } = req.body;
  try {
    const result = await pool.query(
      `UPDATE patients
       SET lastname=$1, firstname=$2, age=$3, email=$4, phone=$5, address=$6
       WHERE id_patient=$7
       RETURNING *`,
      [lastname, firstname, age, email, phone, address, id_patient],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Patient non trouvé" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// -------------------------
// PUT Mettre à jour contrainte patient
// -------------------------
exports.updateConstraintPatient = async (req, res) => {
  const { id_patient } = req.params;
  const { pathologies, allergies, conviction, history, other } = req.body;

  try {
    const pathologyIds = await getPathologyIds(pathologies);
    const convictionIds = await getConvictionIds(conviction);

    const result = await pool.query(
      `UPDATE patients
       SET pathologies = $1,
           allergies = $2,
           conviction = $3,
           history = $4,
           other = $5
       WHERE id_patient = $6
       RETURNING *`,
      [
        pathologyIds.length ? pathologyIds : null,
        allergies?.length ? allergies : null,
        convictionIds.length ? convictionIds : null,
        history ?? null,
        other ?? null,
        id_patient,
      ],
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// -------------------------
// DELETE Supprimer un patient
// -------------------------
exports.deletePatient = async (req, res) => {
  const { id_patient } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM patients WHERE id_patient=$1 RETURNING *",
      [id_patient],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Patient non trouvé" });
    res.json({ message: "Patient supprimé", patient: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
