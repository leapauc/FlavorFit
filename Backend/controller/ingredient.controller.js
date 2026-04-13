const pool = require("../db");

exports.getAllGroups = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT distinct alim_grp_nom_fr FROM ingredients",
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
exports.getAllIngredientForAGroup = async (req, res) => {
  const { alim_grp_nom_fr } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT id_ingredient,alim_ssgrp_nom_fr,alim_ssssgrp_nom_fr,alim_nom_fr
      FROM ingredients
      WHERE alim_grp_nom_fr = $1
      ORDER BY alim_nom_fr
      `,
      [alim_grp_nom_fr],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
exports.getAllDistinctIngredient = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT distinct id_ingredient, alim_grp_nom_fr,alim_ssgrp_nom_fr,alim_ssssgrp_nom_fr,
      split_part(alim_nom_fr,',',1) as alim_nom_fr
      FROM ingredients
      `,
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getMeasuringContener = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT distinct name,weight FROM contener",
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getIngredientUnitWeight = async (req, res) => {
  const { id_ingredient } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM get_ingredient_unit_weight($1)",
      [id_ingredient],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Ingrédient non trouvé" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
