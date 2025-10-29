import streamlit as st

def show():
    left, center, right = st.columns([1, 2, 1])  # la colonne du milieu est plus large
    with center :
        st.title("HebMealGenerator")
        st.write("Générer votre programme de repas de la semaine sans prise de tête.")

