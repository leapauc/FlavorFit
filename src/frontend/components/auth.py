import streamlit as st
import os
import pandas as pd

def is_authenticated():
    return st.session_state.get("authenticated", False)

def logout():
    st.session_state["authenticated"] = False
    st.session_state["user"] = None
    st.success("Vous avez été déconnecté ✅")
    st.session_state["page"] = "login"

def login(email, password, users_df):
    """Vérifie email/mot de passe dans users.csv (mot de passe en clair)"""
    if not email or not password:
        return False

    email_norm = email.strip().lower()
    password_clean = password.strip()

    user = users_df[users_df["email"] == email_norm]
    print(user)
    print(email_norm)
    print(password_clean)
    if user.empty:
        return False

    stored_password = str(user.iloc[0]["password"]).strip()
    if stored_password == password_clean:
        st.session_state["authenticated"] = True
        st.session_state["user"] = {
            "email": email_norm,
            "status": user.iloc[0].get("status", "")
        }
        st.session_state["page"] = "home"
        return True

    return False

def render(BASE_DIR="."):
    """Affiche la page de connexion"""
    DATA_DIR = os.path.join(BASE_DIR, "..", "..", "data")
    USERS_FILE = os.path.join(DATA_DIR, "users.csv")

    # --- Chargement utilisateurs ---
    if os.path.exists(USERS_FILE):
        users_df = pd.read_csv(USERS_FILE, dtype=str).fillna("")
        users_df["email"] = users_df["email"].str.strip().str.lower()
        users_df["password"] = users_df["password"].str.strip()
        users_df["status"] = users_df["status"].str.strip()
    else:
        users_df = pd.DataFrame(columns=["email", "password", "status"])

    # --- CSS ---
    st.markdown("""
    <style>
    [data-testid="stAppViewContainer"] { background-color: rgba(249,137,52,0.09); }
    .login-container { padding-top: 120px; width:60%; padding-left:20%; }
    .login-container h3 { font-weight:700; color:#222; margin-bottom:30px; }
    </style>
    """, unsafe_allow_html=True)

    # --- Formulaire de connexion ---
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.markdown('<hr><div class="login-container"><h3>Bonjour et bienvenue 👋</h3></div>', unsafe_allow_html=True)
        email = st.text_input("Email", placeholder="Entrez votre adresse e-mail")
        password = st.text_input("Mot de passe", placeholder="Entrez votre mot de passe", type="password")
        if st.button("Se connecter"):
            if login(email, password, users_df):
                st.success(f"✅ Connexion réussie, bienvenue {email} !")
            else:
                st.error("❌ Email ou mot de passe incorrect.")

        st.markdown("""
        <div class="login-option">
            <p>Vous n'avez pas de compte ? <a href='/?page=inscription'>Créez votre compte</a></p>
            <div class='separator'>— OU —</div><br>
            <div class="social-buttons">
                <button>🔗 Se connecter avec Google</button>
                <button>🐙 Se connecter avec Facebook</button>
            </div>
        </div>
        """, unsafe_allow_html=True)
