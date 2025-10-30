import streamlit as st
import pandas as pd
import os
 
def render(recettes=None, ingredients=None, BASE_DIR=None):
    # --- Chemins ---
    if BASE_DIR is None:
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(BASE_DIR, "..", "..", "data")
    USERS_FILE = os.path.join(DATA_DIR, "users.csv")
    ASSETS_DIR = os.path.join(BASE_DIR, "assets", "background")
    image_path = os.path.join(ASSETS_DIR, "login_signin.png")
 
    # --- Utilitaires pour charger / sauvegarder les utilisateurs ---
    def load_users_csv(file_path):
        if os.path.exists(file_path):
            try:
                return pd.read_csv(file_path)
            except Exception:
                # Si lecture échoue, retourner DataFrame vide avec colonnes attendues
                return pd.DataFrame(columns=["email", "password", "status"])
        # Fichier introuvable -> DataFrame vide
        return pd.DataFrame(columns=["email", "password", "status"])
 
    def save_user_plain(file_path, email, password, status="user"):
        users_df = load_users_csv(file_path)
        # Vérifier si l'email existe déjà
        if email in users_df["email"].values:
            return False
        # Enregistrer le mot de passe tel quel (en clair)
        new_user = pd.DataFrame([[email, password, status]], columns=["email", "password", "status"])
        users_df = pd.concat([users_df, new_user], ignore_index=True)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        users_df.to_csv(file_path, index=False)
        return True
 
    # --- CSS ---
    st.markdown(f"""
    <style>
    [data-testid="stAppViewContainer"] {{ background-color: rgb(249,137,52,0.09); }}
    .signup-container, .signup-option {{ padding-top: 120px; width: 60%; padding-left: 20%; }}
    .signup-container h3 {{ font-weight: 700; color: #222; margin-bottom: 30px; }}
    .signup-container input {{ width: 100%; padding: 12px 15px; border-radius: 10px; border: 1px solid #ddd; margin-top: 8px; font-size: 15px; background-color: #f7f7f7; outline: none; transition: border-color 0.3s; }}
    .signup-container input:focus {{ border-color: #f59e0b; }}
    label {{ display: block; text-align: left; color: #333; font-weight: 600; margin-top: 15px; }}
    .signup-button {{ background-color: #f59e0b; color: white; font-weight: 700; border: none; border-radius: 10px; padding: 12px; width: 50%; margin-left: 25%; font-size: 16px; margin-top: 25px; cursor: pointer; transition: background-color 0.3s; }}
    .signup-button:hover {{ background-color: #e48c06; }}
    .signup-container p {{ margin-top: 15px; color: #555; margin-left: 25%; }}
    .signup-container a {{ color: #f59e0b; font-weight: 600; text-decoration: none; }}
    .signup-container a:hover {{ text-decoration: underline; }}
    .separator {{ margin: 25px 0; color: #aaa; font-weight: 500; margin-left: 50%; }}
    .social-buttons {{ display: flex; justify-content: center; gap: 10px; }}
    .social-buttons button {{ flex: 1; border: 1px solid #ddd; background-color: #fff; color: #333; font-weight: 500; border-radius: 10px; padding: 10px; cursor: pointer; transition: all 0.3s; }}
    .social-buttons button:hover {{ background-color: #f9f9f9; }}
    </style>
    """, unsafe_allow_html=True)
 
    # --- Titre ---
    with st.container():
        st.markdown(f"""
        <div class="signup-container">
            <h3>Créez votre compte 🌟</h3>
        </div>
        """, unsafe_allow_html=True)
 
        # --- Champs ---
        email = st.text_input("Email", placeholder="Entrez votre adresse e-mail ici")
        password = st.text_input("Mot de passe", placeholder="Créez un mot de passe", type="password")
        confirm_password = st.text_input("Confirmez le mot de passe", placeholder="Répétez votre mot de passe", type="password")
        signup_button = st.button("S'inscrire")
 
        # --- Gestion du clic inscription ---
        if signup_button:
            if not email or not password or not confirm_password:
                st.warning("Veuillez remplir tous les champs.")
            elif password != confirm_password:
                st.error("Les mots de passe ne correspondent pas.")
            else:
                success = save_user_plain(USERS_FILE, email, password)
                if success:
                    st.success("🎉 Compte créé avec succès ! Vous pouvez maintenant vous connecter.")
                    # Optionnel : rediriger vers la page de connexion via query param
                    st.experimental_set_query_params(page="connexion")
                else:
                    st.error("Un compte avec cet e-mail existe déjà.")
 
    # --- Bas de page (lien fonctionnel via JS pour mettre le query param) ---
    st.markdown("""
        <div class="signup-option">
            <p>Vous avez déjà un compte ?
                 <a href='/?page=connexion'>Connectez vous</a></p>
            </p>
            <div class='separator'>— OU —</div><br>
            <div class="social-buttons">
                <button>🔗 S'inscrire avec Google</button>
                <button>🐙 S'inscrire avec Facebook</button>
            </div>
        </div>
    """, unsafe_allow_html=True)