import streamlit as st
import os 
from tools.helpers import get_base64_image

def show(BASE_DIR):
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
            position:absolute;
            top:0px;
            width:100%;
            height: 30vh;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            position: relative;
        }}
        .accent {{
            background: linear-gradient(90deg, rgb(255,69,0), rgb(255,165,0)); /* du rouge-orangé au orange clair */
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        /* Div centrée horizontalement et y fixe */
        .fixed-text {{
            position: absolute;
            top: 55px; /* position verticale fixe (modifiable) */
            left: 50%;   /* centre horizontal */
            transform: translateX(-50%);
            background-color: rgba(255,255,255,0.9);
            padding: 15px 30px;
            border-radius: 40px;
            text-align: center;
            font-size: 1.8rem;
            font-weight: bold;
        }}
        .fixed-text h1 {{
            font-size: 30px;
        }} 
        .fixed-text h3 {{
            font-size: 20px;
        }}  
        .content-block {{
            padding-left:10%;
            width:80%;
        }}
        </style>
        """, unsafe_allow_html=True)
    st.markdown('<div class="hero-section"><div class="fixed-text"><h1><span class="accent">👤 Mon espace</span></h1></div>', unsafe_allow_html=True)

    left, center, right = st.columns([1, 2, 1])  # la colonne du milieu est plus large
    with center :
        st.markdown(f"""<h2 style="padding-top:50px;">Bonjour {st.session_state['email']} !</h2>""", unsafe_allow_html=True)
        st.markdown(f"""<h4>Votre statut : {st.session_state['status']}</h4>""", unsafe_allow_html=True)

        if st.button("Se déconnecter"):
            st.session_state['logged_in'] = False
            st.session_state['email'] = ""
            st.session_state['status'] = ""
            st.success("Vous êtes déconnecté !")
            st.rerun()
