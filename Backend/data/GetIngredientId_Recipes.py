import pandas as pd
import unidecode

# ---------------------------
# 1. CHARGEMENT DES FICHIERS
# ---------------------------
df_nut = pd.read_csv("Backend/data/files/ingredients_nutrition.csv")    # contient id + nutrition
df_rec = pd.read_csv("Backend/data/files/ingredientS_filtrees.csv")       # ingrédients recettes


# --------------------------------
# 2. FONCTION DE NORMALISATION
# --------------------------------
def norm(s):
    if isinstance(s, str):
        return unidecode.unidecode(s.lower().strip())
    return ""


df_nut["norm_sing"] = df_nut["singulier"].apply(norm)
df_nut["norm_plur"] = df_nut["pluriel"].apply(norm)

df_rec["norm_ing"] = df_rec["ingredient"].apply(norm)


# -------------------------------------------------------
# 3. TROUVER LE id_ingredient POUR CHAQUE INGREDIENT RECETTE
# -------------------------------------------------------
def find_id(ing):

    # 1. match exact sur singulier
    m1 = df_nut[df_nut["norm_sing"] == ing]
    if not m1.empty:
        return m1.iloc[0]["id_ingredient"]

    # 2. exact sur pluriel
    m2 = df_nut[df_nut["norm_plur"] == ing]
    if not m2.empty:
        return m2.iloc[0]["id_ingredient"]

    # 3. match partiel "contient" (poivron rouge → poivron)
    m3 = df_nut[df_nut["norm_sing"].apply(lambda x: x in ing)]
    if not m3.empty:
        return m3.iloc[0]["id_ingredient"]

    m4 = df_nut[df_nut["norm_plur"].apply(lambda x: x in ing)]
    if not m4.empty:
        return m4.iloc[0]["id_ingredient"]

    # Aucun match
    return None


df_rec["id_ingredient"] = df_rec["norm_ing"].apply(find_id)


# -------------------------------------------------------
# 4. AJOUTER img_url DANS ingredients_nutrition.csv
# -------------------------------------------------------
# On prend la 1ère image trouvée pour chaque ingrédient
img_map = (
    df_rec.dropna(subset=["id_ingredient"])
          .groupby("id_ingredient")["img_url"]
          .first()
)

# id_ingredient en int
df_rec["id_ingredient"] = df_rec["id_ingredient"].fillna(-1).astype(int)
df_nut["id_ingredient"] = df_nut["id_ingredient"].astype(int)

# img_url : juste mapper, pas de conversion
df_nut["img_url"] = df_nut["id_ingredient"].map(img_map)

# -------------------------------------------------------
# 5. SAUVEGARDE DES FICHIERS
# -------------------------------------------------------
df_rec.to_csv("Backend/data/files/ingredient_filtrees_with_id.csv", index=False)
df_nut.to_csv("Backend/data/files/ingredients_nutrition_with_img.csv", index=False)

print("✔ ingredient_filtrees_with_id.csv créé")
print("✔ ingredients_nutrition_with_img.csv mis à jour")
