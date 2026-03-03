----------------------------------------------------------------------------------------------
--
UPDATE recipe_ingredients_wk ri
SET unit_g = sub.g_weight
FROM (
    SELECT ri.ingredient,
           ri.id_recipe,
           we.g_weight,
           ROW_NUMBER() OVER (
               PARTITION BY ri.ingredient, ri.id_recipe
               ORDER BY LENGTH(we.name) DESC
           ) AS rn
    FROM recipe_ingredients_wk ri
    JOIN weight_equivalence we
      ON ri.unit ILIKE '%' || we.name || '%'
) sub
WHERE ri.ingredient = sub.ingredient
  AND ri.id_recipe = sub.id_recipe
  AND sub.rn = 1;

----------------------------------------------------------------------------------------------
UPDATE recipe_ingredients_wk
SET unit_g = quantity
WHERE unit = 'g';
UPDATE recipe_ingredients_wk
SET unit_g = 1000*quantity::float
WHERE unit = 'kg';
UPDATE recipe_ingredients_wk
SET unit_g = 1000*quantity::float
WHERE unit = 'l';
UPDATE recipe_ingredients_wk
SET unit_g = 100*quantity::float
WHERE unit = 'dl';
UPDATE recipe_ingredients_wk
SET unit_g = 10*quantity::float
WHERE unit = 'cl';
UPDATE recipe_ingredients_wk
SET unit_g = quantity::float
WHERE unit = 'ml';
----------------------------------------------------------------------------------------------
-- GOUSSES
UPDATE recipe_ingredients_wk
SET unit_g = 4*quantity::float
WHERE unit ilike '%gousse%' AND ingredient ilike '%ail%';
UPDATE recipe_ingredients_wk
SET unit_g = 30*quantity::float
where unit ilike '%gousse%' and ingredient ilike '%échalote%';
UPDATE recipe_ingredients_wk
SET unit_g = 0.2*quantity::float
where unit ilike '%gousse%' and ingredient ilike '%cardamome%';
UPDATE recipe_ingredients_wk
SET unit_g = 4*quantity::float
where unit ilike '%gousse%' and ingredient ilike '%vanille%';
----------------------------------------------------------------------------------------------
-- BOUTEILLE
UPDATE recipe_ingredients_wk
SET unit_g = 500*quantity::float
WHERE unit ilike '%bouteille%' AND ingredient ilike '%tomate%';
UPDATE recipe_ingredients_wk
SET unit_g = 200*quantity::float
WHERE unit ilike '%bouteille%' AND ingredient ilike '%crème fraiche%';
UPDATE recipe_ingredients_wk
SET unit_g = 100*quantity::float
where unit ilike '%bouteille%' and ingredient ilike '%fleur d''oranger%';
UPDATE recipe_ingredients_wk
SET unit_g = 165*quantity::float
WHERE unit ilike '%bouteille%' AND ingredient ilike '%soja%';
UPDATE recipe_ingredients_wk
SET unit_g = 750*quantity::float
WHERE unit ilike '%bouteille%' AND unit_g is null;
----------------------------------------------------------------------------------------------
-- TABLETTE
UPDATE recipe_ingredients_wk
SET unit_g = 200*quantity::float
where unit ilike '%tablette%' and ingredient ilike '%chocolat%';
UPDATE recipe_ingredients_wk
SET unit_g = 25*quantity::float
WHERE unit ilike '%tablette%' AND ingredient ilike '%lasagne%';
UPDATE recipe_ingredients_wk
SET unit_g = 10*quantity::float
WHERE unit ilike '%tablette%' AND ingredient ilike '%bouillon%';
----------------------------------------------------------------------------------------------
-- BRANCHE
UPDATE recipe_ingredients_wk
SET unit_g = 40*quantity::float
where unit ilike '%branche%' and ingredient ilike '%brocoli%';
UPDATE recipe_ingredients_wk
SET unit_g = 50*quantity::float
WHERE (unit ilike '%branche%' OR unit ilike '%bâton%') AND ingredient ilike '%céleri%';
UPDATE recipe_ingredients_wk
SET unit_g = 60*quantity::float
WHERE (unit ilike '%branche%' OR unit ilike '%bâton%') AND ingredient ilike '%fenouil%';
UPDATE recipe_ingredients_wk
SET unit_g = 100*quantity::float
WHERE unit ilike '%branche%' AND ingredient ilike '%poireau%';
UPDATE recipe_ingredients_wk
SET unit_g = 0.5*quantity::float
WHERE unit ilike '%branche%' AND unit_g is null;
----------------------------------------------------------------------------------------------
-- BÂTON
UPDATE recipe_ingredients_wk
SET unit_g = 2*quantity::float
where (unit ilike '%bâton%' or unit ilike '%batonnet%') and ingredient ilike '%cannelle%';
UPDATE recipe_ingredients_wk
SET unit_g = 12*quantity::float
WHERE unit ilike '%bâton%' AND ingredient ilike '%citronnelle%';
UPDATE recipe_ingredients_wk
SET unit_g = 50*quantity::float
WHERE (unit ilike '%bâton%' or unit ilike '%batonnet%') AND ingredient ilike '%surimi%';
UPDATE recipe_ingredients_wk
SET unit_g = 4*quantity::float
WHERE unit ilike '%bâton%' AND ingredient ilike '%vanille%';
----------------------------------------------------------------------------------------------
-- BLOC
UPDATE recipe_ingredients_wk
SET unit_g = 200*quantity::float
where unit ilike '%bloc%' and ingredient ilike '%feta%';
UPDATE recipe_ingredients_wk
SET unit_g = 250*quantity::float
WHERE unit ilike '%bloc%' AND ingredient ilike '%foie gras%';
UPDATE recipe_ingredients_wk
SET unit_g = 200*quantity::float
WHERE unit ilike '%bloc%' AND ingredient ilike '%halloumi%';
UPDATE recipe_ingredients_wk
SET unit_g = 30*quantity::float
WHERE unit ilike '%bloc%' AND ingredient ilike '%jambon fumé%';
UPDATE recipe_ingredients_wk
SET unit_g = 125*quantity::float
WHERE (unit ilike '%bloc%' or unit ilike '%boule%') AND ingredient ilike '%mozzarella%';
UPDATE recipe_ingredients_wk
SET unit_g = 200*quantity::float
WHERE unit ilike '%bloc%' AND ingredient ilike '%tofu%';
----------------------------------------------------------------------------------------------
-- BOULE
UPDATE recipe_ingredients_wk
SET unit_g = 600*quantity::float
where unit ilike '%boule%' and ingredient ilike '%céleri%';
UPDATE recipe_ingredients_wk
SET unit_g = 1200*quantity::float
WHERE unit ilike '%boule%' AND ingredient ilike '%chou blanc%';
UPDATE recipe_ingredients_wk
SET unit_g = 100*quantity::float
WHERE unit ilike '%boule%' AND ingredient ilike '%glace%';
UPDATE recipe_ingredients_wk
SET unit_g = 80*quantity::float
WHERE unit ilike '%boule%' AND ingredient ilike '%sorbet%';
----------------------------------------------------------------------------------------------
-- BULBE
UPDATE recipe_ingredients_wk
SET unit_g = 250*quantity::float
where unit ilike '%bulbe%' and ingredient ilike '%fenouil%';
UPDATE recipe_ingredients_wk
SET unit_g = 40*quantity::float
WHERE unit ilike '%bulbe%' AND ingredient ilike '%gingembre%';
----------------------------------------------------------------------------------------------
-- CARRE
UPDATE recipe_ingredients_wk
SET unit_g = 10*quantity::float
where unit ilike '%carré%' and ingredient ilike '%bouillon%';
UPDATE recipe_ingredients_wk
SET unit_g = 10*quantity::float
WHERE unit ilike '%carré%' AND ingredient ilike '%chocolat%';
UPDATE recipe_ingredients_wk
SET unit_g = 25*quantity::float
WHERE unit ilike '%carré%' AND (ingredient ilike '%fromage%' or ingredient ilike '%kiri%');
UPDATE recipe_ingredients_wk
SET unit_g = 130*quantity::float
WHERE unit ilike '%carré%' AND ingredient ilike '%lieu%';
UPDATE recipe_ingredients_wk
SET unit_g = 20*quantity::float
WHERE unit ilike '%carré%' AND ingredient ilike '%pâte à ravioli%';
UPDATE recipe_ingredients_wk
SET unit_g = 150*quantity::float
WHERE unit ilike '%carré%' AND ingredient ilike '%poisson%';
UPDATE recipe_ingredients_wk
SET unit_g = 1200*quantity::float
WHERE unit ilike '%carré%' AND ingredient ilike '%rôti de porc%';
UPDATE recipe_ingredients_wk
SET unit_g = 10*quantity::float
WHERE unit ilike '%carré%' AND ingredient ilike '%sucre%';
UPDATE recipe_ingredients_wk
SET unit_g = 20*quantity::float
WHERE unit ilike '%carré%' AND ingredient ilike '%toastinette%';
----------------------------------------------------------------------------------------------
-- COEUR
UPDATE recipe_ingredients_wk
SET unit_g = 200*quantity::float
WHERE unit ilike '%coeur%' AND ingredient ilike '%céleri%';
UPDATE recipe_ingredients_wk
SET unit_g = 300*quantity::float
WHERE unit ilike '%coeur%' AND ingredient ilike '%chou%';
UPDATE recipe_ingredients_wk
SET unit_g = 150*quantity::float
WHERE unit ilike '%coeur%' AND ingredient ilike '%laitue%';
----------------------------------------------------------------------------------------------
-- DEMI
UPDATE recipe_ingredients_wk
SET unit_g = 750*quantity::float
WHERE unit ilike '%demi%' AND ingredient in ('chou','chou blanc');
UPDATE recipe_ingredients_wk
SET unit_g = 600*quantity::float
WHERE unit ilike '%demi%' AND ingredient in ('chou-fleur');
UPDATE recipe_ingredients_wk
SET unit_g = 500*quantity::float
WHERE unit ilike '%demi%' AND ingredient in ('sel blanc','bouillon de volaille');
UPDATE recipe_ingredients_wk
SET unit_g = 400*quantity::float
WHERE unit ilike '%demi%' AND ingredient in ('céleri-rave','chou chinois');
UPDATE recipe_ingredients_wk
SET unit_g = 375*quantity::float
WHERE unit ilike '%demi%' AND ingredient in ('vin blanc','vin blanc sec');
UPDATE recipe_ingredients_wk
SET unit_g = 350*quantity::float
WHERE unit ilike '%demi%' AND ingredient in ('cognac');
UPDATE recipe_ingredients_wk
SET unit_g = 250*quantity::float
WHERE unit ilike '%demi%' AND ingredient in ('béchamel','reblochon','huile d''olive');
UPDATE recipe_ingredients_wk
SET unit_g = 150*quantity::float
WHERE unit ilike '%demi%' AND ingredient in ('aubergine','concombre');
UPDATE recipe_ingredients_wk
SET unit_g = 125*quantity::float
WHERE unit ilike '%demi%' AND ingredient in ('beurre');
UPDATE recipe_ingredients_wk
SET unit_g = 100*quantity::float
WHERE unit ilike '%demi%' AND ingredient in ('blanc de poireau','tomate cerise','crème fraîche liquide','feta','fromage de chèvre','chorizo',
                                            'jambon blanc','tofu','tomates cerise','crème fraiche liquide');
UPDATE recipe_ingredients_wk
SET unit_g = 75*quantity::float
WHERE unit ilike '%demi%' AND ingredient in ('poivron','poivron jaune','poivron rouge','poivron vert','tomate','boursin','sauce soja');
UPDATE recipe_ingredients_wk
SET unit_g = 60*quantity::float
WHERE unit ilike '%demi%' AND ingredient in ('oignon','pomme','citron','jus de citron');
UPDATE recipe_ingredients_wk
SET unit_g = 50*quantity::float
WHERE unit ilike '%demi%' AND ingredient in ('carotte','citron vert','jambon cru');
UPDATE recipe_ingredients_wk
SET unit_g = 25*quantity::float
WHERE unit ilike '%demi%' AND ingredient in ('poivre');
UPDATE recipe_ingredients_wk
SET unit_g = 15*quantity::float
WHERE unit ilike '%demi%' AND ingredient in ('combava','piment d''Espelette');
UPDATE recipe_ingredients_wk
SET unit_g = 10*quantity::float
WHERE unit ilike '%demi%' AND ingredient in ('persil');
UPDATE recipe_ingredients_wk
SET unit_g = 5*quantity::float
WHERE unit ilike '%demi%' AND ingredient in ('ciboulette','romarin','cube de bouillon','levure chimique');
----------------------------------------------------------------------------------------------
-- FEUILLE
UPDATE recipe_ingredients_wk
SET unit_g = 60*quantity::float
WHERE unit ilike '%feuille%' AND ingredient ilike '%bette%';
UPDATE recipe_ingredients_wk
SET unit_g = 5*quantity::float
WHERE unit ilike '%feuille%' AND ingredient ilike '%céleri%';
UPDATE recipe_ingredients_wk
SET unit_g =60*quantity::float
WHERE unit ilike '%feuille%' AND ingredient ilike '%chou%';
UPDATE recipe_ingredients_wk
SET unit_g =10*quantity::float
WHERE unit ilike '%feuille%' AND ingredient ilike 'endive%';
UPDATE recipe_ingredients_wk
SET unit_g =5*quantity::float
WHERE unit ilike '%feuille%' AND ingredient ilike '%épinard%';
UPDATE recipe_ingredients_wk
SET unit_g =25*quantity::float
WHERE unit ilike '%feuille%' AND (ingredient ilike '%lasagne%' OR ingredient ilike '%pâte%');
UPDATE recipe_ingredients_wk
SET unit_g =20*quantity::float
WHERE unit ilike '%feuille%' AND ingredient ilike '%poireau%';
UPDATE recipe_ingredients_wk
SET unit_g =10*quantity::float
WHERE unit ilike '%feuille%' AND ingredient ilike '%salade%';
UPDATE recipe_ingredients_wk
SET unit_g =0.2*quantity::float
WHERE unit ilike '%feuille%' AND unit_g is null;
----------------------------------------------------------------------------------------------
-- FILET
UPDATE recipe_ingredients_wk
SET unit_g = 150*quantity::float
WHERE unit ilike '%filet%' AND ingredient in ('barbue','espadon','flétan','lotte','pintade','rascasse','sabre','saint-pierre','sandre',
                                             'saumon','thon','truite saumonée','turbot','filet mignon');
UPDATE recipe_ingredients_wk
SET unit_g = 120*quantity::float
WHERE unit ilike '%filet%' AND ingredient in ('bar','biche','blanc de poulet','boeuf','carrelet','chevreuil','colin','daurade','dorade','dinde',
                                             'églefin','haddock','hareng','julienne','lieu jaune','lieu noir','limande','loup','loup de mer',
                                             'maquereau','merlan','merlu','morue','panga','pangasiu','poisson','poulet','sébaste','sole',
                                             'tilapia','truite','filet de porc');
UPDATE recipe_ingredients_wk
SET unit_g = 80*quantity::float
WHERE unit ilike '%filet%' AND ingredient in ('rouget');
UPDATE recipe_ingredients_wk
SET unit_g = 60*quantity::float
WHERE unit ilike '%filet%' AND ingredient in ('sardine');
UPDATE recipe_ingredients_wk
SET unit_g = 20*quantity::float
WHERE unit ilike '%filet%' AND ingredient in ('anchois');
UPDATE recipe_ingredients_wk
SET unit_g = 15*quantity::float
WHERE unit ilike '%filet%' AND ingredient in ('crème fraiche liquide','crème fraiche fraîche liquide','eau');
UPDATE recipe_ingredients_wk
SET unit_g = 10*quantity::float
WHERE unit ilike '%filet%' AND ingredient in ('citron','cognac','huile de sésame','huile de tournesol','jus de citron','sauce nuoc-mam','sauce nuoc mam',
                                             'sauce soja','vinaigre','vinaigre balsamique','vinaigre de framboise','huile d''olive','huile de noix');
UPDATE recipe_ingredients_wk
SET unit_g = 5*quantity::float
WHERE unit ilike '%filet%' AND ingredient in ('huile de truffe');
----------------------------------------------------------------------------------------------
-- GRAIN
UPDATE recipe_ingredients_wk
SET unit_g = 4*quantity::float
WHERE unit ilike '%grain%' AND ingredient ilike '%ail%';
UPDATE recipe_ingredients_wk
SET unit_g = 0.2*quantity::float
WHERE unit ilike '%grain%' AND ingredient ilike '%cardamome%';
UPDATE recipe_ingredients_wk
SET unit_g = 5*quantity::float
WHERE unit ilike '%grain%' AND ingredient ilike '%piment%';
UPDATE recipe_ingredients_wk
SET unit_g = 5*quantity::float
WHERE unit ilike '%grain%' AND ingredient ilike '%raisin%';
UPDATE recipe_ingredients_wk
SET unit_g = 0.02*quantity::float
WHERE unit ilike '%grain%' AND unit_g is null;
----------------------------------------------------------------------------------------------
-- LAMELLE
UPDATE recipe_ingredients_wk
SET unit_g = 1*quantity::float
WHERE unit ilike '%lamelle%' AND ingredient ilike '%champignon%';
UPDATE recipe_ingredients_wk
SET unit_g = 5*quantity::float
WHERE unit ilike '%lamelle%' AND ingredient ilike '%comté%';
UPDATE recipe_ingredients_wk
SET unit_g = 2*quantity::float
WHERE unit ilike '%lamelle%' AND ingredient ilike '%gingembre%';
UPDATE recipe_ingredients_wk
SET unit_g = 5*quantity::float
WHERE unit ilike '%lamelle%' AND ingredient ilike '%gruyère%';
UPDATE recipe_ingredients_wk
SET unit_g = 5*quantity::float
WHERE unit ilike '%lamelle%' AND ingredient ilike '%lard%';
UPDATE recipe_ingredients_wk
SET unit_g = 5*quantity::float
WHERE unit ilike '%lamelle%' AND ingredient ilike '%oignon%';
UPDATE recipe_ingredients_wk
SET unit_g = 2*quantity::float
WHERE unit ilike '%lamelle%' AND ingredient ilike '%piment%';
UPDATE recipe_ingredients_wk
SET unit_g = 5*quantity::float
WHERE unit ilike '%lamelle%' AND ingredient ilike '%poivron%';
UPDATE recipe_ingredients_wk
SET unit_g = 1*quantity::float
WHERE unit ilike '%lamelle%' AND ingredient ilike '%truffe%';
----------------------------------------------------------------------------------------------
-- LOBE ENTIER
UPDATE recipe_ingredients_wk
SET unit_g = 500*quantity::float
WHERE unit ilike '%lobe entier%' AND ingredient ilike '%foie gras%';
----------------------------------------------------------------------------------------------
-- MOITIE
UPDATE recipe_ingredients_wk
SET unit_g = 750*quantity::float
WHERE unit ilike '%moitié%' AND ingredient in ('chou');
UPDATE recipe_ingredients_wk
SET unit_g = 375*quantity::float
WHERE unit ilike '%moitié%' AND ingredient in ('vin rouge');
UPDATE recipe_ingredients_wk
SET unit_g = 150*quantity::float
WHERE unit ilike '%moitié%' AND ingredient in ('concombre');
UPDATE recipe_ingredients_wk
SET unit_g = 75*quantity::float
WHERE unit ilike '%moitié%' AND ingredient in ('pomme');
----------------------------------------------------------------------------------------------
-- MORCEAU
UPDATE recipe_ingredients_wk
SET unit_g = 5*quantity::float
WHERE unit ilike '%morceau%' AND ingredient ilike '%ail%';
UPDATE recipe_ingredients_wk
SET unit_g = 5*quantity::float
WHERE unit ilike '%morceau%' AND ingredient ilike '%anis%';
UPDATE recipe_ingredients_wk
SET unit_g = 5*quantity::float
WHERE unit ilike '%morceau%' AND ingredient ilike '%écorce d''orange%';
UPDATE recipe_ingredients_wk
SET unit_g = 10*quantity::float
WHERE unit ilike '%morceau%' AND ingredient ilike '%galanga%';
UPDATE recipe_ingredients_wk
SET unit_g = 10*quantity::float
WHERE unit ilike '%morceau%' AND ingredient ilike '%gingembre%';
UPDATE recipe_ingredients_wk
SET unit_g = 3*quantity::float
WHERE unit ilike '%morceau%' AND ingredient ilike '%piment%';
UPDATE recipe_ingredients_wk
SET unit_g = 8*quantity::float
WHERE unit ilike '%morceau%' AND ingredient ilike '%tomate séchée%';
UPDATE recipe_ingredients_wk
SET unit_g = 20*quantity::float
WHERE unit ilike '%morceau%' AND (ingredient ilike '%beurre%' or ingredient ilike '%margarine%');
UPDATE recipe_ingredients_wk
SET unit_g = 30*quantity::float
WHERE unit ilike '%morceau%' AND ingredient in ('bleu','beaufort','comté','gorgonzola','gouda','mont d''or',
                                              'Parmesan','roquefort','fromage','fromage à raclette','Vache qui rit®');
UPDATE recipe_ingredients_wk
SET unit_g = 100*quantity::float
WHERE unit ilike '%morceau%' AND (ingredient ilike '%boeuf%' or ingredient ilike '%veau%'
                                  OR ingredient ilike '%mouton%' or ingredient ilike '%navarin d''agneau%');
UPDATE recipe_ingredients_wk
SET unit_g = 120*quantity::float
WHERE unit ilike '%morceau%' AND ingredient in ('paleron','palette','épaule de veau','tendron de veau','collier d''agneau',
                                              'selle d''agneau','sanglier','poulet','blanc de poulet','dinde');
UPDATE recipe_ingredients_wk
SET unit_g = 150*quantity::float
WHERE unit ilike '%morceau%' AND ingredient = 'jarret de veau';
UPDATE recipe_ingredients_wk
SET unit_g = 250*quantity::float
WHERE unit ilike '%morceau%' AND ingredient in ('cuisse de poulet','canard confit','confit de canard','râble de lapin');
UPDATE recipe_ingredients_wk
SET unit_g = 50*quantity::float
WHERE unit ilike '%morceau%' AND ingredient in ('Foie gras','poitrine fumée','chorizo');
UPDATE recipe_ingredients_wk
SET unit_g = 125*quantity::float
WHERE unit ilike '%morceau%' AND ingredient ='steak';
UPDATE recipe_ingredients_wk
SET unit_g = 100*quantity::float
WHERE unit ilike '%morceau%' AND ingredient in ('saucisse de Toulouse','boudin noir','viande','côte d''agneau');
UPDATE recipe_ingredients_wk
SET unit_g = 40*quantity::float
WHERE unit ilike '%morceau%' AND ingredient in ('saucisse à l''ail','lard');
UPDATE recipe_ingredients_wk
SET unit_g = 30*quantity::float
WHERE unit ilike '%morceau%' AND ingredient = 'couenne';
UPDATE recipe_ingredients_wk
SET unit_g = 120*quantity::float
WHERE unit ilike '%morceau%' AND ingredient in ('bar','loup','loup de mer','colin','lieu noir','lotte','saumon','thon','yet');
UPDATE recipe_ingredients_wk
SET unit_g = 100*quantity::float
WHERE unit ilike '%morceau%' AND ingredient = 'poisson';
UPDATE recipe_ingredients_wk
SET unit_g = 40*quantity::float
WHERE unit ilike '%morceau%' AND ingredient in ('céleri','pain');
UPDATE recipe_ingredients_wk
SET unit_g = 100*quantity::float
WHERE unit ilike '%morceau%' AND ingredient in ('céleri-rave','blanc de poireau','maïs','tofu');
UPDATE recipe_ingredients_wk
SET unit_g = 150*quantity::float
WHERE unit ilike '%morceau%' AND ingredient in ('courge','citrouille','potiron','orange');
UPDATE recipe_ingredients_wk
SET unit_g = 10*quantity::float
WHERE unit ilike '%morceau%' AND ingredient in ('sucre','sucre roux');
----------------------------------------------------------------------------------------------
-- PAQUET
UPDATE recipe_ingredients_wk
SET unit_g = 1000*quantity::float
WHERE unit ilike '%paquet%' AND ingredient in ('blette','riz');
UPDATE recipe_ingredients_wk
SET unit_g = 500*quantity::float
WHERE unit ilike '%paquet%' AND ingredient in ('haricots blancs plats','haricot blancs plats','coude','pâtes à lasagnes','pâte sèche','riz pour risotto',
                                              'spaghetti','tagliatelle','pain de mie','pois chiches','lasagne','pâte sèche, pâte sèche, macaroni');
UPDATE recipe_ingredients_wk
SET unit_g = 400*quantity::float
WHERE unit ilike '%paquet%' AND ingredient in ('marrons','marron','fromage à raclette','quenelles','quenelle');
UPDATE recipe_ingredients_wk
SET unit_g = 300*quantity::float
WHERE unit ilike '%paquet%' AND ingredient in ('épinard','crevettes','crevette','knacki','tagliatelles fraîches');
UPDATE recipe_ingredients_wk
SET unit_g = 250*quantity::float
WHERE unit ilike '%paquet%' AND ingredient in ('brède Mafane','fond d''artichaut','tomates cerise','truite','canneloni','nouilles','nouille',
                                              'nouilles aux oeufs Suzi Wan®','nouilles chinoises','ravioles','raviole','vermicelle','pâte',
                                              'chapelure','nouilles de riz');
UPDATE recipe_ingredients_wk
SET unit_g = 230*quantity::float
WHERE unit ilike '%paquet%' AND ingredient in ('pâte brisée','pâte feuilletée');
UPDATE recipe_ingredients_wk
SET unit_g = 200*quantity::float
WHERE unit ilike '%paquet%' AND ingredient in ('feta','fromage râpé','gruyère râpé','chorizo','jambon','lardons','lardon','lardons fumés',
                                              'surimi','vermicelles de riz','chips tortilla','feuilles de riz','galettes de riz',
                                              'feuille de riz','galette de riz');
UPDATE recipe_ingredients_wk
SET unit_g = 150*quantity::float
WHERE unit ilike '%paquet%' AND ingredient in ('boursin','saumon fumé','vermicelles de soja');
UPDATE recipe_ingredients_wk
SET unit_g = 125*quantity::float
WHERE unit ilike '%paquet%' AND ingredient in ('mozzarella');
UPDATE recipe_ingredients_wk
SET unit_g = 100*quantity::float
WHERE unit ilike '%paquet%' AND ingredient in ('pariétaire','parmesan râpé','miettes de crabe','bouillon','tuc');
UPDATE recipe_ingredients_wk
SET unit_g = 50*quantity::float
WHERE unit ilike '%paquet%' AND ingredient in ('champignons noirs','champignon noir','pignons de pin','pignon');
UPDATE recipe_ingredients_wk
SET unit_g = 40*quantity::float
WHERE unit ilike '%paquet%' AND ingredient in ('curcuma');
UPDATE recipe_ingredients_wk
SET unit_g = 25*quantity::float
WHERE unit ilike '%paquet%' AND ingredient in ('morilles','morille');
UPDATE recipe_ingredients_wk
SET unit_g = 15*quantity::float
WHERE unit ilike '%paquet%' AND ingredient in ('basilic');
UPDATE recipe_ingredients_wk
SET unit_g = 11*quantity::float
WHERE unit ilike '%paquet%' AND ingredient in ('levure chimique');
----------------------------------------------------------------------------------------------
-- PAVE
UPDATE recipe_ingredients_wk
SET unit_g = 200*quantity::float
WHERE unit ilike '%pavé%' AND ingredient in ('rumsteck','espadon','requin','thon','tofu');
UPDATE recipe_ingredients_wk
SET unit_g = 150*quantity::float
WHERE unit ilike '%pavé%' AND ingredient in ('biche','boeuf','cabillaud','colin','haddock','lieu noir','merlu','poisson','saumon','truite');
UPDATE recipe_ingredients_wk
SET unit_g = 120*quantity::float
WHERE unit ilike '%pavé%' AND ingredient in ('escalope','steak');
UPDATE recipe_ingredients_wk
SET unit_g = 25*quantity::float
WHERE unit ilike '%pavé%' AND ingredient in ('carré frais');
----------------------------------------------------------------------------------------------
-- PIECE
UPDATE recipe_ingredients_wk
SET unit_g = 60*quantity::float
WHERE unit ilike '%pièce%' AND ingredient ilike '%citron%';
UPDATE recipe_ingredients_wk
SET unit_g = 200*quantity::float
WHERE unit ilike '%pièce%' AND ingredient ilike '%courgette%';
UPDATE recipe_ingredients_wk
SET unit_g = 250*quantity::float
WHERE unit ilike '%pièce%' AND ingredient ilike '%entrecôte%';
UPDATE recipe_ingredients_wk
SET unit_g = 8*quantity::float
WHERE unit ilike '%pièce%' AND ingredient ilike '%tomate séchée%';
UPDATE recipe_ingredients_wk
SET unit_g = 120*quantity::float
WHERE unit ilike '%pièce%' AND ingredient ilike '%veau%';
----------------------------------------------------------------------------------------------
-- PLAQUE
UPDATE recipe_ingredients_wk
SET unit_g = 50*quantity::float
WHERE unit ilike '%plaque%' AND ingredient in ('couenne');
UPDATE recipe_ingredients_wk
SET unit_g = 50*quantity::float
WHERE unit ilike '%plaque%' AND ingredient in ('nouilles chinoises','raviole de Royans');
UPDATE recipe_ingredients_wk
SET unit_g = 15*quantity::float
WHERE unit ilike '%plaque%' AND ingredient in ('lasagne');
UPDATE recipe_ingredients_wk
SET unit_g = 10*quantity::float
WHERE unit ilike '%plaque%' AND ingredient in ('canneloni','magret de canard séché');
UPDATE recipe_ingredients_wk
SET unit_g = 3*quantity::float
WHERE unit ilike '%plaque%' AND ingredient in ('nori','raviole');
----------------------------------------------------------------------------------------------
-- PORTION
UPDATE recipe_ingredients_wk
SET unit_g = 18*quantity::float
WHERE unit ilike '%portion%' AND ingredient in ('kiri');
UPDATE recipe_ingredients_wk
SET unit_g = 21*quantity::float
WHERE unit ilike '%portion%' AND ingredient in ('Vache qui rit®');
UPDATE recipe_ingredients_wk
SET unit_g = 30*quantity::float
WHERE unit ilike '%portion%' AND ingredient in ('boursin','brie de meaux','fromage','fromage frais','fromage ail et fines herbes','gruyère');
UPDATE recipe_ingredients_wk
SET unit_g = 60*quantity::float
WHERE unit ilike '%portion%' AND ingredient in ('riz');
UPDATE recipe_ingredients_wk
SET unit_g = 80*quantity::float
WHERE unit ilike '%portion%' AND ingredient in ('épinard','pâte');
UPDATE recipe_ingredients_wk
SET unit_g = 120*quantity::float
WHERE unit ilike '%portion%' AND ingredient in ('cabillaud','colin','lieu noir','poisson','saumon');
UPDATE recipe_ingredients_wk
SET unit_g = 150*quantity::float
WHERE unit ilike '%portion%' AND ingredient in ('dos de cabillaud','requin');
----------------------------------------------------------------------------------------------
-- QUARTIER
UPDATE recipe_ingredients_wk
SET unit_g = 1.5*quantity::float
WHERE unit ilike '%quartier%' AND ingredient ilike '%ail%';

UPDATE recipe_ingredients_wk
SET unit_g = 300*quantity::float
WHERE unit ilike '%quartier%' AND ingredient ilike '%courge%';
----------------------------------------------------------------------------------------------
-- QUEUE
UPDATE recipe_ingredients_wk
SET unit_g = 700*quantity::float
WHERE unit ilike '%queue%' AND ingredient ilike '%lotte%';
----------------------------------------------------------------------------------------------
-- RESTE
UPDATE recipe_ingredients_wk
SET unit_g = 150*quantity::float
WHERE unit ilike '%reste%' AND (ingredient ilike '%légume%' or ingredient ilike '%volaille%');
UPDATE recipe_ingredients_wk
SET unit_g = 100*quantity::float
WHERE unit ilike '%reste%' AND ingredient ilike '%viande%';
UPDATE recipe_ingredients_wk
SET unit_g = 60*quantity::float
WHERE unit ilike '%reste%' AND ingredient ilike '%maroilles%';
UPDATE recipe_ingredients_wk
SET unit_g = 45*quantity::float
WHERE unit ilike '%reste%' AND ingredient ilike '%vieux lille%';
----------------------------------------------------------------------------------------------
-- RONDELLE
UPDATE recipe_ingredients_wk
SET unit_g = 20*quantity::float
WHERE unit ilike '%rondelle%' AND ingredient ilike '%ananas%';
UPDATE recipe_ingredients_wk
SET unit_g = 15*quantity::float
WHERE unit ilike '%rondelle%' AND ingredient in ('andouille','chèvre','Foie gras','fromage de chèvre','tomate');
UPDATE recipe_ingredients_wk
SET unit_g = 10*quantity::float
WHERE unit ilike '%rondelle%' AND ingredient in ('citron','courgette','oignon rouge','surimi','poivron rouge');
UPDATE recipe_ingredients_wk
SET unit_g = 5*quantity::float
WHERE unit ilike '%rondelle%' AND ingredient in ('carotte','galanga','gingembre');
UPDATE recipe_ingredients_wk
SET unit_g = 8*quantity::float
WHERE unit ilike '%rondelle%' AND ingredient ilike '%saucisson sec%';
UPDATE recipe_ingredients_wk
SET unit_g = 6*quantity::float
WHERE unit ilike '%rondelle%' AND ingredient ilike '%chorizo%';
UPDATE recipe_ingredients_wk
SET unit_g = 4*quantity::float
WHERE unit ilike '%rondelle%' AND ingredient ilike '%tomate séchée%';
UPDATE recipe_ingredients_wk
SET unit_g = 2*quantity::float
WHERE unit ilike '%rondelle%' AND ingredient in ('piment','truffe');
----------------------------------------------------------------------------------------------
-- ROULEAU
UPDATE recipe_ingredients_wk
SET unit_g = 250*quantity::float
WHERE unit ilike '%rouleau%' AND ingredient ilike '%pâte%';
UPDATE recipe_ingredients_wk
SET unit_g = 15*quantity::float
WHERE unit ilike '%rouleau%' AND unit_g is null;
----------------------------------------------------------------------------------------------
-- SACHET
UPDATE recipe_ingredients_wk
SET unit_g = 750*quantity::float
WHERE unit ilike '%sachet%' AND ingredient in ('champagne');
UPDATE recipe_ingredients_wk
SET unit_g = 250*quantity::float
WHERE unit ilike '%sachet%' AND ingredient in ('béchamel','beurre blanc','blé','champignon','court-bouillon','Fruits de mer',
                                              'gelée au madère','gnocchi','lasagne','moules','nouille','nouilles chinoises','oignon',
                                              'pâte filo','purée','riz','riz basmati','riz long','sauce au poivre');
UPDATE recipe_ingredients_wk
SET unit_g = 200*quantity::float
WHERE unit ilike '%sachet%' AND ingredient in ('céréale','champignon noir','crabe','crevette','encornet','fromage râpé','gésier de volaille',
                                              'girolles','gruyère','gruyère râpé','julienne','lardon','légume','merlan','mozzarella',
                                              'Parmesan','parmesan râpé','Parmesan râpé','surimi','tsuyu (bouillon au poisson volant)','vermicelles de riz');
UPDATE recipe_ingredients_wk
SET unit_g = 150*quantity::float
WHERE unit ilike '%sachet%' AND ingredient in ('cresson','mâche','mesclun','miettes de crabe','noix de pétoncle','olives vertes','pousses d''épinards',
                                              'roquette');
UPDATE recipe_ingredients_wk
SET unit_g = 50*quantity::float
WHERE unit ilike '%sachet%' AND ingredient in ('morille','pignon');
UPDATE recipe_ingredients_wk
SET unit_g = 10*quantity::float
WHERE unit ilike '%sachet%' AND ingredient in ('bouillon','dashi','épice','épices à colombo','épices à tajine','épices tandoori','épices à paella',
                                              'garam masala','gélatine','gélatine en poudre','levure','levure chimique','levure de boulanger',
                                              'mélange d''épices mexicaines','mélange d''épices pour chili','poudre à colombo','spigol',
                                              'sucre vanillé','épices pour tajine');
UPDATE recipe_ingredients_wk
SET unit_g = 5*quantity::float
WHERE unit ilike '%sachet%' AND ingredient in ('colorant');
UPDATE recipe_ingredients_wk
SET unit_g = 2*quantity::float
WHERE unit ilike '%sachet%' AND ingredient in ('thé');
UPDATE recipe_ingredients_wk
SET unit_g = 1*quantity::float
WHERE unit ilike '%sachet%' AND ingredient in ('safran');
----------------------------------------------------------------------------------------------
-- TÊTE
UPDATE recipe_ingredients_wk
SET unit_g = 500*quantity::float
WHERE unit ilike '%tête%';
----------------------------------------------------------------------------------------------
-- TRANCHE
UPDATE recipe_ingredients_wk
SET unit_g = 150*quantity::float
WHERE unit ilike '%tranche%' AND ingredient in ('espadon','colin','jarret de veau','lieu noir','thon','congre','poitrine de porc');
UPDATE recipe_ingredients_wk
SET unit_g = 120*quantity::float
WHERE unit ilike '%tranche%' AND ingredient in ('saumon','truite','petit salé','rumsteck','boeuf','poisson','blanc de poulet','rumsteak',
                                               'sauté de veau','sanglier','escalope','porc','échine de porc','mouton','foie de veau','morue');
UPDATE recipe_ingredients_wk
SET unit_g = 100*quantity::float
WHERE unit ilike '%tranche%' AND ingredient in ('foie','Rosbif','Magret de Canard','rôti de porc');
UPDATE recipe_ingredients_wk
SET unit_g = 40*quantity::float
WHERE unit ilike '%tranche%' AND ingredient in ('courge','Foie gras','pâté de foie','pain de campagne');
UPDATE recipe_ingredients_wk
SET unit_g = 35*quantity::float
WHERE unit ilike '%tranche%' AND ingredient in ('pain complet','pain brioché','coulommier','pain d''épices','brioche','pain aux céréales');
UPDATE recipe_ingredients_wk
SET unit_g = 30*quantity::float
WHERE unit ilike '%tranche%' AND ingredient in ('saumon fumé Norvège U','reblochon','saint-nectaire','roquefort','lard fumé',
                                               'chou blanc','baguette','tome de brebis','jambon blanc','Bresse Bleu','charcuterie',
                                               'Jambon supérieur sans couenne filière taux de sel réduit Bleu Blanc Coeur U',
                                               'fromage','ventrèche','cheddar','saucisson à l''ail','jambon','feta','orange',
                                               'poitrine fumée','emmental','raclette','beaufort','saumon fumé','comté',
                                               'pain','gouda','tranche de jambon blanc bio Monique Ranou®','bleu','mozzarella',
                                               'aubergine','gruyère','lard','fromage à raclette','camembert');
UPDATE recipe_ingredients_wk
SET unit_g = 25*quantity::float
WHERE unit ilike '%tranche%' AND ingredient in ('ananas','jambon fumé','jambon sec','speck','pancetta','coppa','Jambon de Parme','jambon cru','pain de mie');
UPDATE recipe_ingredients_wk
SET unit_g = 20*quantity::float
WHERE unit ilike '%tranche%' AND ingredient in ('bacon','mie de pain','toastinette','viande de grison','bûche de chèvre','courgette','chèvre');
UPDATE recipe_ingredients_wk
SET unit_g = 15*quantity::float
WHERE unit ilike '%tranche%' AND ingredient in ('tomate','andouille');
UPDATE recipe_ingredients_wk
SET unit_g = 10*quantity::float
WHERE unit ilike '%tranche%' AND ingredient in ('lardon','surimi','citron vert','citron','salami','citron confit','rosette');
UPDATE recipe_ingredients_wk
SET unit_g = 5*quantity::float
WHERE unit ilike '%tranche%' AND ingredient in ('sel blanc','galanga','chorizo','tomate séchée');
