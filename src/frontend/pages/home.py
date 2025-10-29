import streamlit as st

def render(BASE_DIR="."):
    st.title("Page d'accueil")
    if st.session_state.get("user"):
        st.write(f"Bienvenue {st.session_state['user']['email']} !")
