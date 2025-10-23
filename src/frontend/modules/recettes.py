import streamlit as st
import html
import streamlit.components.v1 as components
from tools.helpers import get_base64_image
import os
import math

def render(recettes, ingredients, BASE_DIR):
    ASSETS_DIR = os.path.join(BASE_DIR, "assets", "background")
    image_path = os.path.join(ASSETS_DIR, "accueil.png")
    image_base64 = get_base64_image(image_path) if os.path.exists(image_path) else ""

    st.markdown(f"""
    <style>
    .hero-section {{
        background-image: url("data:image/png;base64,{image_base64}");
        background-size: cover;
        background-position: center;
        height: 70vh;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        position: relative;
    }}
    </style>
    """, unsafe_allow_html=True)

    st.markdown('<div class="content-block">', unsafe_allow_html=True)
    st.title("🍽️ Nos Recettes")

    if "category" not in recettes.columns:
        st.warning("Aucune colonne 'category' trouvée dans les données.")
        return

    # Option "Toutes"
    categories = ["Toutes"] + list(recettes["category"].unique())
    recette_choisie = st.selectbox("Sélectionne une catégorie :", categories)

    if recette_choisie == "Toutes":
        recettes_filtrees = recettes.copy()
    else:
        recettes_filtrees = recettes[recettes["category"] == recette_choisie].copy()

    recettes_filtrees["img_url"] = recettes_filtrees["img_url"].fillna("").astype(str).str.strip()

    # --- Pagination ---
    RECETTES_PAR_PAGE = 12
    if "page" not in st.session_state:
        st.session_state.page = 1

    total_pages = math.ceil(len(recettes_filtrees) / RECETTES_PAR_PAGE)
    start_idx = (st.session_state.page - 1) * RECETTES_PAR_PAGE
    end_idx = start_idx + RECETTES_PAR_PAGE
    recettes_page = recettes_filtrees.iloc[start_idx:end_idx]

    # --- HTML des cartes ---
    cards_html = """
    <style>
    .cards-container {
        display: flex; flex-wrap: wrap; justify-content: space-around; gap: 20px; padding: 20px;
    }
    .card {
        flex: 1 1 calc(22% - 40px);
        max-width: 22%;
        background-color: white;
        border-radius: 15px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        overflow: hidden;
        text-align: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .card:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 12px rgba(0,0,0,0.2);
    }
    .card img {
        width: 100%;
        height: 180px;
        object-fit: cover;
    }
    .card-title {
        font-size: 18px;
        font-weight: bold;
        color: #FF4500;
        padding: 10px;
    }
    </style>
    <div class="cards-container">
    """

    for _, row in recettes_page.iterrows():
        image_url = row["img_url"] or "https://via.placeholder.com/300x200?text=Image+non+disponible"
        titre_card_html = html.escape(row.get("titre", "Recette sans titre"))
        cards_html += f"""
        <div class="card">
            <img src="{image_url}" alt="{titre_card_html}">
            <div class="card-title">{titre_card_html}</div>
        </div>
        """
    cards_html += "</div>"
    components.html(cards_html, height=900, scrolling=True)

    # --- Boutons de pagination ---
    col1, col2, col3 = st.columns([1, 1, 1])
    with col1:
        if st.session_state.page > 1:
            if st.button("⬅ Précédent"):
                st.session_state.page -= 1
                st.experimental_rerun()
    with col3:
        if st.session_state.page < total_pages:
            if st.button("Suivant ➡"):
                st.session_state.page += 1
                st.experimental_rerun()

    # Affiche le numéro de page
    st.markdown(f"<p style='text-align:center'>Page {st.session_state.page} / {total_pages}</p>", unsafe_allow_html=True)

    st.markdown('</div>', unsafe_allow_html=True)
