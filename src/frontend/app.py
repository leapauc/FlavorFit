import streamlit as st
import os
import pandas as pd
import importlib

# --- Configuration globale ---
st.set_page_config(page_title="FlavorFIT", layout="wide")

# --- Chemins absolus ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "..", "data")
ASSETS_DIR = os.path.join(BASE_DIR, "assets", "background")

# --- Chargement des CSV ---
recettes_path = os.path.join(DATA_DIR, "recettes_scrapees.csv")
ingredients_path = os.path.join(DATA_DIR, "ingredient_scrapees.csv")

recettes = pd.read_csv(recettes_path) if os.path.exists(recettes_path) else pd.DataFrame()
ingredients = pd.read_csv(ingredients_path) if os.path.exists(ingredients_path) else pd.DataFrame()

# --- Définition des pages ---
pages = {
    "Accueil": "accueil",
    "Recettes": "recettes",
    "À propos": "apropos",
    "Se connecter": "connexion",
}

# --- Initialiser le paramètre "page" ---
if "page" not in st.query_params:
    st.query_params["page"] = "Accueil"

page = st.query_params["page"]
module_name = pages.get(page, "accueil")


st.markdown(f"""
<style>
/* Navbar horizontale centrée */
.nav-bar_container {{
    position: absolute;
    top: 0px;
    background-color: white;
    border-radius: 0 0 100px 100px;
    padding: 10px 20px;
    display: flex;
    justify-content: center;
    width: 70%;
}}

.nav-bar {{
    display: flex;
    justify-content: center;
    gap: 20px;
    align-items: center;
    flex-wrap: wrap;
}}

.nav-bar a {{
    text-decoration: none;
    color: black;
    padding: 5px 20px;
    font-weight: bold;
    font-size: 25px;
    transition: 0.3s;
}}

.nav-bar a:hover {{
    background-color: rgba(200,200,200,0.3);
    border-radius: 8px;
}}

.nom-site {{
    background: linear-gradient(90deg, rgb(255,69,0), rgb(255,165,0)); /* du rouge-orangé au orange clair */
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 60px !important;
    font-weight: bold;
}}

.content-block {{
    background-color: rgba(255,255,255,0.95);
    border-radius: 15px;
    width: 80%;
    margin: 20px auto;
    padding: 20px;
}}
</style>
""", unsafe_allow_html=True)

# --- Navbar HTML ---
nav_html = '<div class="hero-section"><div class="nav-bar_container"><div class="nav-bar">'
for idx, (nom, module) in enumerate(pages.items()):
    # Insérer le nom du site "FlavorFIT" au centre
    if idx == 2:
        nav_html += '<a class="nom-site" href="?page=Accueil">FlavorFIT</a>'
    # Surligner la page active
    active_style = 'style="text-decoration:underline; color:rgb(255,69,0);"' if page == nom else ""
    nav_html += f'<a href="?page={nom}" {active_style}>{nom}</a>'
nav_html += '</div></div></div>'
st.markdown(nav_html, unsafe_allow_html=True)

# --- Chargement dynamique du module actif ---
try:
    page_module = importlib.import_module(f"modules.{module_name}")
    if hasattr(page_module, "render"):
        page_module.render(recettes, ingredients,BASE_DIR)
    else:
        st.error(f"⚠️ Le module **{module_name}.py** ne contient pas de fonction `render()`.")
except Exception as e:
    st.error(f"Erreur lors du chargement de la page **{page}** : {e}")
