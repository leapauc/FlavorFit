import streamlit as st
import os
import base64
import pandas as pd

# --- Chargement des CSV
recettes = pd.read_csv("../data/recettes_scrapees.csv")
ingredients = pd.read_csv("../data/ingredient_scrapees.csv")

# --- Fonction pour convertir une image locale en base64 ---
def get_base64_image(image_path):
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode()

# --- Chemin absolu vers l'image locale ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
image_path = os.path.join(BASE_DIR, "..", "assets", "background", "accueil.png")
image_base64 = get_base64_image(image_path)

# --- Config de la page ---
st.set_page_config(page_title="Mon site Streamlit", layout="wide")

# --- Pages disponibles ---
pages = ["Accueil", "Recettes", "À propos", "Se connecter"]

# --- Récupérer la page depuis l'URL ---
page = st.query_params.get("page", ["Recettes"])[0]

# --- CSS personnalisé avec image en base64 ---
st.markdown(f"""
<style>
.hero-section {{
    background-image: url("data:image/png;base64,{image_base64}");
    background-size: cover;
    background-position: center;
    height: 70vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    position: relative;
}}

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

/* Lien du nom du site */
.nom-site {{
    color: rgb(255, 69, 0) !important;
    font-size: 50px !important;
    font-weight: bold;
}}

/* Bloc de contenu arrondi */
.content-block {{
    background-color: rgba(255,255,255,0.95);
    border-radius: 15px;
    width: 90%;
    margin: 20px 0;
}}
</style>
""", unsafe_allow_html=True)

# --- Navbar HTML ---
nav_html = '<div class="hero-section">'
nav_html += '<div class="nav-bar_container"><div class="nav-bar">'

for idx, p in enumerate(pages):
    # Ajouter FlavorFIT au milieu
    if idx == 2:
        nav_html += '<a class="nom-site" href="?page=Accueil">FlavorFIT</a>'
    nav_html += f'<a href="?page={p}">{p}</a>'

nav_html += '</div></div>'
st.markdown(nav_html, unsafe_allow_html=True)

# --- Contenu des pages ---
if page == "Accueil":
    st.markdown('<div class="content-block">', unsafe_allow_html=True)
    st.title("TEST")
    st.markdown('</div></div>', unsafe_allow_html=True)
    st.markdown('<div class="content-block">', unsafe_allow_html=True)
    st.title("Bienvenue sur mon site")
    st.subheader("Découvrez nos services et solutions innovantes")
    st.write("""
    Nous vous aidons à transformer vos idées en projets concrets.  
    Explorez nos fonctionnalités et voyez comment nous pouvons vous accompagner.
    """)

    # Trois blocs de présentation
    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown('<div class="content-block">', unsafe_allow_html=True)
        st.header("Service 1")
        st.write("Description courte du premier service, ses avantages et pourquoi il est utile.")
        st.markdown('</div>', unsafe_allow_html=True)
    with col2:
        st.markdown('<div class="content-block">', unsafe_allow_html=True)
        st.header("Service 2")
        st.write("Description courte du deuxième service avec quelques points forts.")
        st.markdown('</div>', unsafe_allow_html=True)
    with col3:
        st.markdown('<div class="content-block">', unsafe_allow_html=True)
        st.header("Service 3")
        st.write("Description courte du troisième service pour attirer l'attention du visiteur.")
        st.markdown('</div>', unsafe_allow_html=True)
    
    st.markdown('</div>', unsafe_allow_html=True)

elif page == "Recettes":
    st.markdown('<div class="content-block">', unsafe_allow_html=True)
    st.title("Recettes")
    recette_choisie = st.selectbox(
        "Sélectionne une category :",
        recettes["category"].unique()
    )
    st.write("Liste de recettes")
    # Affichage des infos sur la recette
    st.subheader(f"📋 Statistiques sur les recettes")
    st.dataframe(recettes)
    st.markdown('</div>', unsafe_allow_html=True)

elif page == "À propos":
    st.markdown('<div class="content-block">', unsafe_allow_html=True)
    st.title("À propos")
    st.write("Voici quelques informations à propos du site.")
    st.markdown('</div>', unsafe_allow_html=True)

elif page == "Se connecter":
    st.markdown('<div class="content-block">', unsafe_allow_html=True)
    st.title("Se connecter")
    st.write("Veuillez renseigner identifiant et mot de passe.")
    st.markdown('</div>', unsafe_allow_html=True)
