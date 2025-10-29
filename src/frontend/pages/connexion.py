import streamlit as st
from tools.helpers import get_base64_image, load_users, verify_password
import os
import pandas as pd

def render(recettes, ingredients, BASE_DIR):
    DATA_DIR = os.path.join(BASE_DIR, "..", "..", "data")
    USERS_FILE = os.path.join(DATA_DIR, "users.csv")
    ASSETS_DIR = os.path.join(BASE_DIR, "assets", "background")
    image_path = os.path.join(ASSETS_DIR, "login_signin.png")
    image_base64 = get_base64_image(image_path) if os.path.exists(image_path) else ""

    # Chargement des utilisateurs
    def load_users_csv(file_path):
        if os.path.exists(file_path):
            return pd.read_csv(file_path)
        return pd.DataFrame(columns=["email", "password", "status"])

    users_df = load_users_csv(USERS_FILE)

    # CSS et HTML
    st.markdown(f"""
    <style>
    [data-testid="stAppViewContainer"] {{ background-color: rgb(249,137,52,0.09);}}
    .login-container, .login-option{{ padding-top: 120px;  width:60%; padding-left:20%;}}
    .login-container h3 {{ font-weight: 700; color: #222; margin-bottom: 30px; }}
    .login-container input {{ width: 100%; padding: 12px 15px; border-radius: 10px; border: 1px solid #ddd; margin-top: 8px; font-size: 15px; background-color: #f7f7f7; outline: none; transition: border-color 0.3s; }}
    .login-container input:focus {{ border-color: #f59e0b; }}
    label {{ display: block; text-align: left; color: #333; font-weight: 600; margin-top: 15px; }}
    .login-button {{ background-color: #f59e0b; color: white; font-weight: 700; border: none; border-radius: 10px; padding: 12px; width: 50%; margin-left: 25%; font-size: 16px; margin-top: 25px; cursor: pointer; transition: background-color 0.3s; }}
    .login-button:hover {{ background-color: #e48c06; }}
    .login-container p {{ margin-top: 15px; color: #555; margin-left: 25%; }}
    .login-container a {{ color: #f59e0b; font-weight: 600; text-decoration: none; }}
    .login-container a:hover {{ text-decoration: underline; }}
    .separator {{ margin: 25px 0; color: #aaa; font-weight: 500; margin-left: 50%; }}
    .social-buttons {{ display: flex; justify-content: center; gap: 10px; }}
    .social-buttons button {{ flex: 1; border: 1px solid #ddd; background-color: #fff; color: #333; font-weight: 500; border-radius: 10px; padding: 10px; cursor: pointer; transition: all 0.3s; }}
    .social-buttons button:hover {{ background-color: #f9f9f9; }}
    </style>
    """, unsafe_allow_html=True)

    # Formulaire Streamlit
    with st.container():
        st.markdown(f"""
        <div class="login-container">
        <h3>Bonjour et bienvenue à nouveau! 👋</h3>
        </div>
        """, unsafe_allow_html=True)

        # Inputs Streamlit pour interaction réelle
        email = st.text_input("Email", placeholder="Entrez votre adresse e-mail ici")
        password = st.text_input("Mot de passe", placeholder="Entrez votre mot de passe ici", type="password")
        login_button = st.button("Se connecter")

        if login_button:
            if email and password:
                user = users_df[(users_df["email"] == email) & (users_df["password"] == password)]
                if not user.empty:
                    st.success(f"Connexion réussie ! Statut : {user.iloc[0]['status']}")
                else:
                    st.error("Email ou mot de passe incorrect.")
            else:
                st.warning("Veuillez remplir tous les champs.")
    
    st.markdown("""
        <div class="login-option">
            <p>Vous n'avez pas de compte ? <a href='#'>Créez votre compte</a></p>
            <div class='separator'>— OU —</div><br>
            <div class="social-buttons">
                <button>🔗 Se connecter avec Google</button>
                <button>🐙 Se connecter avec Facebook</button>
            </div>
    </div>
    """, unsafe_allow_html=True)
