const pool = require("../db");

exports.loginPraticien = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérification des champs
    if (!email || !password) {
      return res.status(400).json({
        message: "Email et mot de passe requis",
      });
    }

    // Vérifier email + mot de passe directement
    const result = await pool.query(
      `
      SELECT * 
      FROM praticiens
      WHERE email = $1 
        AND password_hash = crypt($2, password_hash)
      `,
      [email, password],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect",
      });
    }

    const praticien = result.rows[0];

    // Mise à jour de la dernière connexion
    await pool.query(
      `
      UPDATE praticiens
      SET last_conn = NOW()
      WHERE id_praticien = $1
      `,
      [praticien.id_praticien],
    );

    // Réponse succès (sans JWT si tu veux simple)
    res.status(200).json({
      message: "Connexion réussie",
      praticien,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur",
    });
  }
};
