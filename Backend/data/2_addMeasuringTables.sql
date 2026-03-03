DROP TABLE IF EXISTS contener;
CREATE TABLE contener (
    id_contener SERIAL PRIMARY KEY,
    name VARCHAR,
    plurial VARCHAR,
    weight FLOAT
);

INSERT INTO contener (name,plurial,weight)
VALUES ('cuillère à café','cuillères à café',5),
       ('cuillère à soupe','cuillères à soupe',12),
       ('louche','louches',120),
       ('noix','noix',10),
       ('noisette','noisettes',5),
       ('goutte','gouttes',0.05),
       ('pincée','pincées',0.5),
       ('tasse à café','tasses à café',90),
       ('verre','verres',200),
       ('tasse','tasses',240),
       ('livre','livres',500);

-- DROP TABLE IF EXISTS weight_legume_fruit;
-- CREATE TABLE weight_legume_fruit (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR,
--     pluriel VARCHAR,
--     g_weight FLOAT
-- );

-- COPY ... 'poids_legumes_fruits.csv'

-- DROP TABLE IF EXISTS weight_meat_fish_egg;
-- CREATE TABLE weight_meat_fish_egg (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR,
--     pluriel VARCHAR,
--     animal VARCHAR,
--     categorie VARCHAR,
--     g_weight FLOAT
-- );

-- COPY ... 'poids_meat_fish_egg.csv'