import streamlit as st
import pandas as pd

st.set_page_config(page_title="🍽️ FlavorFit", layout="wide")

# --- Chargement des CSV
recettes = pd.read_csv("../data/recettes_scrapees.csv")
ingredients = pd.read_csv("../data/ingredient_scrapees.csv")

# --- Nettoyage léger (optionnel selon ton format)
recettes.columns = recettes.columns.str.lower()
ingredients.columns = ingredients.columns.str.lower()

# --- Interface
st.title("🍲 Explorer les recettes et leurs ingrédients")

# Sélecteur de recette
recette_choisie = st.selectbox(
    "Sélectionne une recette :",
    recettes["titre"] if "titre" in recettes.columns else recettes.iloc[:, 1]
)

# Récupération de l'ID de la recette sélectionnée
id_recette = recettes.loc[
    recettes["titre"] == recette_choisie, "id_recette"
].values[0]

# Affichage des infos sur la recette
st.subheader(f"📋 Détails de la recette : {recette_choisie}")
st.dataframe(recettes[recettes["id_recette"] == id_recette])

# Affichage des ingrédients associés
st.subheader("🧂 Ingrédients associés")
ingr_recette = ingredients[ingredients["id_recette"] == id_recette]

if ingr_recette.empty:
    st.info("Aucun ingrédient trouvé pour cette recette.")
else:
    st.dataframe(ingr_recette)

# --- Optionnel : graphique
if "nom" in ingr_recette.columns:
    st.bar_chart(ingr_recette["titre"].value_counts())
