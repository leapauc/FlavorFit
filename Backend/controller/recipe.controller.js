const pool = require("../db");

exports.getAllRecipe = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM recipes");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
exports.getRecipeById = async (req, res) => {
  const { id_recipe } = req.params; // id passé dans l'URL

  try {
    const result = await pool.query(
      "SELECT * FROM recipes WHERE id_recipe = $1",
      [id_recipe], // paramètre sécurisé pour éviter l'injection SQL
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
exports.getAllInfoRecipeById = async (req, res) => {
  const { id_recipe } = req.params;

  try {
    // 1️⃣ Récupérer la recette
    const recipeResult = await pool.query(
      "SELECT * FROM recipes WHERE id_recipe = $1",
      [id_recipe],
    );

    if (recipeResult.rows.length === 0) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }
    const recipe = recipeResult.rows[0];

    // 2️⃣ Récupérer les ingrédients liés
    const ingredientsResult = await pool.query(
      `SELECT 
      ri.ingredient AS name,
      ri.quantity,
      ri.unit,
      i.alim_grp_nom_fr,
      i.alim_ssgrp_nom_fr
   FROM recipe_ingredients ri
   LEFT JOIN ingredients i
     ON ri.ingredient = i.alim_nom_fr
   WHERE ri.id_recipe = $1`,
      [id_recipe],
    );

    const ingredients = ingredientsResult.rows; // tableau d'objets { name, quantity, unit }

    // 3️⃣ Retourner le payload complet
    res.json({
      id_praticien: recipe.created_by,
      title: recipe.title,
      categorie: recipe.categorie,
      servings: recipe.proportion,
      prepTime: recipe.time_prepa,
      difficulty: recipe.difficulty,
      price: recipe.price,
      ecoscore: recipe.ecoscore,
      kcal: recipe.kcal,
      proteine: recipe.proteine,
      lipide: recipe.lipide,
      glucide: recipe.glucide,
      sugar: recipe.sugar,
      fiber: recipe.fiber,
      salt: recipe.salt,
      ag: recipe.ag,
      cholesterol: recipe.cholesterol,
      url: recipe.lien,
      description: recipe.description,
      ingredients: ingredients,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getRecipeByPraticien = async (req, res) => {
  const { id_praticien } = req.params; // id passé dans l'URL

  try {
    const result = await pool.query(
      "SELECT * FROM recipes WHERE created_by = $1",
      [id_praticien], // paramètre sécurisé pour éviter l'injection SQL
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Aucune recette trouvée" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
/*{
  "id_praticien": 3,
  "title": "Lasagnes maison",
  "category": "Viande",
  "servings": 4,
  "prepTime": 45,
  "difficulty": "moyenne",
  "price": "moyen",
  "ecoscore": "ecoscore b",
  "url": "",
  "ingredients": [
    { "name": "Boeuf, entrecôte, partie maigre grillée/poêlée", "quantity": 300, "unit": "g" },
    { "name": "Tomate grappe, crue", "quantity": 200, "unit": "g" },
    { "name": "Mélange de fromages râpés (ex : spécial gratins, spécial pâtes, spécial pizzas…)", "quantity": 150, "unit": "g" }
  ]
}*/
exports.createRecipe = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const {
      id_praticien,
      title,
      categorie,
      servings,
      prepTime,
      difficulty,
      price,
      ecoscore,
      url,
      description,
      ingredients,
    } = req.body;
    if (!title || !Array.isArray(ingredients) || !ingredients.length)
      throw new Error("Titre et ingrédients obligatoires");
    const createdBy = id_praticien;

    // 🔒 LOCK TABLE pour éviter les doublons sur MAX(id_recipe)+1
    await client.query("LOCK TABLE recipes IN EXCLUSIVE MODE");

    // ✅ Calculer le prochain ID unique
    const maxRes = await client.query(
      "SELECT COALESCE(MAX(id_recipe),0) + 1 AS nextId FROM recipes",
    );
    const recipeId = maxRes.rows[0].nextid;

    // INSERT recette avec ID forcé
    await client.query(
      `INSERT INTO recipes (id_recipe,title,lien,categorie,proportion,time_prepa,difficulty,price,ecoscore,created_by,description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        recipeId,
        title,
        url || null,
        categorie,
        servings,
        prepTime,
        difficulty,
        price,
        ecoscore,
        createdBy,
        description || null,
      ],
    );

    // INIT nutrition
    const nutrition = {
      kcal: 0,
      kj: 0,
      proteine: 0,
      lipide: 0,
      glucide: 0,
      sugar: 0,
      fiber: 0,
      salt: 0,
      ag: 0,
      cholesterol: 0,
    };

    // BOUCLE ingrédients
    for (const { name, quantity, unit, unit_g } of ingredients) {
      if (!name || !quantity || !unit_g) continue;

      const qtyG = unit_g;

      const r = await client.query(
        `SELECT id_ingredient,energie_kcal,energie_kj,proteines_g,lipides_g,
            glucides_g,sucres_g,fibres_g,sel_g,ag_satures_g,cholesterol_g
     FROM ingredients WHERE alim_nom_fr ILIKE '%' || $1 || '%' LIMIT 1`,
        [name],
      );

      if (!r.rows.length) continue;
      const i = r.rows[0];

      // CALCUL NUTRITION
      nutrition.kcal += Math.round((i.energie_kcal * qtyG) / (100 * servings));
      nutrition.kj += Math.round((i.energie_kj * qtyG) / (100 * servings));
      nutrition.proteine += (i.proteines_g * qtyG) / (100 * servings);
      nutrition.lipide += (i.lipides_g * qtyG) / (100 * servings);
      nutrition.glucide += (i.glucides_g * qtyG) / (100 * servings);
      nutrition.sugar += (i.sucres_g * qtyG) / (100 * servings);
      nutrition.fiber += (i.fibres_g * qtyG) / (100 * servings);
      nutrition.salt += (i.sel_g * qtyG) / (100 * servings);
      nutrition.ag += (i.ag_satures_g * qtyG) / (100 * servings);
      nutrition.cholesterol += (i.cholesterol_g * qtyG) / (100 * servings);

      await client.query(
        `INSERT INTO recipe_ingredients
     (id_recipe,id_ingredient,ingredient,quantity,unit,unit_g)
     VALUES ($1,$2,$3,$4,$5,$6)`,
        [recipeId, i.id_ingredient, name, quantity, unit, unit_g],
      );
    }

    for (let key in nutrition) {
      nutrition[key] = Number(nutrition[key].toFixed(2));
    }

    // UPDATE nutrition
    await client.query(
      `UPDATE recipes SET kcal=$1,kj=$2,proteine=$3,lipide=$4,glucide=$5,sugar=$6,fiber=$7,salt=$8,ag=$9,cholesterol=$10
       WHERE id_recipe=$11`,
      [
        nutrition.kcal,
        nutrition.kj,
        nutrition.proteine,
        nutrition.lipide,
        nutrition.glucide,
        nutrition.sugar,
        nutrition.fiber,
        nutrition.salt,
        nutrition.ag,
        nutrition.cholesterol,
        recipeId,
      ],
    );

    await client.query("COMMIT");
    res.status(201).json({ id_recipe: recipeId, nutrition });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("CREATE RECIPE ERROR →", e);
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
};

exports.updateRecipe = async (req, res) => {
  const client = await pool.connect();
  const recipeId = Number(req.params.id_recipe);

  try {
    await client.query("BEGIN");

    const {
      title,
      categorie,
      servings,
      prepTime,
      difficulty,
      price,
      ecoscore,
      url,
      description,
      ingredients,
    } = req.body;

    if (
      !recipeId ||
      !title ||
      !Array.isArray(ingredients) ||
      !ingredients.length
    ) {
      throw new Error("Données recette invalides");
    }

    await client.query(
      `UPDATE recipes
       SET title=$1,
           lien=$2,
           categorie=$3,
           proportion=$4,
           time_prepa=$5,
           difficulty=$6,
           price=$7,
           ecoscore=$8,
           description=$9
       WHERE id_recipe=$10`,
      [
        title,
        url || null,
        categorie,
        servings,
        prepTime,
        difficulty,
        price,
        ecoscore,
        description || null,
        recipeId,
      ],
    );

    await client.query(`DELETE FROM recipe_ingredients WHERE id_recipe=$1`, [
      recipeId,
    ]);

    const nutrition = {
      kcal: 0,
      kj: 0,
      proteine: 0,
      lipide: 0,
      glucide: 0,
      sugar: 0,
      fiber: 0,
      salt: 0,
      ag: 0,
      cholesterol: 0,
    };

    for (const { name, quantity, unit, unit_g } of ingredients) {
      if (!name || !quantity || !unit_g) continue;

      const qtyG = unit_g;

      const r = await client.query(
        `SELECT id_ingredient,energie_kcal,energie_kj,proteines_g,lipides_g,
            glucides_g,sucres_g,fibres_g,sel_g,ag_satures_g,cholesterol_g
     FROM ingredients
     WHERE alim_nom_fr ILIKE '%' || $1 || '%'
     LIMIT 1`,
        [name],
      );

      if (!r.rows.length) continue;
      const i = r.rows[0];

      nutrition.kcal += Math.round((i.energie_kcal * qtyG) / (100 * servings));
      nutrition.kj += Math.round((i.energie_kj * qtyG) / (100 * servings));
      nutrition.proteine += (i.proteines_g * qtyG) / (100 * servings);
      nutrition.lipide += (i.lipides_g * qtyG) / (100 * servings);
      nutrition.glucide += (i.glucides_g * qtyG) / (100 * servings);
      nutrition.sugar += (i.sucres_g * qtyG) / (100 * servings);
      nutrition.fiber += (i.fibres_g * qtyG) / (100 * servings);
      nutrition.salt += (i.sel_g * qtyG) / (100 * servings);
      nutrition.ag += (i.ag_satures_g * qtyG) / (100 * servings);
      nutrition.cholesterol += (i.cholesterol_g * qtyG) / (100 * servings);

      await client.query(
        `INSERT INTO recipe_ingredients
     (id_recipe,id_ingredient,ingredient,quantity,unit,unit_g)
     VALUES ($1,$2,$3,$4,$5,$6)`,
        [recipeId, i.id_ingredient, name, quantity, unit, unit_g],
      );
    }

    for (let key in nutrition) {
      nutrition[key] = Number(nutrition[key].toFixed(2));
    }

    await client.query(
      `UPDATE recipes
       SET kcal=$1,kj=$2,proteine=$3,lipide=$4,glucide=$5,
           sugar=$6,fiber=$7,salt=$8,ag=$9,cholesterol=$10
       WHERE id_recipe=$11`,
      [
        nutrition.kcal,
        nutrition.kj,
        nutrition.proteine,
        nutrition.lipide,
        nutrition.glucide,
        nutrition.sugar,
        nutrition.fiber,
        nutrition.salt,
        nutrition.ag,
        nutrition.cholesterol,
        recipeId,
      ],
    );

    await client.query("COMMIT");

    res.json({
      message: "Recette mise à jour avec succès",
      nutrition,
    });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("UPDATE RECIPE ERROR →", e);
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
};

exports.deleteRecipe = async (req, res) => {
  const { id_recipe } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Supprimer les ingrédients liés
    await client.query("DELETE FROM recipe_ingredients WHERE id_recipe = $1", [
      id_recipe,
    ]);

    // 2️⃣ Supprimer la recette
    const result = await client.query(
      "DELETE FROM recipes WHERE id_recipe = $1 RETURNING *",
      [id_recipe],
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Recette non trouvée" });
    }

    await client.query("COMMIT");

    res.json({
      message: "Recette et ses ingrédients supprimés avec succès",
      deletedRecipe: result.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("DELETE RECIPE ERROR →", err);
    res.status(500).json({ error: "Erreur serveur" });
  } finally {
    client.release();
  }
};

exports.getCategoryRecipe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT categorie
       FROM recipes
       WHERE categorie IS NOT NULL
       ORDER BY categorie`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
exports.getDifficultyLevel = async (req, res) => {
  try {
    const result = await pool.query("SELECT distinct difficulty FROM recipes");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
exports.getPriceLevel = async (req, res) => {
  try {
    const result = await pool.query("SELECT distinct price FROM recipes");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
exports.getEcoscoreLevel = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT distinct ecoscore FROM recipes where ecoscore != '-' order by ecoscore",
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getFilteredRecipe = async (req, res) => {
  try {
    const excludedIngredients = Array.isArray(req.body.excludedIngredients)
      ? req.body.excludedIngredients
      : [];

    // Si aucun ingrédient à exclure, retourne toutes les recettes
    if (excludedIngredients.length === 0) {
      const result = await pool.query("SELECT * FROM recipes order by title");
      return res.json(result.rows);
    }

    const query = `
      SELECT r.*
      FROM recipes r
      WHERE NOT EXISTS (
        SELECT 1
        FROM recipe_ingredients ri
        WHERE ri.id_recipe = r.id_recipe
          AND EXISTS (
            SELECT 1
            FROM unnest($1::varchar[]) AS excl
            WHERE unaccent(lower(ri.ingredient))
                  LIKE '%' || unaccent(lower(excl)) || '%'
          )
      )
      ORDER BY r.title;`;

    const result = await pool.query(query, [excludedIngredients]);

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// exports.generateAutoRecipePlanning = async (req, res) => {
//   try {
//     // Récupère le payload envoyé depuis le frontend
//     const { excludedIngredients, mealsToPlan } = req.body;

//     if (!mealsToPlan || typeof mealsToPlan !== "object") {
//       return res
//         .status(400)
//         .json({ error: "Paramètre mealsToPlan manquant ou invalide" });
//     }

//     const planning = {};

//     // Parcours chaque jour
//     for (const day of Object.keys(mealsToPlan)) {
//       planning[day] = {};

//       // Parcours chaque repas
//       for (const meal of Object.keys(mealsToPlan[day])) {
//         if (mealsToPlan[day][meal]) {
//           // Requête pour récupérer 1 recette aléatoire qui respecte les exclusions
//           const query = `
//             SELECT r.id_recipe, r.title
//             FROM recipes r
//             WHERE NOT EXISTS (
//               SELECT 1
//               FROM recipe_ingredients ri, unnest($1::varchar[]) AS excl
//               WHERE ri.id_recipe = r.id_recipe
//                 AND unaccent(upper(ri.ingredient)) ILIKE '%' || unaccent(upper(excl)) || '%'
//             )
//             ORDER BY random()
//             LIMIT 1
//           `;
//           const result = await pool.query(query, [excludedIngredients || []]);

//           planning[day][meal] = result.rows[0]
//             ? { id: result.rows[0].id_recipe, title: result.rows[0].title }
//             : null; // pas de recette disponible
//         } else {
//           planning[day][meal] = null; // repas non prévu
//         }
//       }
//     }

//     res.json(planning);
//   } catch (err) {
//     console.error("Erreur generateAutoRecipePlanning:", err.message);
//     res.status(500).json({ error: "Erreur serveur" });
//   }
// };

exports.generateAutoRecipePlanning = async (req, res) => {
  try {
    const { excludedIngredients, mealsToPlan, convictions, restrictions } =
      req.body;

    if (!mealsToPlan || typeof mealsToPlan !== "object") {
      return res
        .status(400)
        .json({ error: "Paramètre mealsToPlan manquant ou invalide" });
    }

    // 1️⃣ Récupérer tous les ingrédients à exclure (noms)
    let allExcludedIngredientNames = [...(excludedIngredients || [])];

    // Ajouter les ingrédients des convictions
    if (convictions && convictions.length > 0) {
      const convictionQuery = `
        SELECT unnest(ingredients_toavoid) AS ingredient_name
        FROM convictions
        WHERE name = ANY($1)
      `;
      const convictionResult = await pool.query(convictionQuery, [convictions]);
      const convictionNames = convictionResult.rows.map(
        (row) => row.ingredient_name,
      );
      allExcludedIngredientNames = [
        ...allExcludedIngredientNames,
        ...convictionNames,
      ];
    }

    // Ajouter les ingrédients des restrictions
    if (restrictions && restrictions.length > 0) {
      const restrictionQuery = `
        SELECT unnest(ingredients_toavoid) AS ingredient_name
        FROM restrictions
        WHERE name = ANY($1)
      `;
      const restrictionResult = await pool.query(restrictionQuery, [
        restrictions,
      ]);
      const restrictionNames = restrictionResult.rows.map(
        (row) => row.ingredient_name,
      );
      allExcludedIngredientNames = [
        ...allExcludedIngredientNames,
        ...restrictionNames,
      ];
    }

    // Supprimer les doublons
    allExcludedIngredientNames = [...new Set(allExcludedIngredientNames)];

    // 2️⃣ Générer le planning
    const planning = {};
    for (const day of Object.keys(mealsToPlan)) {
      planning[day] = {};
      for (const meal of Object.keys(mealsToPlan[day])) {
        if (mealsToPlan[day][meal]) {
          const query = `
            SELECT r.id_recipe, r.title
            FROM recipes r
            WHERE NOT EXISTS (
              SELECT 1
              FROM recipe_ingredients ri
              WHERE ri.id_recipe = r.id_recipe
                AND EXISTS (
                  SELECT 1
                  FROM unnest($1::varchar[]) AS excl
                  WHERE unaccent(lower(ri.ingredient))
                        LIKE '%' || unaccent(lower(excl)) || '%'
                )
            )
            ORDER BY random()
            LIMIT 1
          `;
          const result = await pool.query(query, [allExcludedIngredientNames]);
          planning[day][meal] = result.rows[0]
            ? { id: result.rows[0].id_recipe, title: result.rows[0].title }
            : null;
        } else {
          planning[day][meal] = null;
        }
      }
    }

    res.json(planning);
  } catch (err) {
    console.error("Erreur generateAutoRecipePlanning:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
