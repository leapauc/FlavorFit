-- ID = 1
UPDATE recipe_ingredients_wk
SET ingredient_ciqual = 'Crème 12 à 25% MG, légère, semi-épaisse, UHT',
	id_ingredient = 2011
WHERE id_recipe = 1  and ingredient = 'crème fraiche fraîche';
UPDATE recipe_ingredients_wk
SET ingredient_ciqual = 'Bouillon de volaille, déshydraté',
	id_ingredient = 2920
WHERE id_recipe = 1  and ingredient = 'bouillon de poule';
UPDATE recipe_ingredients_wk
SET ingredient = 'sel',
	quantity = 1,
	unit = 'pincée'
WHERE id_recipe = 1  and ingredient = 'sel et poivre';
INSERT INTO recipe_ingredients_wk (id_recipe,ingredient,quantity,unit)
VALUES (1,'poivre',1,'pincée');
UPDATE recipe_ingredients_wk
SET ingredient_ciqual = 'Beurre à 80% MG minimum, doux',
	id_ingredient = 2734
WHERE id_recipe = 1  and ingredient = 'beurre doux';
UPDATE recipe_ingredients_wk
SET ingredient_ciqual = 'Veau, viande, cuite (aliment moyen)',
	id_ingredient = 912
WHERE id_recipe = 1  and ingredient = 'blanquette de veau';

-- ID = 2
UPDATE recipe_ingredients_wk
SET ingredient_ciqual = 'Vin doux',
	id_ingredient = 2293
WHERE id_recipe = 2  and ingredient = 'sauterne';

-- ID = 3
UPDATE recipe_ingredients_wk
SET ingredient = 'marc de Bourgogne',
	ingredient_ciqual = 'Vin rouge',
	id_ingredient = 2299
WHERE id_recipe = 3 and ingredient = 'marc';
UPDATE recipe_ingredients_wk
SET ingredient_ciqual = 'Vin rouge',
	id_ingredient = 2299
WHERE id_recipe = 3 and ingredient = 'bourgogne';
UPDATE recipe_ingredients_wk
SET ingredient_ciqual = 'Sel marin gris, non iodé, non fluoré',
	quantity = 1,
	unit = 'pincée',
	id_ingredient = 2946
WHERE id_recipe = 3 and ingredient = 'gros sel';
UPDATE recipe_ingredients_wk
SET ingredient_ciqual = 'Epice (aliment moyen)',
	unit = 'bouquet',
	id_ingredient = 2968
WHERE id_recipe = 3 and ingredient = 'bouquet garni';
UPDATE recipe_ingredients_wk
SET quantity = 25,
	unit = 'g'
WHERE id_recipe = 3 and ingredient = 'farine de blé tendre ou froment T65';

-- ID = 4
UPDATE recipe_ingredients_wk
SET quantity = 10,
	unit = 'g'
WHERE id_recipe = 4 and ingredient = 'coriandre';
UPDATE recipe_ingredients_wk
SET quantity = 1
WHERE id_recipe = 4 and ingredient = 'citron';
UPDATE recipe_ingredients_wk
SET quantity = 1,
	unit = 'gousse'
WHERE id_recipe = 4 and ingredient = 'ail';
UPDATE recipe_ingredients_wk
SET quantity = 1,
	unit = 'cuillère à soupe'
WHERE id_recipe = 4 and ingredient = 'sauce soja';
UPDATE recipe_ingredients_wk
SET quantity = 1,
	unit = 'cuillère à soupe'
WHERE id_recipe = 4 and ingredient = 'huile d''olive';
UPDATE recipe_ingredients_wk
SET ingredient_ciqual = 'Poulet, filet sans peau grillé/poêlé',
	id_ingredient = 930
WHERE id_recipe = 4 and ingredient = 'blanc de poulet';

-- ID = 5
UPDATE recipe_ingredients_wk
SET ingredient_ciqual = 'Amidon de maïs ou fécule de maïs',
	id_ingredient = 836
WHERE id_recipe = 5 and ingredient = 'maïzena';
UPDATE recipe_ingredients_wk
SET quantity = 1,
	unit = 'pincée'
WHERE id_recipe = 5 and ingredient = 'clou de girofle';
UPDATE recipe_ingredients_wk
SET quantity = 1,
	unit = 'cuillère à café'
WHERE id_recipe = 5 and ingredient = 'miel';
UPDATE recipe_ingredients_wk
SET quantity = 1,
	unit = 'pincée'
WHERE id_recipe = 5 and ingredient = 'sel blanc';
UPDATE recipe_ingredients_wk
SET quantity = 1,
	unit = 'cuillère à café'
WHERE id_recipe = 5 and ingredient = 'cannelle';
UPDATE recipe_ingredients_wk
SET quantity = 1,
	unit = 'pincée'
WHERE id_recipe = 5 and ingredient = 'poivre';

-- ID = 6
DELETE FROM recipe_ingredients_wk
WHERE id_recipe = 6 and ingredient = 'madère';
UPDATE recipe_ingredients_wk
SET unit = 'kg'
WHERE id_recipe=6 and ingredient = 'chevreuil';
UPDATE recipe_ingredients_wk
SET quantity = 1,
	unit = 'cuillère à soupe'
WHERE id_recipe=6 and ingredient = 'huile d''olive';

-- ID = 7
UPDATE recipe_ingredients_wk
SET ingredient_ciqual = 'Crème 12 à 25% MG, légère, semi-épaisse, UHT',
	id_ingredient = 2011
WHERE id_recipe = 7  and ingredient = 'crème fraiche fraîche';
UPDATE recipe_ingredients_wk
SET ingredient_ciqual = 'Bouillon de volaille, déshydraté',
	id_ingredient = 2920,
	quantity = 0.25,
	unit = 'cube'
WHERE id_recipe = 7  and ingredient = 'bouillon de poule';
UPDATE recipe_ingredients_wk
SET quantity = 1
WHERE id_recipe = 7 and ingredient = 'citron';
UPDATE recipe_ingredients_wk
SET quantity = 1,
	unit = 'pincée'
WHERE id_recipe = 7 and ingredient = 'poivre';
UPDATE recipe_ingredients_wk
SET quantity = 25,
	unit = 'g'
WHERE id_recipe = 7 and ingredient = 'farine de blé tendre ou froment T65';
UPDATE recipe_ingredients_wk
SET ingredient_ciqual = 'Veau, viande, cuite (aliment moyen)',
	id_ingredient = 912
WHERE id_recipe = 7  and ingredient = 'blanquette de veau';
UPDATE recipe_ingredients_wk
SET quantity = 1,
	unit = 'pincée'
WHERE id_recipe = 7 and ingredient = 'sel blanc';
UPDATE recipe_ingredients_wk
SET ingredient_ciqual = 'Bouillon de légumes, déshydraté',
	id_ingredient = 2911,
	quantity = 0.25,
	unit = 'cube'
WHERE id_recipe = 7  and ingredient = 'bouillon de légumes';

-- ID = 8
UPDATE recipe_ingredients_wk
SET quantity = 0.25,
	unit = 'cube'
WHERE id_recipe = 8  and ingredient = 'bouillon de volaille';
UPDATE recipe_ingredients_wk
SET quantity = 1,
	unit = 'pincée'
WHERE id_recipe = 8 and ingredient = 'poivre';
UPDATE recipe_ingredients_wk
SET unit = 'kg'
WHERE id_recipe = 8 and ingredient = 'tomates cerise';
UPDATE recipe_ingredients_wk
SET quantity = 0.5,
	unit = 'g'
WHERE id_recipe = 8 and ingredient = 'feuille de laurier';

-- ID = 9
UPDATE recipe_ingredients_wk
SET quantity = 1,
	unit = 'pincée'
WHERE id_recipe = 9 and ingredient = 'sel blanc';
UPDATE recipe_ingredients_wk
SET quantity = 1,
	unit = 'pincée'
WHERE id_recipe = 9 and ingredient = 'poivre';
UPDATE recipe_ingredients_wk
SET quantity = 1,
	unit = 'cuillère à café'
WHERE id_recipe = 9 and ingredient = 'thym';
UPDATE recipe_ingredients_wk
SET unit = 'cuillère à soupe'
WHERE id_recipe = 9 and ingredient = 'huile d''olive';

-- ID = 10



-- ID = 3

-- SELECT distinct r.id_recipe, r.title FROM public.recipe_ingredients_wk ri
-- join recipes_wk r on r.id_recipe = ri.id_recipe
-- where unit_g is null or id_ingredient is null
-- order by id_recipe;