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
        position:absolute;
        top:0px;
        height: 70vh;
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
        top: 250px; /* position verticale fixe (modifiable) */
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
    .content-block {{
        padding-left:10%;
        width:80%;
    }}
    </style>
    """, unsafe_allow_html=True)

    st.markdown('<div class="hero-section"><div class="fixed-text"><h1><span class="accent">A Propos</span></h1></div></div>', unsafe_allow_html=True)

    st.markdown('<div class="content-block">', unsafe_allow_html=True)
  
    st.markdown('</div>', unsafe_allow_html=True)

    
