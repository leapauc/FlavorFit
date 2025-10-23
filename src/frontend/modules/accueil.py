import streamlit as st
from tools.helpers import get_base64_image
import os 

def render(recettes, ingredients,BASE_DIR):
    ASSETS_DIR = os.path.join(BASE_DIR, "assets", "background")
    # --- Chargement de l'image d'arrière-plan ---
    image_path = os.path.join(ASSETS_DIR, "accueil.png")
    image_base64 = get_base64_image(image_path) if os.path.exists(image_path) else ""

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
    </style>
    """, unsafe_allow_html=True)
    st.markdown('<div class="content-block">', unsafe_allow_html=True)
    st.title("Bienvenue sur FlavorFIT")
    st.subheader("Découvrez nos services et solutions innovantes")
    st.write("""
    Nous vous aidons à transformer vos idées en projets concrets.  
    Explorez nos fonctionnalités et voyez comment nous pouvons vous accompagner.
    """)

    # --- 3 colonnes côte à côte ---
    col1, col2, col3 = st.columns(3)

    # On parcourt les colonnes avec les titres associés
    for col, titre in zip([col1, col2, col3], ["Service 1", "Service 2", "Service 3"]):
        with col:
            st.markdown('<div class="content-block">', unsafe_allow_html=True)
            st.header(titre)
            st.write(f"Description du {titre.lower()}.")
            st.markdown('</div>', unsafe_allow_html=True)

    st.markdown('</div>', unsafe_allow_html=True)
