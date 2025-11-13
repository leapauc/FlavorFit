# Projet LDF - Liste recette selon habitudes alimentaires

## Prérequis

```
pip install pandas
pip install selenium
pip install bs4
pip install requests
pip install unidecode
pip install streamlit
```

## Générer le fichier requirements.txt

```
pip freeze -l > requirements.txt
```

## Lancer streamlit

```
streamlit run src/frontend/app.py
```

# SOURCES SUPPLEMENTAIRES

Site avec ingrédients et catégorie + idées recettes :

https://www.academiedugout.fr/encyclopedie

# TO DO LIST

SITE DE https://ciqual.anses.fr/
Récup par ingrédient :

- sel NaCl
- Fibres alimentaires
- Prot
- Lipide
- AG saturés
- Glucide
- Sucre
- Cholestérol (facultatif)
- Energie, Règlement UE N° 1169/2011 (kJ/100 g)
- Energie, Règlement UE N° 1169/2011 (kcal/100 g)

Ajout petit dej

Filtre supplémentaire :

- repas rapide vs repas long/mijoté
- prépa simple, peu d'ingrédients
- prix
- eco_score
- compatible : Airfryer, Cookeo,...
