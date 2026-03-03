with recipes as (select * from recipes_wk
where id_recipe not in (select distinct id_recipe from recipe_ingredients_wk
where unit_g is null))
SELECT 
    categorie,
    COUNT(*) AS nb_occurrences
FROM recipes
GROUP BY categorie;


select * from recipes_wk
where id_recipe not in (select distinct id_recipe from recipe_ingredients_wk
where unit_g is null)