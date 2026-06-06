DROP TABLE IF EXISTS recipe_ingredients_libre_;

CREATE TABLE recipe_ingredients_libre_ AS
SELECT 
    id,
    portions,
    unnest(string_to_array(ingredients, ' | ')) AS ingredient,
    NULL AS ing,
    NULL AS quantity,
    NULL AS unit,
    NULL AS ingredient_ciqual,
    NULL AS id_ingredient,
    NULL AS weight_g
FROM recipes_libre;

UPDATE recipe_ingredients_libre_
SET
    quantity   = regexp_replace(ingredient, '^\s*((?:\/\d+)|(\d+[.,\/]?\d*)|½|⅓|⅔|¼|\d+\sà\s\d+|\d+\s\(?ou\s\d+\)?)\s*(?:[-–]\s*)?\s*(g |boîte |poignées|poignée |pincée |càc|cc|càs|kg|ml |cl |verre|verres|gousse |gousses|bouquet|litre |litres|l |cuillerée à soupe|c. soupe |c\. à café|c\. à soupe|cs |tasse |tasses|bol|c. café||c.café||c.à thé|c.soupe|petite boite|cube |bottes|botte|brins|branche |pointe |paquet |morceau |cuillères à soupe|cuillères à café)?\s*(.*)$', '\1'),
    unit       = regexp_replace(ingredient, '^\s*((?:\/\d+)|(\d+[.,\/]?\d*)|½|⅓|⅔|¼|\d+\sà\s\d+|\d+\s\(?ou\s\d+\)?)\s*(?:[-–]\s*)?\s*(g |boîte |poignées|poignée |pincée |càc|cc|càs|kg|ml |cl |verre|verres|gousse |gousses|bouquet|litre |litres|l |cuillerée à soupe|c. soupe |c\. à café|c\. à soupe|cs |tasse |tasses|bol|c. café||c.café||c.à thé|c.soupe|petite boite|cube |bottes|botte|brins|branche |pointe |paquet |morceau |cuillères à soupe|cuillères à café)?\s*(.*)$', '\3'),
    ing = regexp_replace(ingredient, '^\s*((?:\/\d+)|(\d+[.,\/]?\d*)|½|⅓|⅔|¼|\d+\sà\s\d+|\d+\s\(?ou\s\d+\)?)\s*(?:[-–]\s*)?\s*(g |boîte |poignées|poignée |pincée |càc|cc|càs|kg|ml |cl |verre|verres|gousse |gousses|bouquet|litre |litres|l |cuillerée à soupe|c. soupe |c\. à café|c\. à soupe|cs |tasse |tasses|bol|c. café||c.café||c.à thé|c.soupe|petite boite|cube |bottes|botte|brins|branche |pointe |paquet |morceau |cuillères à soupe|cuillères à café)?\s*(.*)$', '\4')
where ingredient ~ '^\s*((?:\/\d+)|(\d+[.,\/]?\d*)|½|⅓|⅔|¼|\d+\sà\s\d+|\d+\s\(?ou\s\d+\)?)\s*(?:[-–]\s*)?\s*(g |boîte |poignées|poignée |pincée |càc|cc|càs|kg|ml |cl |verre|verres|gousse |gousses|bouquet|litre |litres|l |cuillerée à soupe|c. soupe |c\. à café|c\. à soupe|cs |tasse |tasses|bol|c. café||c.café||c.à thé|c.soupe|petite boite|cube |bottes|botte|brins|branche |pointe |paquet |morceau |cuillères à soupe|cuillères à café)?\s*(.*)$';

update recipe_ingredients_libre_ ril 
set ing = regexp_replace(ing,'^(de |d''|du |des |le |quelques )','')
where ing ~ '^(de |d''|du |des |le |quelques ).*$';

update recipe_ingredients_libre_ ril 
set ing = regexp_replace(ing,'(.*)\s\(.*\)','\1')
where ing ~ '(.*)\s\(.*\)';


---
CREATE TABLE recipe_ingredients_libre AS
SELECT
  t.id, t.portions, t.ingredient,
  trim(valeur) AS ing,
  t.quantity, t.unit, t.ingredient_ciqual,
  t.id_ingredient, t.weight_g
FROM recipe_ingredients_libre_ t
CROSS JOIN LATERAL regexp_split_to_table(
  lower(trim(ingredient)),
  '\s*(,|et|&)\s*'
) AS valeur
WHERE lower(trim(ingredient)) ~ '^sel\s*(,|et|&)\s*poivre$'
UNION ALL
SELECT
  t.id, t.portions, t.ingredient,
  t.ing,
  t.quantity, t.unit, t.ingredient_ciqual,
  t.id_ingredient, t.weight_g
FROM recipe_ingredients_libre_ t
WHERE lower(trim(ingredient)) !~ '^sel\s*(,|et|&)\s*poivre$';


---
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