import streamlit as st
import html
import streamlit.components.v1 as components

def render(recettes, ingredients):
    st.markdown('<div class="content-block">', unsafe_allow_html=True)
    st.title("🍽️ Nos Recettes")

    if "category" not in recettes.columns:
        st.warning("Aucune colonne 'category' trouvée dans les données.")
        return

    recette_choisie = st.selectbox("Sélectionne une catégorie :", recettes["category"].unique())

    recettes_filtrees = recettes[recettes["category"] == recette_choisie].copy()
    recettes_filtrees["img_url"] = recettes_filtrees["img_url"].fillna("").astype(str).str.strip()

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

    for _, row in recettes_filtrees.iterrows():
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
    st.markdown('</div>', unsafe_allow_html=True)
