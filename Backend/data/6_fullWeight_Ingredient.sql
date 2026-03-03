---------------------------------------------------
-- LEGUME - FRUIT
---------------------------------------------------
UPDATE recipe_ingredients_wk ri
SET unit_g = ri.quantity * w.g_weight
FROM weight_legume_fruit w
WHERE TRIM(LOWER(split_part(ri.ingredient_ciqual, ',', 1)))
      = TRIM(LOWER(w.name));


---------------------------------------------------
-- VIANDE - POISSON - OEUF
---------------------------------------------------
UPDATE recipe_ingredients_wk ri
SET unit_g = ri.quantity * w.g_weight
FROM weight_meat_fish_egg w
WHERE LOWER(ri.ingredient_ciqual)
      ilike TRIM(LOWER(w.name))||'%';


--------------------
update recipe_ingredients_wk
set unit_g = quantity
where unit = 'g' and quantity != unit_g