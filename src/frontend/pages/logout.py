import streamlit as st

def render(recettes, ingredients, BASE_DIR):
    st.session_state["connected"] = False
    st.session_state["user_email"] = None
    st.success("Vous êtes maintenant déconnecté ✅")
    st.markdown("### 🔁 Redirection en cours vers la page d’accueil...")

    # Rediriger automatiquement vers la page d'accueil
    st.query_params["page"] = "Accueil"