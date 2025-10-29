import streamlit as st

def show(check_login):
    st.title("🔐 Connexion")
    email = st.text_input("Email")
    password = st.text_input("Mot de passe", type="password")
    if st.button("Se connecter"):
        user = check_login(email, password)
        if user is not None:
            st.session_state['logged_in'] = True
            st.session_state['email'] = user['email']
            st.session_state['status'] = user['status']
            st.success(f"Connexion réussie ! Bienvenue {user['email']} ({user['status']})")
            st.rerun()
        else:
            st.error("Email ou mot de passe incorrect.")
