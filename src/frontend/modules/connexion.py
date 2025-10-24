import streamlit as st
from tools.helpers import get_base64_image
import os

def render(recettes, ingredients, BASE_DIR):
    ASSETS_DIR = os.path.join(BASE_DIR, "assets", "background")
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
        justify-content: flex-end; /* coller à droite */
        align-items: flex-start;
        position: relative;
        padding-right: 5%; /* petit espace à droite */
    }}
    .login-container {{
        position: absolute;
        top: -750px; /* remonter */
        left:50%;
        width: 50%; 
        padding: 30px;
        border-radius: 15px;
    }}
    </style>
    """, unsafe_allow_html=True)

    with st.container():
        st.markdown("""<div class="login-container">
                        <h3>Bonjour et bienvenue à nouveau! 👋</h3>
                        <form>
                            <label>Email</label><br>
                            <input type="text" placeholder="Entrez votre adresse e-mail ici"></input>
                            <br><br>
                            <label>Mot de passe</label><br>
                            <input type="password" placeholder="Entrez votre mot de passe ici"></input>
                            <br><br>
                            <button> Se connecter</button>
                        </form><br>
                        <p>Vous n'avez pas de compte ? <a href='#'>Créez votre compte</a></p>
                        <div class='separator'>— OU —</div><br>
                        <div>
                            <button> 🔗 Se connecter avec Google</button>
                            <button> 🐙 Se connecter avec Facebook</button>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
