CREATE OR REPLACE FUNCTION get_ingredient_unit_weight(
    p_id_ingredient INT
)
RETURNS TABLE (
    id_ingredient INT,
    ingredient TEXT,
    alim_grp_nom_fr TEXT,
    alim_ssgrp_nom_fr TEXT,
    poids_unitaire FLOAT,
    statut TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id_ingredient,
        i.alim_nom_fr::TEXT,
        i.alim_grp_nom_fr::TEXT,
        i.alim_ssgrp_nom_fr::TEXT,

        CASE
            -- LÉGUMES / FRUITS
            WHEN i.alim_ssgrp_nom_fr ILIKE '%légume%'
              OR i.alim_ssgrp_nom_fr ILIKE '%fruit%'
            THEN wlf.g_weight

            -- VIANDES / POISSONS / ŒUFS
            WHEN i.alim_grp_nom_fr ILIKE 'viandes, oeufs, poissons'
            THEN wmfa.g_weight

            ELSE NULL
        END AS poids_unitaire,

        CASE
            WHEN (
                i.alim_ssgrp_nom_fr ILIKE '%légume%'
                OR i.alim_ssgrp_nom_fr ILIKE '%fruit%'
            ) AND wlf.id IS NULL
                THEN 'POIDS NON RÉFÉRENCÉ (LÉGUME / FRUIT)'

            WHEN i.alim_grp_nom_fr ILIKE 'viandes, oeufs, poissons'
                 AND wmfa.id IS NULL
                THEN 'POIDS NON RÉFÉRENCÉ (VIANDE / POISSON / ŒUF)'

            WHEN i.alim_ssgrp_nom_fr ILIKE '%légume%'
              OR i.alim_ssgrp_nom_fr ILIKE '%fruit%'
              OR i.alim_grp_nom_fr ILIKE 'viandes, oeufs, poissons'
                THEN 'OK'

            ELSE 'CATÉGORIE NON GÉRÉE'
        END AS statut

    FROM ingredients i
    LEFT JOIN weight_legume_fruit wlf
        ON LOWER(split_part(i.alim_nom_fr, ',', 1)) = LOWER(wlf.name)
        OR LOWER(split_part(i.alim_nom_fr, ',', 1)) = LOWER(wlf.pluriel)

    LEFT JOIN weight_meat_fish_egg wmfa
        ON LOWER(i.alim_nom_fr) = LOWER(wmfa.name)
        OR LOWER(i.alim_nom_fr) = LOWER(wmfa.pluriel)

    WHERE i.id_ingredient = p_id_ingredient;
END;
$$;


CREATE OR REPLACE FUNCTION update_recipe_nutrition(p_recipe_id INTEGER)
RETURNS VOID AS $$
DECLARE
    v_servings NUMERIC;
    v_kcal NUMERIC DEFAULT 0;
    v_kj NUMERIC DEFAULT 0;
    v_proteine NUMERIC DEFAULT 0;
    v_lipide NUMERIC DEFAULT 0;
    v_glucide NUMERIC DEFAULT 0;
    v_sugar NUMERIC DEFAULT 0;
    v_fiber NUMERIC DEFAULT 0;
    v_salt NUMERIC DEFAULT 0;
    v_ag NUMERIC DEFAULT 0;
    v_cholesterol NUMERIC DEFAULT 0;
BEGIN
    -- Récupérer le nombre de portions
    SELECT proportion INTO v_servings FROM recipes WHERE id_recipe = p_recipe_id;

    -- Calculer la nutrition totale à partir des ingrédients
    SELECT
        SUM((i.energie_kcal * ri.unit_g) / (100 * v_servings)),
        SUM((i.energie_kj * ri.unit_g) / (100 * v_servings)),
        SUM((i.proteines_g * ri.unit_g) / (100 * v_servings)),
        SUM((i.lipides_g * ri.unit_g) / (100 * v_servings)),
        SUM((i.glucides_g * ri.unit_g) / (100 * v_servings)),
        SUM((i.sucres_g * ri.unit_g) / (100 * v_servings)),
        SUM((i.fibres_g * ri.unit_g) / (100 * v_servings)),
        SUM((i.sel_g * ri.unit_g) / (100 * v_servings)),
        SUM((i.ag_satures_g * ri.unit_g) / (100 * v_servings)),
        SUM((i.cholesterol_g * ri.unit_g) / (100 * v_servings))
    INTO
        v_kcal, v_kj, v_proteine, v_lipide, v_glucide, v_sugar, v_fiber, v_salt, v_ag, v_cholesterol
    FROM recipe_ingredients ri
    JOIN ingredients i ON ri.id_ingredient = i.id_ingredient
    WHERE ri.id_recipe = p_recipe_id;

    -- Mettre à jour la recette avec les valeurs calculées
    UPDATE recipes SET
        kcal = COALESCE(ROUND(v_kcal::numeric, 2), 0),
        kj = COALESCE(ROUND(v_kj::numeric, 2), 0),
        proteine = COALESCE(ROUND(v_proteine::numeric, 2), 0),
        lipide = COALESCE(ROUND(v_lipide::numeric, 2), 0),
        glucide = COALESCE(ROUND(v_glucide::numeric, 2), 0),
        sugar = COALESCE(ROUND(v_sugar::numeric, 2), 0),
        fiber = COALESCE(ROUND(v_fiber::numeric, 2), 0),
        salt = COALESCE(ROUND(v_salt::numeric, 2), 0),
        ag = COALESCE(ROUND(v_ag::numeric, 2), 0),
        cholesterol = COALESCE(ROUND(v_cholesterol::numeric, 2), 0)
    WHERE id_recipe = p_recipe_id;
END;
$$ LANGUAGE plpgsql;


