import streamlit as st

def show(check_login):
    # Utilisation de colonnes pour centrer avec padding
    left, center, right = st.columns([1, 2, 1])  # la colonne du milieu est plus large
    with center:
        st.title("Bonjour, bienvenue dans l'espace de connexion")
        
        st.markdown("<br>", unsafe_allow_html=True)  # espace
        
        email = st.text_input("Email")
        st.markdown("<br>", unsafe_allow_html=True)  # espace
        password = st.text_input("Mot de passe", type="password")
        st.markdown("<br>", unsafe_allow_html=True)  # espace
        
        if st.button("Se connecter"):
            status = check_login(email, password)
            if status:
                st.session_state['logged_in'] = True
                st.session_state['email'] = email
                st.session_state['status'] = status
                st.session_state['page'] = "home"
            else:
                st.error("Email ou mot de passe incorrect.")
        
        st.markdown("<br>", unsafe_allow_html=True)  # espace avant le lien
        
        # Lien stylé comme un lien classique
        link_html = """
        <p style='text-align:center;'>
            <a href='/?page=inscription'">Pas encore de compte ? Inscrivez-vous ici</a>
        </p>
        """
        # Mettre à jour le page state via le clic : on peut utiliser un petit hack
        if st.markdown(link_html, unsafe_allow_html=True):
            if st.session_state.get('page') != 'signup':
                st.session_state['page'] = 'signup'
