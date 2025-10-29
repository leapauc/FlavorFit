import streamlit as st
from tools.helpers import get_base64_image
import os
 

def render(BASE_DIR):
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
        top: 150px; /* position verticale fixe (modifiable) */
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

    st.markdown('<div class="hero-section"><div class="fixed-text"><h1><span class="accent">A propos<span></h1></div>', unsafe_allow_html=True)


    # --- 2. STRUCTURE HTML GLOBALE ---
    st.markdown("<div class='about-container'>", unsafe_allow_html=True)
 
    # --- 3. MISE EN PAGE PRINCIPALE ---
    col0, col_gauche, col_droite,col2 = st.columns([0.5,1, 2,0.5], gap="large")
 
    # --- 4. COLONNE GAUCHE ---
    with col_gauche:
        st.markdown("<h1 style='font-size: 4em; margin-bottom: 0;'>30,000+</h1>", unsafe_allow_html=True)
        st.write("utilisateurs en juillet 2021 avec des notes 5 étoiles et des clients satisfaits..")
        st.markdown("<hr style='border: none; height: 3px; background-color: #ff8c00; width: 60%; margin-left: 0;'/>", unsafe_allow_html=True)
        st.markdown("""
        <div style="display: flex; gap: 5px; margin-top: 15px;">
            <span style="font-size: 2em;">😀</span>
            <span style="font-size: 2em;">😊</span>
            <span style="font-size: 2em;">🤩</span>
            <span style="font-size: 2em; color: #ff8c00;">12+</span>
        </div>
        """, unsafe_allow_html=True)
        st.subheader("Best ratings")
        st.markdown("""
        <div style="margin-top: -20px;">
            <div style="background-color: #e0e0e0; height: 10px; width: 70%; border-radius: 5px;"></div>
            <div style="background-color: #e0e0e0; height: 10px; width: 40%; margin-top: 5px; border-radius: 5px;"></div>
        </div>
        """, unsafe_allow_html=True)
 
    # --- 5. COLONNE DROITE ---
    with col_droite:
        st.markdown("<p style='text-transform: uppercase; font-size: 0.9em; letter-spacing: 2px;'>UN PEU</p>", unsafe_allow_html=True)
        st.markdown("<h1 style='font-size: 3.5em; margin-top: -10px;'>À propos de nous</h1>", unsafe_allow_html=True)
        st.write("""
        **FlavorFit** est une plateforme innovante dédiée à la **nutrition personnalisée**.
 
        Notre mission est d'aider les professionnels de la santé — diététiciens, nutritionnistes, coachs — à accompagner
        plus efficacement leurs patients, tout en offrant à chacun des outils simples pour mieux comprendre et
        équilibrer son alimentation.
        """)
        st.button("EN SAVOIR PLUS")
 
    st.markdown("</div></div>", unsafe_allow_html=True)
 