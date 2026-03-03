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
