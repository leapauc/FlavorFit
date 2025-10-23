import streamlit as st

def render(recettes, ingredients):
    st.markdown('<div class="content-block">', unsafe_allow_html=True)
    st.title("À propos")
    st.write("Voici quelques informations à propos du site FlavorFIT.")
    st.markdown('</div>', unsafe_allow_html=True)