import streamlit as st
from tools.helpers import get_base64_image, load_users, verify_password
import os
 
def render(recettes, ingredients, BASE_DIR):
    DATA_DIR = os.path.join(BASE_DIR, "..", "..", "data")
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
        top: 200px; /* remonter */
        left:50%;
        width: 50%;
        padding: 30px;
        border-radius: 15px;
    }}
    .login-container h3 {{
        font-weight: 700;
        color: #222;
        margin-bottom: 30px;
    }}
 
    /* --- INPUTS --- */
    .login-container input {{
        width: 100%;
        padding: 12px 15px;
        border-radius: 10px;
        border: 1px solid #ddd;
        margin-top: 8px;
        font-size: 15px;
        background-color: #f7f7f7;
        outline: none;
        transition: border-color 0.3s;
    }}
    .login-container input:focus {{
        border-color: #f59e0b;
    }}
 
    label {{
        display: block;
        text-align: left;
        color: #333;
        font-weight: 600;
        margin-top: 15px;
    }}
        /* --- BUTTON PRINCIPAL --- */
    .login-button {{
        background-color: #f59e0b;
        color: white;
        font-weight: 700;
        border: none;
        border-radius: 10px;
        padding: 12px;
        width: 50%;
        margin-left: 25%;
        font-size: 16px;
        margin-top: 25px;
        cursor: pointer;
        transition: background-color 0.3s;
    }}
    .login-button:hover {{
        background-color: #e48c06;
    }}
        /* --- LINKS --- */
    .login-container p {{
        margin-top: 15px;
        color: #555;
         margin-left: 25%;
 
    }}
    .login-container a {{
        color: #f59e0b;
        font-weight: 600;
        text-decoration: none;
    }}
    .login-container a:hover {{
        text-decoration: underline;
    }}
       /* --- SEPARATOR --- */
    .separator {{
        margin: 25px 0;
        color: #aaa;
        font-weight: 500;
       margin-left: 50%;
    }}
    /* --- SOCIAL BUTTONS --- */
    .social-buttons {{
        display: flex;
        justify-content: center;
        gap: 10px;
    }}
    .social-buttons button {{
        flex: 1;
        border: 1px solid #ddd;
        background-color: #fff;
        color: #333;
        font-weight: 500;
        border-radius: 10px;
        padding: 10px;
        cursor: pointer;
        transition: all 0.3s;
    }}
    .social-buttons button:hover {{
        background-color: #f9f9f9;
    }}
    </style>
    """, unsafe_allow_html=True)
 
    with st.container():
        st.markdown("""
        <div class="hero-section"> <div class="login-container">
            <h3>Bonjour et bienvenue à nouveau! 👋</h3>
            <form>
                <label>Email</label><br>
                <input type="text" placeholder="Entrez votre adresse e-mail ici"></input>
                <br><br>
                <label>Mot de passe</label><br>
                <input type="password" placeholder="Entrez votre mot de passe ici"></input>
                <br><br>
                <button class ="login-button" type="button">Se connecter</button>
            </form><br>
            <p>Vous n'avez pas de compte ? <a href='#'>Créez votre compte</a></p>
            <div class='separator'>— OU —</div><br>
            <div class="social-buttons">
                <button>🔗 Se connecter avec Google</button>
                <button>🐙 Se connecter avec Facebook</button>
            </div>
        </div>            
    </div>
    """, unsafe_allow_html=True)
 