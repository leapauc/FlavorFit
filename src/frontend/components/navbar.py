import streamlit as st
from components.auth import is_authenticated, logout

def show_navbar():
    st.markdown(
        """
        <style>
            .navbar {
                display: flex;
                justify-content: center;
                align-items: center;
                align-text: center;
                padding: 0.5rem 1rem;
                border-radius: 0.5rem;
            }
            .navbar a {
                text-decoration: none;
                margin: 0 1rem;
                color:black;
                font-size:30px;
            }
            .navbar a:hover {
                text-decoration: underline;
            }
            .username {
                color: #bbb;
                font-size: 0.9rem;
            }
            .nom-site {
                background: linear-gradient(90deg, rgb(255,69,0), rgb(255,165,0)); /* du rouge-orangé au orange clair */
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                font-size: 60px !important;
                font-weight: bold;
            }
        </style>
        """,
        unsafe_allow_html=True,
    )

    col0, col1, col2 = st.columns([1,4, 1])
    with col1:
        if is_authenticated():
            st.markdown(
                """
                <div class='navbar'>
                    <div>
                        <a href='/?page=accueil'>Profil</a>
                        <a href='/?page=recettes'>Recettes</a>
                        <a class="nom-site" href="?page=Accueil">FlavorFIT</a>
                        <a href='/?page=profil'>HebMealGenerator</a>
                        <a href='/?page=profil'>Déconnexion</a>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )
        else:
            st.markdown(
                """
                <div class='navbar'>
                    <div>
                        <a href='/?page=accueil'>Accueil</a>
                        <a href='/?page=recettes'>Recettes</a>
                        <a class="nom-site" href="?page=Accueil">FlavorFIT</a>
                        <a href='/?page=apropos'>A propos</a>
                        <a href='/?page=connexion'>Connexion</a>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

    if st.query_params.get("action") == "logout":
        logout()
        st.query_params.clear()
        st.experimental_rerun()
