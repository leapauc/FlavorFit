select * from recipes 
where id_recipe  not in (select distinct id_recipe from recipe_ingredients
where id_ingredient is null)