import streamlit as st

def show():
    st.title("👤 Mon espace")
    st.write(f"Bonjour **{st.session_state['email']}** !")
    st.write(f"Votre statut : **{st.session_state['status']}**")

    if st.button("Se déconnecter"):
        st.session_state['logged_in'] = False
        st.session_state['email'] = ""
        st.session_state['status'] = ""
        st.success("Vous êtes déconnecté !")
        st.rerun()
