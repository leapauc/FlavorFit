const pool = require("../db");

exports.getPathologies = async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT pt.name as type, STRING_AGG(p.name,', ') 
        FROM pathologies p
        JOIN pathologies_type pt ON pt.id_pathology_type = p.id_type
        GROUP BY pt.name, pt.id_pathology_type
        ORDER BY pt.id_pathology_type;`);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getConvictions = async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT name
        FROM convictions
        ORDER BY name;`);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getRestrictions = async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT name
        FROM restrictions
        ORDER BY name;`);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getIngredients = async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT ingredient
        FROM ciqual_table
        ORDER BY ingredient;`);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getFruitVegetableWeight = async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT name,g_weight
        FROM weight_legume_fruit
        ORDER BY name;`);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
exports.getMeatFishEggWeight = async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT name,animal,img,g_weight
        FROM weight_meat_fish_egg
        ORDER BY name;`);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
