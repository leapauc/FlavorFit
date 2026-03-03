import pandas as pd
from rapidfuzz import process


ingredients_df = pd.read_csv('./files/ingredients_test.csv', sep=',', dtype=str)
ciqual_df = pd.read_csv('./files/Table_Ciqual_2025_clean.csv', sep=';', dtype=str)

def format_ciqual():
    # Chemin du fichier CSV
    file_path = './files/Table Ciqual 2025_FR_2025_11_03.csv'
    output_path = './files/Table_Ciqual_2025_clean.csv'

    # Lire le CSV en string pour tout traiter
    df = pd.read_csv(file_path, sep=';', dtype=str)

    # Nombre de colonnes à laisser intactes
    non_numeric_cols = df.columns[:9]
    numeric_cols = df.columns[9:]  # Colonnes à traiter

    # Nettoyage des colonnes numériques
    for col in numeric_cols:
        df[col] = df[col].str.strip()  # enlever les espaces autour
        df[col] = df[col].replace('-', '0')
        df[col] = df[col].str.replace(r'^<\s*', '', regex=True)
        df[col] = df[col].replace('traces', '0.001')
        df[col] = df[col].fillna('0')
        # Remplacer les virgules par des points pour format numérique
        df[col] = df[col].str.replace(',', '.', regex=False)

    # Sauvegarder le fichier nettoyé
    df.to_csv(output_path, sep=';', index=False, encoding='utf-8')

    print(f"Fichier nettoyé sauvegardé dans : {output_path}")

# FORMAT RECETTE FILE
def convert_to_minutes(temps):
    if pd.isna(temps):
        return 0
    # Supprimer les espaces superflus
    temps = temps.replace(" ", "")
    
    # Extraire heures et minutes
    heures = 0
    minutes = 0
    
    # Trouver les heures
    h_match = pd.Series(temps).str.extract(r'(\d+)h')
    if not h_match.isna().all().values[0]:
        heures = int(h_match.iloc[0,0])
    
    # Trouver les minutes
    m_match = pd.Series(temps).str.extract(r'(\d+)min')
    if not m_match.isna().all().values[0]:
        minutes = int(m_match.iloc[0,0])
    
    return heures * 60 + minutes

def format_recette():
    # Chemin du fichier CSV
    file_path = './files/recettes.csv'
    output_path = './files/recettes_clean.csv'

    # Lire le CSV en string pour tout traiter
    df = pd.read_csv(file_path, sep=',', dtype=str)

    if 'proportion' in df.columns:
       df["proportion"] = df["proportion"].str.extract(r'^(\d+\.?\d*)').astype(int)
    df["temps_prepa"] = df["temps_prepa"].apply(convert_to_minutes)

    df.to_csv(output_path, sep=';', index=False, encoding='utf-8')

    print(f"Fichier nettoyé sauvegardé dans : {output_path}")

# FORMAT INGREDIENTS FILE
def get_best_match(ingredient_name):
    # Liste de tous les noms nettoyés dans ciqual
    matches = ciqual_df['alim_nom_fr_clean'].tolist()
    
    # Chercher le meilleur match fuzzy
    best_match = process.extractOne(ingredient_name, matches)
    
    if best_match:
        matched_name = best_match[0]
        matched_id = ciqual_df.loc[ciqual_df['alim_nom_fr_clean'] == matched_name, 'ID'].values[0]
        return matched_id
    
    return None

def format_ingredient(ingredients_df, ciqual_df):
    # Nettoyage simple des noms
    ingredients_df['ingredient_clean'] = ingredients_df['ingredient'].str.lower().str.strip()
    ciqual_df['alim_nom_fr_clean'] = ciqual_df['alim_nom_fr'].str.lower().str.strip()

    # Appliquer à chaque ingrédient pour obtenir l'ID Ciqual
    ingredients_df['ciqual_id'] = ingredients_df['ingredient_clean'].apply(get_best_match)

    # Ajouter la colonne alim_nom_fr depuis ciqual_df via ciqual_id
    ingredients_df = ingredients_df.merge(
        ciqual_df[['ID', 'alim_nom_fr']],
        left_on='ciqual_id',
        right_on='ID',
        how='left'
    ).drop(columns=['ID'])  # supprimer la colonne ID redondante

    # Sauvegarder le résultat
    ingredients_df.to_csv('./files/ingredients_with_ciqual_id.csv', index=False, sep=';')
    print("Fichier sauvegardé avec les IDs Ciqual et noms correspondants.")
    return ingredients_df  # si tu veux récupérer le df dans le script

format_ingredient(ingredients_df, ciqual_df)
