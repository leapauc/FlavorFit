DROP TABLE IF EXISTS recipe_ingredients_libre;

CREATE TABLE recipe_ingredients_libre AS
SELECT 
    id,
    portions,
    unnest(string_to_array(ingredients, ' | ')) AS ingredient,
    NULL AS quantity,
    NULL AS unit,
    NULL AS ingredient_ciqual,
    NULL AS weight_g
FROM recipes_libre;

UPDATE recipe_ingredients_libre
SET
    quantity   = regexp_replace(ingredient, '^\s*((\d+[.,\/]?\d*)|½)\s*( g | poignées | pincée | càc | cc | càs | kg | ml | cl | verre | verres | gousse | gousses | bouquet | litres | litre | l | c\. à café | c\. à soupe | c\. café | c\. soupe | tasses | tasse | bol ).*$', '\1'),
    unit       = regexp_replace(ingredient, '^\s*((\d+[.,\/]?\d*)|½)\s*( g | poignées | pincée | càc | cc | càs | kg | ml | cl | verre | verres | gousse | gousses | bouquet | litres | litre | l | c\. à café | c\. à soupe | c\. café | c\. soupe | tasses | tasse | bol ).*$', '\2'),
    ingredient = regexp_replace(ingredient, '^\s*((\d+[.,\/]?\d*)|½)\s*( g | poignées | pincée | càc | cc | càs | kg | ml | cl | verre | verres | gousse | gousses | bouquet | litres | litre | l | c\. à café | c\. à soupe | c\. café | c\. soupe | tasses | tasse | bol )\s*(.*)$', '\3')
WHERE ingredient ~ '^\s*((\d+[.,\/]?\d*)|½)\s*( g | poignées | pincée | càc | cc | càs | kg | ml | cl | verre | verres | gousse | gousses | bouquet | litres | litre | l | c\. à café | c\. à soupe | c\. café | c\. soupe | tasses | tasse | bol )';