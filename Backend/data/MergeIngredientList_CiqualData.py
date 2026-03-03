import pandas as pd
import unidecode

# --- 1. Chargement des fichiers ---
df_norm = pd.read_csv("Backend/data/files/ingredients_normalises.csv")          # colonnes: singulier, pluriel
df_ciqual = pd.read_csv("Backend/data/files/Table Ciqual 2025_FR_2025_07_07.csv")  # colonne: ingredient + valeurs nutritionnelles

# --- 2. Normalisation des noms ---
def normalize(s):
    if isinstance(s, str):
        return unidecode.unidecode(s.lower().strip())
    return s

df_norm["norm_sing"] = df_norm["singulier"].apply(normalize)
df_norm["norm_plur"] = df_norm["pluriel"].apply(normalize)
df_ciqual["norm_ing"] = df_ciqual["ingredient"].apply(normalize)

# --- 3. Fonction pour trouver la bonne ligne CIQUAL ---
def find_nutrition(row):
    # 1) Recherche par singulier
    match_sing = df_ciqual[df_ciqual["norm_ing"] == row["norm_sing"]]
    if not match_sing.empty:
        return match_sing.iloc[0]  # prendre le premier
    
    # 2) Recherche par pluriel
    match_plur = df_ciqual[df_ciqual["norm_ing"] == row["norm_plur"]]
    if not match_plur.empty:
        return match_plur.iloc[0]  # prendre le premier
    
    # 3) Aucun résultat
    return pd.Series([None] * len(df_ciqual.columns), index=df_ciqual.columns)

# --- 4. Application à toute la table ---
df_results = df_norm.apply(find_nutrition, axis=1)

# --- 5. Fusion finale ---
df_final = pd.concat([df_norm[["singulier", "pluriel"]], df_results], axis=1)

# --- 6. Ajout d'un ID unique ---
df_final.insert(0, "id_ingredient", ["{:05d}".format(i+1) for i in range(len(df_final))])

# --- 7. Export ---
df_final.to_csv("Backend/data/files/ingredients_nutrition.csv", index=False)

print("Fichier créé : ingredients_nutrition.csv")