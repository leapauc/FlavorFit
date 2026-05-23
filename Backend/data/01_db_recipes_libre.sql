DROP TABLE IF EXISTS recipe_ingredients_libre;

CREATE TABLE recipe_ingredients_libre AS
SELECT 
    id,
    portions,
    unnest(string_to_array(ingredients, ' | ')) AS ingredient,
    NULL AS quantity,
    NULL AS unit,
    NULL AS ingredient_ciqual,
    NULL AS id_ingredient,
    NULL AS weight_g
FROM recipes_libre;

UPDATE recipe_ingredients_libre
SET
    quantity   = regexp_replace(ingredient, '^\s*((\d+[.,\/]?\d*)|½)\s*( g | boîte | poignées | poignée | pincée | càc | cc | càs | kg | ml | cl | verre | verres | gousse | gousses | bouquet | litres | litre | l | cuillerée à soupe | c\. à café | c\. à soupe | c\. café | c\. soupe | tasses | tasse | bol ).*$', '\1'),
    unit       = regexp_replace(ingredient, '^\s*((\d+[.,\/]?\d*)|½)\s*( g | boîte | poignées | poignée | pincée | càc | cc | càs | kg | ml | cl | verre | verres | gousse | gousses | bouquet | litres | litre | l | cuillerée à soupe | c\. à café | c\. à soupe | c\. café | c\. soupe | tasses | tasse | bol ).*$', '\3'),
    ingredient = regexp_replace(ingredient, '^\s*((\d+[.,\/]?\d*)|½)\s*( g | boîte | poignées | poignée | pincée | càc | cc | càs | kg | ml | cl | verre | verres | gousse | gousses | bouquet | litres | litre | l | cuillerée à soupe | c\. à café | c\. à soupe | c\. café | c\. soupe | tasses | tasse | bol )\s*(.*)$', '\4')
WHERE ingredient ~ '^\s*((\d+[.,\/]?\d*)|½)\s*( g | boîte | poignées | poignée | pincée | càc | cc | càs | kg | ml | cl | verre | verres | gousse | gousses | bouquet | litres | litre | l | cuillerée à soupe | c\. à café | c\. à soupe | c\. café | c\. soupe | tasses | tasse | bol )';



UPDATE recipe_ingredients_libre ri
SET
    ingredient_ciqual = i.alim_nom_fr,
    id_ingredient = i.id_ingredient
FROM ingredients i
WHERE ri.ingredient_ciqual IS NULL
  AND LOWER(i.alim_nom_fr) LIKE LOWER(ri.ingredient) || ',%';
UPDATE recipe_ingredients_libre ri
SET
    ingredient_ciqual = i.alim_nom_fr||' - 2',
    id_ingredient = i.id_ingredient
FROM ingredients i
WHERE ri.ingredient_ciqual IS NULL 
  AND LOWER(i.alim_nom_fr) LIKE LOWER(ri.ingredient) || ' %,%';

UPDATE recipe_ingredients_libre ri
SET
    ingredient_ciqual = i.alim_nom_fr||' - 3',
    id_ingredient = i.id_ingredient
FROM ingredients i
WHERE ri.ingredient_ciqual IS NULL
  AND LOWER(i.alim_nom_fr) LIKE LOWER(ri.ingredient) || '%';

UPDATE recipe_ingredients_libre ri
SET
    ingredient_ciqual = i.alim_nom_fr||' - 4',
    id_ingredient = i.id_ingredient
FROM ingredients i
WHERE ri.ingredient_ciqual IS NULL
  AND LOWER(i.alim_nom_fr) LIKE '%' || LOWER(ri.ingredient) || '%';

--WITH best_match AS (
--    SELECT DISTINCT ON (ri.id_recipe, ri.ingredient)
--        ri.id_recipe,
--        ri.ingredient,
--        i.id_ingredient,
--        i.alim_nom_fr,
--        similarity(LOWER(ri.ingredient), LOWER(i.alim_nom_fr)) AS score
--    FROM recipe_ingredients_libre ri
--    JOIN ingredients i
--      ON similarity(LOWER(ri.ingredient), LOWER(i.alim_nom_fr)) > 0.45
--    WHERE ri.ingredient_ciqual IS NULL
--    ORDER BY ri.id_recipe, ri.ingredient, score DESC
--)
--UPDATE recipe_ingredients_libre ri
--SET
--   ingredient_ciqual = bm.alim_nom_fr||' - 5',
--    id_ingredient = bm.id_ingredient
--FROM best_match bm
--WHERE ri.id_recipe = bm.id_recipe
--  AND ri.ingredient = bm.ingredient;