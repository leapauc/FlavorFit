import streamlit as st
from components.navbar import show_navbar
from components.auth import is_authenticated, login, logout
import os
import pandas as pd

# Import dynamique des pages
from pages import accueil, recettes, apropos
from components import auth
# --- Chemins absolus ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ICON_DIR = os.path.join(BASE_DIR, "assets", "logo")
ICON_PATH = os.path.join(ICON_DIR, "FlavorFit.ico")  # chemin vers ton favicon

# --- Configuration globale avec favicon ---
st.set_page_config(
    page_title="FlavorFIT",
    layout="wide",
    page_icon=ICON_PATH  # ici on met l'icône
)
# --- Masquer la sidebar ---
st.markdown(
    """
    <style>
        [data-testid="stSidebar"] {
            display: none;
        }
        [data-testid="stSidebarNav"] {
            display: none;
        }
    </style>
    """,
    unsafe_allow_html=True,
)

# --- Initialisation session ---
if "authenticated" not in st.session_state:
    st.session_state["authenticated"] = False
    st.session_state["user"] = None

DATA_DIR = os.path.join(BASE_DIR, "..", "..", "data")
ASSETS_DIR = os.path.join(BASE_DIR, "assets", "background")

# --- Chargement des CSV ---
recettes_path = os.path.join(DATA_DIR, "recettes_filtrees.csv")
ingredients_path = os.path.join(DATA_DIR, "ingredients_filtrees.csv")

recettes_list = pd.read_csv(recettes_path) if os.path.exists(recettes_path) else pd.DataFrame()
ingredients_list = pd.read_csv(ingredients_path) if os.path.exists(ingredients_path) else pd.DataFrame()

# --- Navbar dynamique ---
show_navbar()

# --- Navigation ---
page = st.query_params.get("page", "accueil")

# --- Routing simple ---
if page == "accueil":
    accueil.render(recettes_list, ingredients_list, BASE_DIR)

elif page == "connexion":
    if is_authenticated():
        st.warning("Vous êtes déjà connecté !")
    else:
        auth.render()

elif page == "recettes":
    if not is_authenticated():
        st.warning("Accés refusé. Connectez-vous d'abord.")
    else:
        recettes.render(recettes_list, ingredients_list, BASE_DIR)
elif page == "apropos":
    if not is_authenticated():
        apropos.render(BASE_DIR)
    else:
        st.warning("Accés refusé car vous êtes connecté.")

elif page == "profil":
    if not is_authenticated():
        st.warning("Accès refusé. Connectez-vous d'abord.")
    else:
        st.title("Profil 👤")
        st.write(f"Utilisateur : {st.session_state['user']['username']}")

else:
    st.error("Page non trouvée.")
