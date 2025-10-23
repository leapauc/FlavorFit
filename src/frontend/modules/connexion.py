import streamlit as st
from tools.helpers import get_base64_image
import os

def render(recettes, ingredients,BASE_DIR):
    ASSETS_DIR = os.path.join(BASE_DIR, "assets", "background")
    # --- Chargement de l'image d'arrière-plan ---
    image_path = os.path.join(ASSETS_DIR, "login_signin.png")
    image_base64 = get_base64_image(image_path) if os.path.exists(image_path) else ""


    st.markdown(f"""
    <style>
    .hero-section {{
        background-image: url("data:image/png;base64,{image_base64}");
        background-size: cover;
        background-position: center;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        position: relative;
    }}
    </style>
    """, unsafe_allow_html=True)
    st.markdown('<div class="content-block">', unsafe_allow_html=True)
    st.title("À propos")
    st.write("Voici quelques informations à propos du site FlavorFIT.")
    st.markdown('</div>', unsafe_allow_html=True)