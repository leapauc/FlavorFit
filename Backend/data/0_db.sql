DROP DATABASE IF EXISTS flavorfit;
CREATE DATABASE flavorfit;


CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
CREATE EXTENSION IF NOT EXISTS unaccent;

DROP TABLE IF EXISTS patients;
-- PRATICIENS
DROP TABLE IF EXISTS praticiens;
CREATE TABLE praticiens (
    id_praticien SERIAL PRIMARY KEY,
    lastname VARCHAR(100),
    firstname VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255),
    phone VARCHAR(20),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_conn TIMESTAMP DEFAULT NULL,
    admin BOOLEAN
);
INSERT INTO praticiens (lastname,firstname,email,password_hash,phone,admin)
VALUES ('PAUCHOT','Léa','lea.pauchot@gmail.com',crypt('123456789', gen_salt('bf')),'0642956148',True),
       ('DUPOND','Monique','monique.dupond@gmail.com',crypt('123456789', gen_salt('bf')),'0645125478',False),
       ('NZENGUE','Amith','anzngue@gmail.com',crypt('password', gen_salt('bf')),'0754258038',False);

-- PATHOLOGIES
DROP TABLE IF EXISTS pathologies;
DROP TABLE IF EXISTS pathologies_type;
CREATE TABLE pathologies_type (
    id_pathology_type SERIAL PRIMARY KEY,
    name TEXT
);
INSERT INTO pathologies_type (name)
VALUES ('diabètes'),('obésité - surpoids'),('dyslipidémie'),('toubles endocriniens'),('pathologies digestives fonctionnelles'),
       ('maladies inflammatoires chroniques de l''intestin'),('autres pathologies digestives'),('pathologies hépato-biliaires'),
       ('pathologies cardiovasculaires'),('pathologies rénales et urinaires'),--('intolérances'),('allergies'),
       ('maladies auto-immunes'),('cancers'),('gériatrie'),('troubles du comportement alimentaire'),('neurologie');

CREATE TABLE pathologies (
    id_pathology SERIAL PRIMARY KEY,
    name TEXT,
    id_type INTEGER,
    specificity TEXT[],
    FOREIGN KEY (id_type) REFERENCES pathologies_type(id_pathology_type) ON DELETE CASCADE
);
INSERT INTO pathologies (name,id_type,specificity)
VALUES ('diabète de type 1',1,ARRAY['pauvre en glucide']::text[]),
       ('diabète de type 2',1,ARRAY['pas de glucide']::text[]),
       ('diabète gestationnel',1,ARRAY['pas de glucide']::text[]),
       ('obésité',2,ARRAY['protéine','déficit calorique']::text[]),
       ('surpoids',2,ARRAY['protéine','déficit calorique']::text[]),
       ('hypercholestérolémie',3,ARRAY['pauvre en graisse saturée','fibre','pauvre en alcool']::text[]),
       ('hypertriglycéridémie',3,ARRAY['pauvre en graisse saturée','fibre','pauvre en alcool']::text[]),
       ('dyslipidémie',3,ARRAY['pauvre en graisse saturée','fibre','pauvre en alcool']::text[]),
       ('hyperthyroïdie',4,ARRAY['non inflamatoire','pauvre en sucre']::text[]),
       ('hypothyroïdie',4,ARRAY['non inflamatoire','pauvre en sucre']::text[]),
       ('SPOK',4,ARRAY['non inflamatoire','pauvre en sucre']::text[]),
       ('syndrome de l''intestin irritable',5,ARRAY['pauvre en FODMAP','riche en fibre']::text[]),
       ('ballonnements fonctionnels',5,ARRAY['pauvre en FODMAP','riche en fibre']::text[]),
       ('constipation chronique',5,ARRAY['pauvre en FODMAP','riche en fibre']::text[]),
       ('diarrhée chronique',5,ARRAY['pauvre en FODMAP','riche en fibre']::text[]),
       ('maladie de Crohn',6,null),
       ('rectocolite hémorragique',6,null),
       ('reflux gastro-oesophagien',7,null),
       ('diverticulose',7,ARRAY['pauvre en graisse']::text[]),
       ('pancréatique chronique',7,null),
       ('insuffisance pancréatique',7,null),
       ('stéatose hépatique',8,ARRAY['pauvre en alcool','protéine','lipide']::text[]),
       ('cirrhose',8,ARRAY['pauvre en alcool','protéine','lipide']::text[]),
       ('hépatites chroniques',8,ARRAY['pauvre en alcool','protéine','lipide']::text[]),
       ('cholestase',8,ARRAY['pauvre en alcool','protéine','lipide']::text[]),
       ('lithiase biliaire',8,ARRAY['pauvre en alcool','protéine','lipide']::text[]),
       ('hypertension artérielle',9,ARRAY['pauvre en sel','hydratation','régime méditerrannéen']::text[]),
       ('maladie coronarienne',9,ARRAY['pauvre en sel','hydratation','régime méditerrannéen']::text[]),
       ('insuffisance cardiaque',9,ARRAY['pauvre en sel','hydratation','régime méditerrannéen']::text[]),
       ('athérosclérose',9,ARRAY['pauvre en sel','hydratation','régime méditerrannéen']::text[]),
       ('AVC',9,ARRAY['pauvre en sel','hydratation','régime méditerrannéen']::text[]),
       ('insuffisance rénale chronique',10,ARRAY['protéine','phosphore','potassium','pauvre en purines']::text[]),
       ('dialyse',10,ARRAY['protéine','phosphore','potassium','pauvre en purines']::text[]),
       ('calculs rénaux',10,ARRAY['protéine','phosphore','potassium','pauvre en purines']::text[]),
       ('hyperuricémie',10,ARRAY['protéine','phosphore','potassium','pauvre en purines']::text[]),
       ('maladie coeliaque',11,ARRAY['sans gluten','anti-inflamatoire']::text[]),
       ('arthrose',11,ARRAY['sans gluten','anti-inflamatoire']::text[]),
       ('polyarthtite rhumatoïde',11,ARRAY['sans gluten','anti-inflamatoire']::text[]),
       ('thyroïdite de Hashimoto',11,ARRAY['sans gluten','anti-inflamatoire']::text[]),
       ('cancers',12,ARRAY['hyperprotéinique','hyperénergétique']::text[]),
       ('anorexie mentale',14,ARRAY['hyperénergétique']::text[]),
       ('boulimie',14,null),
       ('hyperphagie boulimique',14,null),
       ('orthorexie',14,null),
       ('épilepsie',15,ARRAY['cétogène']::text[]),
       ('dépression',15,ARRAY['cétogène']::text[]),
       ('troubles cognifis',15,ARRAY['cétogène']::text[]),
       ('parkinson',15,ARRAY['cétogène']::text[]);

DROP TABLE IF EXISTS convictions;
CREATE TABLE convictions (
    id_conviction SERIAL PRIMARY KEY,
    name TEXT
);
INSERT INTO convictions(name)
VALUES ('végan'),('végétarien'),('cétogène'),('pesco-végétarien');


-- PATIENTS
CREATE TABLE patients (
    id_patient SERIAL PRIMARY KEY,
    id_praticien INT,
    lastname VARCHAR(100) NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    age INT,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT[] NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pathologies INTEGER[],
    allergies TEXT[],
    conviction INTEGER[],
    history TEXT,
    other TEXT,
    FOREIGN KEY (id_praticien) REFERENCES praticiens(id_praticien) ON DELETE CASCADE
);
INSERT INTO patients (id_praticien,lastname,firstname,age,email,phone,address,pathologies,allergies,conviction,history,other)
VALUES (2,'RICHARD','Léonie',21,'leonie124@yahoo.fr','0645125478',ARRAY['45 rue de la Lyre','','45125','Châlette-sur-Loing'],null,ARRAY['cacahuète', 'noix'],null,null,null),
       (2,'DEVELAY','Lucas',45,'develay.lucas@gmail.com','0648125348',ARRAY['26 rue de la Croix Biche','','93160','Noisy-le-Grand'],ARRAY[1],null,ARRAY[2],null,null),
       (2,'ALLALOU','Hanane',75,'hanane.allalou@orange.fr','0740325648',ARRAY['35 rue Pierre Brosolette','','93160','Noisy-le-Grand'],null,ARRAY['concombre','morue','huître'],null,'problèmes cardiaques',null),
       (3,'BEN','Dominique',31,'dominique-ben@orange.fr','0785641520',ARRAY['2 rue du Docteur Sureau','','93160','Noisy-le-Grand'],ARRAY[4],ARRAY['pollen'],null,null,null),
       (2,'PAUCHOT','Léa',35,'lea.pauchot@yahoo.fr','0632501538',ARRAY['6 avenue de Victor Hugo','','93250','Villemomble'],ARRAY[27],null,ARRAY[4],null,null),
       (3,'MANOUKIAN','Yvette',45,'yvette.manou@gmail.com','0678542368',ARRAY['29 rue de la Croix Biche','','93160','Noisy-le-Grand'],null,null,ARRAY[2],'infractus à 41 ans',null),
       (2,'AKHENAT','Amed',76,'amed_akhenat3@yahoo.fr','012546385',ARRAY['6 boulevard Souchet','','93160','Noisy-le-Grand'],ARRAY[36],null,null,null,'nombreux antécédents familiaux de problèmes de coagulation'),
       (3,'BENIFIO','Carla',31,'benifio-manakia.carla@orange.fr','0625431850',ARRAY['7 rue minerve','','95050','Cergy-Pontoise'],null,ARRAY['carotte','framboise','sans gluten'],null,null,null),
       (2,'PAUCHET','Amina',35,'amina.pauchoet@gmail.com','0665897523',ARRAY['48 avenue des garches','7ème étage','77480','Grisy sur Seine'],ARRAY[31],ARRAY['noisette','amande','cacahuète'],null,null,null);


----------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS recipe_ingredients_wk_wk;
-- RECETTES
DROP TABLE IF EXISTS recipes_wk;
CREATE TABLE recipes_wk (
    id_recipe SERIAL PRIMARY KEY,
    title TEXT,
    lien TEXT,
    categorie VARCHAR,
    kcal INT,
    kj INT,
    proteine FLOAT,
    lipide FLOAT,
    glucide FLOAT,
    sugar FLOAT,
    fiber FLOAT,
    salt FLOAT,
    ag FLOAT,
    cholesterol FLOAT,
    proportion INT,
    time_prepa INT,
    difficulty TEXT,
    price TEXT,
    ecoscore TEXT, 
    created_by INT
);

\COPY recipes_wk (title,lien,categorie,kcal,kj,proteine,lipide,glucide
    sugar,fiber,salt,ag,cholesterol,proportion,time_prepa,difficulty,price,ecoscore)
FROM '/files/recettes_clean.csv'
DELIMITER ';'
CSV HEADER;

ALTER TABLE recipes_wk
ADD COLUMN description TEXT[];

-- INGREDIENTS
DROP TABLE IF EXISTS ingredients;
CREATE TABLE ingredients (
    id_ingredient SERIAL PRIMARY KEY,
    alim_grp_code varchar,alim_ssgrp_code varchar,alim_ssssgrp_code varchar,alim_grp_nom_fr varchar,	
    alim_ssgrp_nom_fr varchar,alim_ssssgrp_nom_fr varchar,alim_code varchar,alim_nom_fr varchar,alim_nom_sci varchar,	
    energie_kj float,energie_kcal float,energie_jones_kj float,energie_jones_kcal float,	
    eau_g float,proteines_jones_g float,proteines_g float,glucides_g float,lipides_g float,
    sucres_g float,fructose_g float,galactose_g float,glucose_g float,lactose_g float,maltose_g float,saccharose_g float,
    amidon_g float,fibres_g float,polyols_totaux_g float,cendres_g float,alcool_g float,	
    acides_organiques_g float,ag_satures_g float,ag_monoinsatures_g float,ag_polyinsatures_g float,	
    ag_4_butyrique_g float,ag_6_caproique_g float,ag_8_caprylique_g float,ag_10_caprique_g float,ag_12_laurique_g float,	
    ag_14_myristique_g float,ag_16_palmitique_g float,ag_18_stearique_g float,ag_18_1_oleique_g float,ag_18_2_linoleique_g float,	
    ag_18_3_alpha_linolenique_g float,ag_20_4_arachidonique_g float,ag_20_5_epa_g float,ag_22_6_dha_g float,
    cholesterol_g float,sel_g float,calcium_mg float,chlorure_mg float,cuivre_mg float,fer_mg float,iode_microg float,
    magnesium_mg float,	manganese_mg float,phosphore_mg float,potassium_mg float,selenium_microg float,sodium_mg float,
    zinc_mg float,vitamine_a_microg float,retinol_microg float,beta_carotene_microg float,vitamine_d_microg float,	
    vitamine_d2_microg float,vitamine_d3_microg float,alpha_tocopherol_mg float,vitamine_e_mg float,vitamine_k1_microg float,
    vitamine_k2_microg float,vitamine_c_mg float,vitamine_b1_mg float,vitamine_b2_mg float,vitamine_b3_mg float,
    vitamine_b5_mg float,vitamine_b6_mg float,vitamine_b9_dfe_microg float,vitamine_b9_microg float,folates_intrinseques_microg float,
    acide_folique_microg float,vitamine_b12_microg float,facteur_Jones float
);

COPY ingredients (alim_grp_code,alim_ssgrp_code,alim_ssssgrp_code,alim_grp_nom_fr,alim_ssgrp_nom_fr,	
    alim_ssssgrp_nom_fr,alim_code,alim_nom_fr,alim_nom_sci,energie_kj,energie_kcal,energie_jones_kj,energie_jones_kcal,
    eau,proteines_jones,proteines_g,glucides_g,lipides_g,sucres_g,fructose_g,galactose_g,glucose_g,lactose_g,maltose_g,
    saccharose_g,amidon_g,fibres_g,polyols_totaux_g,cendres_g,alcool_g,	acides_organiques_g,ag_satures_g,ag_monoinsatures_g,
    ag_polyinsatures_g,ag_4_butyrique_g,ag_6_caproique_g,ag_8_caprylique_g,ag_10_caprique_g,ag_12_laurique_g,	
    ag_14_myristique_g,ag_16_palmitique_g,ag_18_stearique_g,ag_18_1_oleique_g,ag_18_2_linoleique_g,ag_18_3_alpha_linolenique_g,
    ag_20_4_arachidonique_g,ag_20_5epa_g,ag_22_6_dha_g,cholesterol_g,sel_g,calcium_mg,chlorure_mg,cuivre_mg,fer_mg,iode_microg,
    magnesium_mg,manganese_mg,phosphore_mg,potassium_mg,selenium_microg,sodium_mg,zinc_mg,vitamine_a_microg,retinol_microg,
    beta_carotene_microg,vitamine_d_microg,vitamine_d2_microg,vitamine_d3_microg,alpha_tocopherol_mg,vitamine_e_mg,
    vitamine_k1_microg,vitamine_k2_microg,vitamine_c_mg,vitamine_b1_mg,vitamine_b2_mg,vitamine_b3_mg,
    vitamine_b5_mg,vitamine_b6_mg,vitamine_b9_dfe_microg,vitamine_b9_microg,folates_intrinseques_microg,
    acide_folique_microg,vitamine_b12_microg,facteur_Jones)
FROM '/files/Table_Ciqual_2025_clean.csv'
DELIMITER ';'
CSV HEADER;

DROP TABLE IF EXISTS singu_pluriel;
CREATE TABLE singu_pluriel (
    ingredient VARCHAR,
    singulier VARCHAR,
    pluriel VARCHAR
);

COPY singu_pluriel (ingredient,singulier,pluriel)
FROM '/files/ingredients_singu_pluriel.csv'
DELIMITER ','
CSV HEADER;

-----------------------------------------------------------------------------------------------------------
-- INGREDIENTS RECETTES
CREATE TABLE recipe_ingredients_wk (
    id_ingredient INT,
    id_recipe INT,
    ingredient VARCHAR,
    quantity FLOAT,
    unit TEXT,
    FOREIGN KEY (id_recipe) REFERENCES recipes_wk(id_recipe) ON DELETE CASCADE
    -- FOREIGN KEY (id_ingredient) REFERENCES ingredients(id_ingredient),
);

COPY recipe_ingredients_wk (id_ingredient,id_recipe,ingredient,quantity,unit)
FROM '/files/ingredients.csv'
DELIMITER ','
CSV HEADER;

DELETE FROM recipe_ingredients_wk
WHERE ingredient ilike 'papier sulfurisé';

ALTER TABLE recipe_ingredients_wk
ADD COLUMN ingredient_ciqual VARCHAR,
ADD COLUMN unit_g FLOAT;

UPDATE recipe_ingredients_wk ri
SET ingredient = sp.singulier
FROM singu_pluriel sp
WHERE upper(sp.pluriel)=upper(ri.ingredient);
UPDATE public.recipe_ingredients_wk
SET ingredient = replace(replace(replace(replace(replace(replace(replace(replace(ingredient,'aiguillettes','aiguillette'),'ailes','aile'),
			'oignons','oignon'),'blancs','blanc'),'jaunes','jaune'),'rouges','rouge'),'noirs','noir'),'baies','baie');
UPDATE public.recipe_ingredients_wk
SET ingredient = replace(replace(replace(replace(replace(replace(ingredient,'amandes entières','amande'),'artichauts violets','artichaut'),
			'asperges vertes','asperge verte'),'bananes','banane'),'bardes','barde'),'bette à carde','bette');
UPDATE public.recipe_ingredients_wk
SET ingredient = replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(ingredient,
			'boudins','boudin'),'bûches','bûche'),'citrons','citron'),'confits','confit'),'clous','clou'),'coeurs','coeur'),
			'côtes','côte'),'côtelettes','côtelette'),'coquilles','coquille'),'courgettes','courgette'),'rondes','ronde');
UPDATE public.recipe_ingredients_wk
SET ingredient = replace(replace(replace(replace(replace(ingredient,
			'escalopes','escalope'),'fonds','fond'),'jarrets','jarret'),'joues','joue'),'magrets','magret');
UPDATE public.recipe_ingredients_wk
SET ingredient = replace(replace(replace(replace(replace(replace(replace(replace(ingredient,
			'baba','fleur de bananier'),'anis en poudre','anis'),'champignon frais','champignon'),'coco en poudre','noix de coco'),
			'confiture de pomme','compote'),'coq','poule'),'crème','crème fraiche'),'crème de riz','crème fraiche de riz');
UPDATE public.recipe_ingredients_wk
SET ingredient = replace(replace(replace(replace(replace(replace(replace(replace(ingredient,
			'filet de poisson','filet de cabillaud'),'cumin en poudre','cumin'),'filet de poulet','poulet'),'haricot','haricot blanc'),
			'gésier de poulet','gésier'),'huile de coco','huile ou graisse de coco'),'jus de veau','bouillon de veau'),'pavé de saumon','saumon');
UPDATE public.recipe_ingredients_wk
SET ingredient = replace(replace(replace(replace(replace(replace(replace(ingredient,
			'macaroni','pâte sèche, macaroni'),'massala','épice massala'),'pied-de-mouton','champignon, pied-de-mouton'),
			'saumon frais','saumon'),'poudre de noisette','noisette, poudre'),'sucre en poudre','sucre'),'brick','feuille de brick');
UPDATE public.recipe_ingredients_wk
SET ingredient = 'beurre'
WHERE ingredient ilike 'beurre tendre' or ingredient ilike 'beurre sp%cial%';
UPDATE public.recipe_ingredients_wk
SET ingredient = 'amande'
WHERE ingredient ilike 'amande%';
UPDATE public.recipe_ingredients_wk
SET ingredient = 'cheddar'
WHERE ingredient ilike 'cheddar extra%';
UPDATE public.recipe_ingredients_wk
SET ingredient = 'crème légère'
WHERE ingredient ilike 'crème légère%';
UPDATE public.recipe_ingredients_wk
SET ingredient = 'farine de blé tendre ou froment T65'
WHERE ingredient ilike 'farine';
UPDATE public.recipe_ingredients_wk
SET ingredient = 'farine de blé tendre ou froment T80'
WHERE ingredient ilike 'farine semi complète';
UPDATE public.recipe_ingredients_wk
SET ingredient = 'farine de blé tendre ou froment T110'
WHERE ingredient ilike 'farine complète';
UPDATE public.recipe_ingredients_wk
SET ingredient = 'huile d''olive'
WHERE ingredient ilike 'huile';
UPDATE public.recipe_ingredients_wk
SET ingredient = 'lait de coco'
WHERE ingredient ilike 'lait de coco%';
UPDATE public.recipe_ingredients_wk
SET ingredient = 'nuoc mam'
WHERE ingredient ilike 'nuoc mam%';
UPDATE public.recipe_ingredients_wk
SET ingredient = 'nuoc mam'
WHERE ingredient ilike 'nuoc mam%';
UPDATE public.recipe_ingredients_wk
SET ingredient = 'sel blanc'
WHERE ingredient ilike 'sel des alpes%' or ingredient ilike 'sel';
UPDATE public.recipe_ingredients_wk
SET ingredient = split_part(ingredient,'de ','2')
WHERE ingredient ilike 'aiguillette de%';
UPDATE public.recipe_ingredients_wk
SET ingredient = split_part(ingredient,'de ','2')
WHERE ingredient ilike 'baie de%' or ingredient ilike 'baies de%';
UPDATE public.recipe_ingredients_wk
SET ingredient = 'pomme de terre'
WHERE ingredient ilike 'pomme de terre%';
UPDATE public.recipe_ingredients_wk
SET ingredient = 'lait concentré sucré'
WHERE ingredient ilike 'lait concentré';
UPDATE public.recipe_ingredients_wk
SET ingredient = 'lait concentré'
WHERE ingredient ilike 'lait concentré non sucré';

UPDATE public.recipe_ingredients_wk
SET quantity=5,unit = 'g'
WHERE unit ilike 'tasse (5 cl)';
UPDATE public.recipe_ingredients_wk
SET quantity=200,unit = 'g'
WHERE unit ilike 'tasses (150 ml)';
UPDATE public.recipe_ingredients_wk
SET 
    quantity = split_part(unit, ' ', 3)::double precision,
    unit = 'g'
WHERE unit ILIKE 'boîte de % g';

-- V3
CREATE INDEX idx_ingredients_alim_nom_fr_lower
ON ingredients (LOWER(alim_nom_fr));

CREATE INDEX idx_ingredients_alim_nom_fr_trgm
ON ingredients
USING gin (alim_nom_fr gin_trgm_ops);

UPDATE recipe_ingredients_wk ri
SET
    ingredient_ciqual = i.alim_nom_fr,
    id_ingredient = i.id_ingredient
FROM ingredients i
WHERE ri.ingredient_ciqual IS NULL
  AND LOWER(i.alim_nom_fr) LIKE LOWER(ri.ingredient) || ',%';
UPDATE recipe_ingredients_wk ri
SET
    ingredient_ciqual = i.alim_nom_fr||' - 2',
    id_ingredient = i.id_ingredient
FROM ingredients i
WHERE ri.ingredient_ciqual IS NULL 
  AND LOWER(i.alim_nom_fr) LIKE LOWER(ri.ingredient) || ' %,%';

UPDATE recipe_ingredients_wk ri
SET
    ingredient_ciqual = i.alim_nom_fr||' - 3',
    id_ingredient = i.id_ingredient
FROM ingredients i
WHERE ri.ingredient_ciqual IS NULL
  AND LOWER(i.alim_nom_fr) LIKE LOWER(ri.ingredient) || '%';

WITH best_match AS (
    SELECT DISTINCT ON (ri.id_recipe, ri.ingredient)
        ri.id_recipe,
        ri.ingredient,
        i.id_ingredient,
        i.alim_nom_fr,
        similarity(LOWER(ri.ingredient), LOWER(i.alim_nom_fr)) AS score
    FROM recipe_ingredients_wk ri
    JOIN ingredients i
      ON similarity(LOWER(ri.ingredient), LOWER(i.alim_nom_fr)) > 0.45
    WHERE ri.ingredient_ciqual IS NULL
    ORDER BY ri.id_recipe, ri.ingredient, score DESC
)
UPDATE recipe_ingredients_wk ri
SET
    ingredient_ciqual = bm.alim_nom_fr||' - 4',
    id_ingredient = bm.id_ingredient
FROM best_match bm
WHERE ri.id_recipe = bm.id_recipe
  AND ri.ingredient = bm.ingredient;

--split_part(i.alim_nom_fr, ',', 1) ILIKE ri.ingredient || '%'

DROP TABLE IF EXISTS weight_equivalence;
CREATE TABLE weight_equivalence (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    g_weight FLOAT
);
INSERT INTO weight_equivalence(name,g_weight)
VALUES ('barquette',500),('botte',500),('botillon',250),('boîte moyenne',250),('petite boîte',140),('pot',200),('louche',120),
       ('grande boîte',500),('boîte moyenne',250),('boîte',250),('petit bocal',100),('petit pot',110),('bocal',200),('livre',500),
       ('tasse',240),('verre',200),('cuillères à café',5),('cuillère à café',5),('cuillère à thé',5),('cuillères à soupe',12),
       ('cuillère à soupe',12),('cuillère',5),('cuillères',5),('bouquet',30),('brin',1),('pincée',0.5),('bonne poignée',40),('pointe',0.2),
       ('petite poignée',25),('poignée',30),('noisette',10),('noix',10),('tasse à café',90),('bol',200),('pointe de couteau',0.2),
       ('pointes de couteau',0.2),('cube',10),('cubes',10),('tours de moulin',0.3),('épis',300),('zeste',120),('goutte',0.05),
       ('gouttes',0.05),('brique',1000),('briquette',200),('bûche',500),('bûchette',120),('dose',10),('dosette',5),('touffe',30),
       ('lampée',15),('trait',5),('tige',1);
----------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS weight_legume_fruit;
CREATE TABLE weight_legume_fruit (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    pluriel VARCHAR,
    g_weight FLOAT
);

COPY weight_legume_fruit (name,pluriel,g_weight)
FROM '/files/poids_legumes_fruits.csv'
DELIMITER ','
CSV HEADER;

DROP TABLE IF EXISTS weight_meat_fish_egg;
CREATE TABLE weight_meat_fish_egg (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    pluriel VARCHAR,
    img VARCHAR,
    animal VARCHAR,
    g_weight FLOAT
);

COPY weight_meat_fish_egg (name,pluriel,g_weight)
FROM '/files/poids_meat_fish_egg.csv'
DELIMITER ','
CSV HEADER;

----------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS planning;
CREATE TABLE planning (
    id_planning SERIAL PRIMARY KEY,
    id_patient INT,
    start_day DATE,
    nb_repas INT,
    nb_people INT,
    FOREIGN KEY (id_patient) REFERENCES patients(id_patient) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_planning_patient_startday
ON planning (id_patient, start_day);


DROP TABLE IF EXISTS planning_recipes;
CREATE TABLE planning_recipes (
    id_planning INT,
    id_recipe INT,
    meal_day VARCHAR(20),
    meal_time VARCHAR,
    FOREIGN KEY (id_planning) REFERENCES planning(id_planning) ON DELETE CASCADE,
    FOREIGN KEY (id_recipe) REFERENCES recipes_wk(id_recipe) ON DELETE CASCADE
);

----------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS restrictions;

CREATE TABLE restrictions (
    id_restriction SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    ingredients_toavoid INTEGER[]
);

INSERT INTO restrictions(name)
VALUES ('Sans gluten'),
    ('Sans lactose'),
    ('Sans porc'),
    ('Sans oléagineux'),
    ('Sans oeuf'),
    ('Sans poisson'),
    ('Sans fruits de mer'),
    ('Sans légumineuses'),
    ('Sans ail / oignon');

--sans porc
UPDATE restrictions r
SET ingredients_toavoid = ARRAY(
    SELECT DISTINCT i.id_ingredient FROM ingredients i
    JOIN weight_meat_fish_egg w 
        ON w.name ILIKE i.alim_nom_fr
    WHERE i.alim_nom_fr ILIKE '%porc%' OR i.alim_ssssgrp_nom_fr ILIKE '%porc%' OR w.animal ILIKE '%porc%'
)
WHERE r.name ILIKE 'sans porc';
--sans ail / oignon
UPDATE restrictions r
SET ingredients_toavoid = ARRAY(
    select id_ingredient from ingredients i
    where i.alim_nom_fr ~* '^(ail),?\s' or i.alim_nom_fr ~* '\s(ail),?\s'
        or i.alim_nom_fr ~* '^(oignon),?\s' or i.alim_nom_fr ~* '\s(oignon),?\s'
)
WHERE r.name ILIKE 'sans ail / oignon';
--sans gluten
UPDATE restrictions r
SET ingredients_toavoid = ARRAY(select id_ingredient from ingredients i
where i.alim_nom_fr ~* '(de)?(blé),?\s' or i.alim_nom_fr ~* '(d'')?(orge),?\s'
	or i.alim_nom_fr ~* '(de)?(seigle),?\s' or i.alim_nom_fr ~* '(d'')?(épeautre),?\s'
	or i.alim_nom_fr ~* '(de)?(triticale),?\s' or i.alim_nom_fr ~* '(de)?(kamut),?\s'
	or i.alim_nom_fr ~* '(boulgour de blé),?\s' or i.alim_nom_fr ~* '(semoule de blé),?\s'
	or (i.alim_ssgrp_nom_fr in ('pains et assimilés', 'biscuits apéritifs', 'pâtes à tarte') and i.alim_nom_fr !~* 'sans gluten'))
WHERE r.name ILIKE 'sans gluten';
--sans oléagineux

--sans lactose

--sans oeuf
UPDATE restrictions r
SET ingredients_toavoid = ARRAY(select id_ingredient from ingredients i
where i.alim_ssgrp_nom_fr ilike 'oeufs')
WHERE r.name ILIKE 'sans oeuf';
--sans poisson

--sans fruits de mer
-- UPDATE restrictions r
-- SET ingredients_toavoid = ARRAY(select id_ingredient from ingredients i
-- where i.alim_ssgrp_nom_fr ilike 'mollusques et crustacés crus' or
--     (i.alim_ssgrp_nom_fr in ('produits à base de poissons et produits de la mer') and ))
-- WHERE r.name ILIKE 'sans fruits de mer';
--sans légumineuse
UPDATE restrictions r
SET ingredients_toavoid = ARRAY(select id_ingredient from ingredients i
where i.alim_ssgrp_nom_fr ilike 'légumineuses')
WHERE r.name ILIKE 'sans légumineuses';

----------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS appointments;

CREATE TABLE appointments (
    id_appointment SERIAL PRIMARY KEY,
    id_praticien INT NOT NULL,
    id_patient INT NOT NULL,
    date_appointment TIMESTAMP NOT NULL,
    duration INT DEFAULT 60, -- durée en minutes
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_praticien) REFERENCES praticiens(id_praticien) ON DELETE CASCADE,
    FOREIGN KEY (id_patient) REFERENCES patients(id_patient) ON DELETE CASCADE
);

-- Index utile pour planning
CREATE UNIQUE INDEX idx_appointments_praticien_date
ON appointments (id_praticien, date_appointment);

CREATE UNIQUE INDEX idx_appointments_patient_date
ON appointments (id_patient, date_appointment);

INSERT INTO appointments (id_praticien, id_patient, date_appointment, duration, notes)
VALUES
-- Lundi 2 mars
(2, 1, '2026-03-02 09:00:00', 60, 'Bilan nutritionnel'),
(2, 2, '2026-03-02 10:30:00', 45, 'Suivi'),
(3, 4, '2026-03-02 14:00:00', 60, 'Programme perte de poids'),
(3, 6, '2026-03-02 16:00:00', 30, 'Suivi'),

-- Mardi 3 mars
(2, 5, '2026-03-03 09:00:00', 60, 'Suivi'),
(2, 9, '2026-03-03 11:00:00', 60, 'Contrôle'),
(3, 4, '2026-03-03 15:00:00', 45, 'Contrôle'),

-- Mercredi 25 février
(2, 1, '2026-02-25 09:30:00', 45, 'Suivi'),
(2, 2, '2026-02-25 14:00:00', 60, 'Adaptation plan alimentaire'),
(3, 6, '2026-02-25 10:00:00', 60, 'Programme personnalisé'),

-- Jeudi 5 mars
(2, 5, '2026-03-05 09:00:00', 60, 'Suivi poids'),
(3, 4, '2026-03-05 11:00:00', 60, 'Bilan intermédiaire'),
(3, 6, '2026-03-05 15:30:00', 30, 'Suivi'),

-- Vendredi 27 février
(2, 9, '2026-02-27 10:00:00', 60, 'Suivi'),
(2, 1, '2026-02-27 15:00:00', 45, 'Bilan nutritionnel'),
(3, 4, '2026-02-27 16:30:00', 30, 'Point rapide');

INSERT INTO appointments (id_praticien, id_patient, date_appointment, duration,  notes)
VALUES
-- Semaine du 9 mars
(2, 2, '2026-03-09 09:00:00', 60, 'Suivi'),
(2, 5, '2026-03-09 11:00:00', 45, 'Contrôle'),
(3, 4, '2026-03-10 14:00:00', 60, 'Programme perte poids'),
(3, 6, '2026-03-11 10:00:00', 45, 'Suivi'),

-- Semaine du 16 mars
(2, 1, '2026-03-16 09:00:00', 60, 'Bilan'),
(2, 9, '2026-03-17 14:00:00', 60, 'Suivi'),
(3, 4, '2026-03-18 11:00:00', 60, 'Contrôle'),
(3, 6, '2026-03-20 16:00:00', 30, 'Suivi'),

-- Semaine du 23 mars
(2, 2, '2026-03-23 09:30:00', 45, 'Suivi'),
(2, 5, '2026-03-24 15:00:00', 60, 'Adaptation régime'),
(3, 4, '2026-03-25 10:00:00', 60, 'Bilan'),
(3, 6, '2026-03-27 14:30:00', 45, 'Programme'),

-- Semaine du 30 mars
(2, 1, '2026-03-30 09:00:00', 60, 'Suivi'),
(2, 9, '2026-03-31 11:00:00', 60, 'Contrôle'),
(3, 4, '2026-04-01 15:00:00', 60, 'Bilan mensuel');

INSERT INTO appointments (id_praticien, id_patient, date_appointment, duration, notes)
VALUES
-- Semaine du 6 avril
(2, 2, '2026-04-06 09:00:00', 60, 'Suivi'),
(2, 5, '2026-04-07 14:00:00', 45, 'Suivi'),
(3, 4, '2026-04-08 10:00:00', 60, 'Programme'),
(3, 6, '2026-04-10 16:00:00', 30, 'Contrôle'),

-- Semaine du 13 avril
(2, 1, '2026-04-13 09:00:00', 60, 'Bilan'),
(2, 9, '2026-04-14 11:00:00', 60, 'Suivi'),
(3, 4, '2026-04-15 14:00:00', 60, 'Programme'),
(3, 6, '2026-04-17 10:00:00', 45, 'Suivi'),

-- Semaine du 20 avril
(2, 2, '2026-04-20 09:00:00', 60, 'Contrôle'),
(2, 5, '2026-04-21 15:00:00', 45, 'Adaptation'),
(3, 4, '2026-04-22 11:00:00', 60, 'Bilan'),
(3, 6, '2026-04-24 16:30:00', 30, 'Suivi');