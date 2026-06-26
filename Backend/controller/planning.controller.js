const pool = require("../db");

// -------------------------
// GET Planning de tous les patients par ID
// -------------------------
exports.getAllPlanningPatientById = async (req, res) => {
  const { id_patient } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM planning WHERE id_patient = $1",
      [id_patient],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// -------------------------
// GET Planning spécifique par ID de planning et patient
// -------------------------
exports.getPlanningByIdPatientById = async (req, res) => {
  const { id_patient, id_planning } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM planning WHERE id_patient = $1 AND id_planning = $2",
      [id_patient, id_planning],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Planning non trouvé" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// controller/planning.controller.js
exports.getPlanningDetailsById = async (req, res) => {
  try {
    const { id_planning } = req.params;

    if (!id_planning || isNaN(id_planning)) {
      return res.status(400).json({ error: "ID planning invalide" });
    }

    // 1️⃣ Récupérer le planning
    const planningResult = await pool.query(
      `SELECT id_planning, id_patient, start_day, nb_people
       FROM planning
       WHERE id_planning = $1`,
      [id_planning],
    );

    if (planningResult.rows.length === 0) {
      return res.status(404).json({ error: "Planning non trouvé" });
    }

    const planning = planningResult.rows[0];

    // 2️⃣ Récupérer les recettes
    const recipesResult = await pool.query(
      `SELECT pr.meal_day, pr.meal_time, r.id_recipe, r.title
       FROM planning_recipes pr
       JOIN recipes_wk r ON r.id_recipe = pr.id_recipe
       WHERE pr.id_planning = $1`,
      [id_planning],
    );

    // 3️⃣ Structure standard
    const daysOfWeek = [
      "Jour1",
      "Jour2",
      "Jour3",
      "Jour4",
      "Jour5",
      "Jour6",
      "Jour7",
    ];

    const meals = ["Midi", "Dîner"];

    const details = {};

    daysOfWeek.forEach((day) => {
      details[day] = {};
      meals.forEach((meal) => {
        details[day][meal] = null;
      });
    });

    // 4️⃣ Normalisation
    const normalizeDay = (day) => {
      if (!day) return null;
      return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
    };

    const normalizeMeal = (meal) => {
      if (!meal) return null;
      const m = meal.toLowerCase();
      if (m === "midi") return "Midi";
      if (m === "dîner" || m === "diner") return "Dîner";
      return null;
    };

    recipesResult.rows.forEach((row) => {
      const day = normalizeDay(row.meal_day);
      const meal = normalizeMeal(row.meal_time);

      if (!day || !meal) return;
      if (!details[day]) return;

      details[day][meal] = {
        id: row.id_recipe,
        title: row.title,
      };
    });

    return res.json({
      ...planning,
      details,
    });
  } catch (err) {
    console.error("❌ ERREUR DETAILS PLANNING :", err);
    return res.status(500).json({
      error: "Erreur serveur",
      message: err.message,
    });
  }
};

exports.createPlanningPatientById = async (req, res) => {
  const { id_patient } = req.params;
  const { startDate, nbPeople, planning } = req.body;

  try {
    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({ error: "Date de début invalide" });
    }

    // 2️⃣ Insérer dans la table planning
    const result = await pool.query(
      `INSERT INTO planning (id_patient, start_day, nb_people) VALUES ($1, $2, $3) RETURNING id_planning`,
      [id_patient, start.toISOString(), nbPeople],
    );

    const id_planning = result.rows[0].id_planning;

    // 2️⃣ Préparer les inserts dans planning_recipes
    const inserts = [];
    for (const [day, meals] of Object.entries(planning)) {
      for (const [mealTime, recipe] of Object.entries(meals)) {
        if (recipe) {
          inserts.push(
            pool.query(
              `INSERT INTO planning_recipes (id_planning, id_recipe, meal_day, meal_time) VALUES ($1, $2, $3, $4)`,
              [id_planning, recipe.id, day, mealTime.toLowerCase()],
            ),
          );
        }
      }
    }

    await Promise.all(inserts);

    res.status(201).json({ message: "Planning saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.updatePlanningById = async (req, res) => {};

exports.deletePlanningById = async (req, res) => {
  try {
    const { id_planning } = req.params;

    if (!id_planning || isNaN(id_planning)) {
      return res.status(400).json({ error: "ID planning invalide" });
    }

    const deleteResult = await pool.query(
      "DELETE FROM planning WHERE id_planning = $1 RETURNING *",
      [id_planning],
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: "Planning non trouvé" });
    }

    return res.json({ message: "Planning supprimé" });
  } catch (err) {
    console.error("❌ ERREUR SUPPRESSION PLANNING :", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.generateShoppingList = async (req, res) => {
  try {
    const { recipeIds } = req.body;

    if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
      return res.status(400).json({ error: "recipeIds requis" });
    }

    const result = await pool.query(
      `
      SELECT 
        i.alim_grp_nom_fr AS group_name,
        i.alim_nom_fr AS ingredient_name,
        SUM(ri.unit_g) AS total_g
      FROM recipe_ingredients ri
      JOIN ingredients i 
        ON i.id_ingredient = ri.id_ingredient
      WHERE ri.id_recipe = ANY($1)
      GROUP BY i.alim_grp_nom_fr, i.alim_nom_fr
      ORDER BY i.alim_grp_nom_fr, i.alim_nom_fr
      `,
      [recipeIds],
    );

    // Formatage par groupe
    const grouped = {};

    result.rows.forEach((row) => {
      const group = row.group_name || "Autres";

      if (!grouped[group]) {
        grouped[group] = [];
      }

      grouped[group].push({
        name: row.ingredient_name,
        quantity_g: Math.round(row.total_g),
      });
    });

    res.json(grouped);
  } catch (err) {
    console.error("SHOPPING LIST ERROR →", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
