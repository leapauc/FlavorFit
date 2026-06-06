DROP TABLE IF EXISTS recipe_ingredients CASCADE;
DROP TABLE IF EXISTS recipes;
CREATE TABLE recipes as (
SELECT * from recipes_wk
where id_recipe not in
(SELECT distinct id_recipe FROM public.recipe_ingredients_wk
where unit_g is null or id_ingredient is null));
ALTER TABLE recipes
ADD CONSTRAINT recipes_ready_pkey PRIMARY KEY (id_recipe);

CREATE TABLE recipe_ingredients (
    id SERIAL PRIMARY KEY, id_recipe INTEGER NOT NULL,
    id_ingredient INTEGER NOT NULL, ingredient TEXT NOT NULL,
    quantity NUMERIC, unit TEXT, unit_g NUMERIC NOT NULL,
    CONSTRAINT fk_recipe FOREIGN KEY (id_recipe) REFERENCES recipes(id_recipe) ON DELETE CASCADE
);

INSERT INTO recipe_ingredients
(id_recipe, id_ingredient, ingredient, quantity, unit, unit_g)
SELECT ri.id_recipe, ri.id_ingredient, ri.ingredient, ri.quantity,
    ri.unit, ri.unit_g
FROM recipe_ingredients_wk ri
INNER JOIN recipes r
    ON r.id_recipe = ri.id_recipe;

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id_recipe FROM recipes LOOP
        PERFORM update_recipe_nutrition(r.id_recipe);
    END LOOP;
END;
$$;

DELETE FROM recipes
WHERE title = 'Faire stériliser un foie gras';