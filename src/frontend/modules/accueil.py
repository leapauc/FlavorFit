import streamlit as st

def render(recettes, ingredients):
    st.markdown('<div class="content-block">', unsafe_allow_html=True)
    st.title("Bienvenue sur FlavorFIT")
    st.subheader("Découvrez nos services et solutions innovantes")
    st.write("""
    Nous vous aidons à transformer vos idées en projets concrets.  
    Explorez nos fonctionnalités et voyez comment nous pouvons vous accompagner.
    """)

    # --- 3 colonnes côte à côte ---
    col1, col2, col3 = st.columns(3)

    # On parcourt les colonnes avec les titres associés
    for col, titre in zip([col1, col2, col3], ["Service 1", "Service 2", "Service 3"]):
        with col:
            st.markdown('<div class="content-block">', unsafe_allow_html=True)
            st.header(titre)
            st.write(f"Description du {titre.lower()}.")
            st.markdown('</div>', unsafe_allow_html=True)

    st.markdown('</div>', unsafe_allow_html=True)
