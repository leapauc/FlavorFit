import streamlit as st
import os
from tools.helpers import get_base64_image


def show(check_login,BASE_DIR):
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
        height: 40vh;
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
        top: 75px; /* position verticale fixe (modifiable) */
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
        font-size: 50px;
    }} 
    .fixed-text h3 {{
        font-size: 30px;
    }}  
    .about-container {{
        padding-left:10%;
        padding-top:50px;
        width:80%;
    }}
    </style>
    """, unsafe_allow_html=True)

    st.markdown("""<div class="hero-section"><div class="fixed-text"><h1><span class="accent">Bonjour, bienvenue dans l'espace de connexion<span></h1></div>""", unsafe_allow_html=True)

    # Utilisation de colonnes pour centrer avec padding
    left, center, right = st.columns([1, 2, 1])  # la colonne du milieu est plus large
    with center:      
        st.title("Connexion")  
        st.markdown("<br>", unsafe_allow_html=True)  # espace
        
        email = st.text_input("Email")
        st.markdown("<br>", unsafe_allow_html=True)  # espace
        password = st.text_input("Mot de passe", type="password")
        st.markdown("<br>", unsafe_allow_html=True)  # espace
        
        st.markdown("""
            <style>
            .stButton > button {
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 0 auto;
                height: 60px;
                width: 120px;
                color: white !important;
                background-color: rgb(255,165,0) !important;
                border: 0 !important;
                border-radius: 15px !important;
                font-size: 28px !important;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.2s ease-in-out;
            }
            .stButton > button:hover { transform: scale(1.1); }
            </style>
            """, unsafe_allow_html=True)
        if st.button("Se connecter"):
            status = check_login(email, password)
            if status:
                st.session_state['logged_in'] = True
                st.session_state['email'] = email
                st.session_state['status'] = status
                st.session_state['page'] = "home"
            else:
                st.error("Email ou mot de passe incorrect.")
        
        st.markdown("<br>", unsafe_allow_html=True)  # espace avant le lien
        
        # Lien stylé comme un lien classique
        link_html = """
        <p style='text-align:center;'>
            <a href='/?page=inscription'">Pas encore de compte ? Inscrivez-vous ici</a>
        </p>
        """
        # Mettre à jour le page state via le clic : on peut utiliser un petit hack
        if st.markdown(link_html, unsafe_allow_html=True):
            if st.session_state.get('page') != 'signup':
                st.session_state['page'] = 'signup'
