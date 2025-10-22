import streamlit as st
import streamlit.components.v1 as components
import os
import base64
import pandas as pd
import html


# --- Chargement des CSV ---
recettes = pd.read_csv("../data/recettes_scrapees.csv")
ingredients = pd.read_csv("../data/ingredient_scrapees.csv")

# --- Fonction pour convertir une image locale en base64 ---
def get_base64_image(image_path):
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode()

# --- Chemin absolu vers l'image locale ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
image_path = os.path.join(BASE_DIR, "..", "assets", "background", "accueil.png")

# Vérifie si l'image existe
if not os.path.exists(image_path):
    st.warning(f"⚠️ Image introuvable : {image_path}")
    image_base64 = ""
else:
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
    padding: 20px;
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
    st.title("Bienvenue sur FlavorFIT")
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
        st.write("Description du premier service.")
        st.markdown('</div>', unsafe_allow_html=True)
    with col2:
        st.markdown('<div class="content-block">', unsafe_allow_html=True)
        st.header("Service 2")
        st.write("Description du deuxième service.")
        st.markdown('</div>', unsafe_allow_html=True)
    with col3:
        st.markdown('<div class="content-block">', unsafe_allow_html=True)
        st.header("Service 3")
        st.write("Description du troisième service.")
        st.markdown('</div>', unsafe_allow_html=True)
    
    st.markdown('</div>', unsafe_allow_html=True)

# --- PAGE RECETTES ---
elif page == "Recettes":
    st.markdown('<div class="content-block">', unsafe_allow_html=True)
    st.title("🍽️ Nos Recettes")

    recette_choisie = st.selectbox(
        "Sélectionne une catégorie :",
        recettes["category"].unique()
    )

    # Filtrer les recettes selon la catégorie choisie
    recettes_filtrees = recettes[recettes["category"] == recette_choisie].copy()
    recettes_filtrees["img_url"] = recettes_filtrees["img_url"].fillna("").astype(str).str.strip()

    # Conteneur des cards
    cards_html = """
    <style>
    .cards-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        gap: 20px;
        padding: 20px;
    }
    .card {
         flex: 1 1 calc(22% - 40px); /* max 3 par ligne */
        max-width: 22%;
        background-color: white;
        border-radius: 15px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        overflow: hidden;
        text-align: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .card:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 12px rgba(0,0,0,0.2);
    }
    .card img {
        width: 100%;
        height: 180px;
        object-fit: cover;
    }
    .card-title {
        font-size: 18px;
        font-weight: bold;
        color: #FF4500;
        padding: 10px;
    }
    /* Responsive */
    @media (max-width: 1000px) {
        .card { width: 45%; }
    }
    @media (max-width: 600px) {
        .card { width: 90%; }
    }
    </style>
    <div class="cards-container">
    """

    for _, row in recettes_filtrees.iterrows():
        image_url = row["img_url"] if row["img_url"] else "https://via.placeholder.com/300x200?text=Image+non+disponible"
        titre_card = row["titre"] if "titre" in recettes.columns else "Recette sans titre"

        # Échapper les caractères spéciaux
        titre_card_html = html.escape(titre_card)

        cards_html += f"""
        <div class="card">
            <img src="{image_url}" alt="{titre_card_html}">
            <div class="card-title">{titre_card_html}</div>
        </div>
        """

    cards_html += "</div>"

    # ✅ Affichage via components.html (et plus markdown)
    components.html(cards_html, height=900, scrolling=True)

    st.markdown('</div>', unsafe_allow_html=True)

# --- PAGE À PROPOS ---
elif page == "À propos":
    st.markdown('<div class="content-block">', unsafe_allow_html=True)
    st.title("À propos")
    st.write("Voici quelques informations à propos du site FlavorFIT.")
    st.markdown('</div>', unsafe_allow_html=True)

# --- PAGE CONNEXION ---
elif page == "Se connecter":
    st.markdown('<div class="content-block">', unsafe_allow_html=True)
    st.title("Se connecter")
    st.write("Veuillez renseigner identifiant et mot de passe.")
    st.markdown('</div>', unsafe_allow_html=True)
