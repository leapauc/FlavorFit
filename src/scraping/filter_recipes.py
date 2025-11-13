# -- Filtrer les recettes qui ne sont pas pour N personnes --
# par exemple certaines recettes permettent de confectionner 500g de tofu, nous ne garderons pas cette recette
import pandas as pd
import os

def filtrer_recettes_personne_portion_burger():
    # --- Détermination du dossier data ---
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, '..', '..', 'data') 

    # --- Chemins vers les fichiers ---
    recettes_path = os.path.join(data_dir, 'recettes_scrapees.csv')
    ingredients_path = os.path.join(data_dir, 'ingredients_scrapees.csv')

    # --- Vérification des fichiers ---
    if not os.path.exists(recettes_path):
        print(f"❌ Fichier non trouvé : {recettes_path}")
        return
    if not os.path.exists(ingredients_path):
        print(f"❌ Fichier non trouvé : {ingredients_path}")
        return

    # --- Chargement des données ---
    recettes_df = pd.read_csv(recettes_path)
    ingredients_df = pd.read_csv(ingredients_path)

    # --- Liste des mots-clés à rechercher ---
    keywords = ["personne", "portion", "burger", "hamburger", "galette"]

    # --- Création du pattern regex ---
    pattern = "|".join(keywords)  # => "personne|portion|burger|hamburger"

    # --- Filtrage (insensible à la casse) ---
    recettes_filtrees = recettes_df[
        recettes_df['proportion'].astype(str).str.contains(pattern, case=False, na=False)
    ]

    print(f"{len(recettes_filtrees)} recettes correspondent au filtre ({', '.join(keywords)}).")

    # --- Filtrer aussi les ingrédients correspondants ---
    ingredients_filtrees = ingredients_df[
        ingredients_df['id_recette'].isin(recettes_filtrees['id_recette'])
    ]

    # --- Sauvegarde des fichiers filtrés ---
    recettes_out = os.path.join(data_dir, 'recettes_filtrees.csv')
    ingredients_out = os.path.join(data_dir, 'ingredients_filtrees.csv')

    recettes_filtrees.to_csv(recettes_out, index=False, encoding='utf-8-sig')
    ingredients_filtrees.to_csv(ingredients_out, index=False, encoding='utf-8-sig')

    print(f"Fichiers exportés :\n - {recettes_out}\n - {ingredients_out}")

if __name__ == "__main__":
    filtrer_recettes_personne_portion_burger()
