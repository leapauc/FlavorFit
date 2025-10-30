import streamlit as st
from streamlit_option_menu import option_menu
import pages.accueil as accueil
import pages.connexion as login
import pages.home as user
import pages.recettes as recettes
import pages.apropos as apropos
import pages.generator as generator
import pages.inscription as signin
import pandas as pd
import os

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

# ----------------------------
# Chargement des utilisateurs
# ----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ICON_DIR = os.path.join(BASE_DIR, "assets", "logo")
ICON_PATH = os.path.join(ICON_DIR, "FlavorFit.ico")  # chemin vers ton favicon

# --- Configuration globale avec favicon ---
st.set_page_config(
    page_title="FlavorFIT",
    layout="wide",
    page_icon=ICON_PATH  # ici on met l'icône
)

DATA_DIR = os.path.join(BASE_DIR, "..", "..", "data")
ASSETS_DIR = os.path.join(BASE_DIR, "assets", "background")

# --- Chargement des données ---
recettes_path = os.path.join(DATA_DIR, "recettes_filtrees.csv")
ingredients_path = os.path.join(DATA_DIR, "ingredients_filtrees.csv")

recettes_list = pd.read_csv(recettes_path) if os.path.exists(recettes_path) else pd.DataFrame()
ingredients_list = pd.read_csv(ingredients_path) if os.path.exists(ingredients_path) else pd.DataFrame()

csv_path = os.path.join(DATA_DIR, "users.csv")
df_users = pd.read_csv(csv_path)

# ----------------------------
# Initialisation session_state
# ----------------------------
for key, default in {"logged_in": False, "email": "", "status": ""}.items():
    if key not in st.session_state:
        st.session_state[key] = default

# ----------------------------
# Vérification login
# ----------------------------
def check_login(email, password):
    user = df_users[(df_users['email'] == email) & (df_users['password'] == password)]
    if not user.empty:
        return user.iloc[0]['status'] 
    return None

# ----------------------------
# Navbar et style
# ----------------------------
st.markdown("""
    <style>
    .accent {
        background: linear-gradient(90deg, rgb(255,69,0), rgb(255,165,0));
        font-size:60px;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    </style>
""", unsafe_allow_html=True)

st.markdown("<h1 style='text-align: center;'><span class='accent'>FlavorFIT</span></h1>", unsafe_allow_html=True)

if st.session_state["logged_in"]:
    selected = option_menu(
        None,
        ["Mon espace", "Recettes", "HebMealGenerator"],
        icons=["person-circle", "book-half", "gear"],
        orientation="horizontal",
        default_index=0,
    )
else:
    selected = option_menu(
        None,
        ["Accueil", "Recettes", "A propos", "Connexion"],
        icons=["house-door", "book-half", "info-circle", "box-arrow-in-right"],
        orientation="horizontal",
        default_index=0,
    )

# ----------------------------
# Navigation dynamique
# ----------------------------
if selected == "Accueil":
    accueil.show(recettes_list, BASE_DIR)
elif selected == "Connexion" and not st.session_state["logged_in"]:
    login.show(check_login,BASE_DIR)
if st.session_state.get('page') == 'signup' and not st.session_state["logged_in"]:
    signin.render(BASE_DIR)
elif selected == "Mon espace" and st.session_state['logged_in']:
    user.show(BASE_DIR)
elif selected == "Recettes" and st.session_state['logged_in']:
    recettes.show(recettes_list, ingredients_list, BASE_DIR)
elif selected == "Recettes" and not st.session_state['logged_in']:
    left, center, right = st.columns([1, 2, 1])  # la colonne du milieu est plus large
    with center :
        st.warning("Pour avoir accés au contenu, veuillez vous connecter !!!")
elif selected == "A propos" and not st.session_state['logged_in']:
    apropos.show(BASE_DIR)
elif selected == "HebMealGenerator" and st.session_state['logged_in']:
    generator.show(recettes_list, ingredients_list, BASE_DIR)
