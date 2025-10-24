import streamlit as st
import html
import streamlit.components.v1 as components
from tools.helpers import get_base64_image
import os

def render(recettes, ingredients, BASE_DIR):
    ASSETS_DIR = os.path.join(BASE_DIR, "assets", "background")
    image_path = os.path.join(ASSETS_DIR, "accueil.png")
    image_base64 = get_base64_image(image_path) if os.path.exists(image_path) else ""

    # --- CSS du header ---
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
    .header-block {{
        position: absolute;
        top: -400px;
        left: 50%;   /* centre horizontal */
        transform: translateX(-50%);
        background-color: rgba(255,255,255,0.9);
        padding: 15px 30px;
        border-radius: 40px;
        text-align: center;
        font-size: 1.8rem;
        font-weight: bold;
    }}
    .header-block h1 {{
        font-size: 60px;
    }} 
    .header-block h3 {{
        font-size: 30px;
    }}
    .accent {{
        background: linear-gradient(90deg, rgb(255,69,0), rgb(255,165,0)); /* du rouge-orangé au orange clair */
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }}

    /* --- Alignement bouton filtrer --- */
    div[data-testid="stHorizontalBlock"] {{
        align-items: center !important;
    }}

    /* Ajustement du bouton pour qu’il soit centré verticalement */
    .stButton > button {{
        height: 2.7rem;
        margin-top: 1.35rem;
    }}
    </style>
    """, unsafe_allow_html=True)

    st.markdown('<div class="header-block">', unsafe_allow_html=True)
    st.markdown('<div><h1><span class="accent">Recettes</span></h1><div>', unsafe_allow_html=True)

    # --- Vérifications ---
    if "category" not in recettes.columns:
        st.warning("Aucune colonne 'category' trouvée dans les données de recettes.")
        return

    if "ingredient" not in ingredients.columns or "id_recette" not in ingredients.columns:
        st.warning("Le DataFrame 'ingredients' doit contenir les colonnes 'ingredient' et 'id_recette'.")
        return

    # --- Nettoyage du DataFrame des ingrédients ---
    ingredients["ingredient"] = ingredients["ingredient"].astype(str).str.strip().str.lower()

    # --- SECTION FILTRAGE ---
    st.subheader("Filtrage")

    categories = ["Toutes"] + list(recettes["category"].unique())

    with st.container():
        col1, col2, col3 = st.columns([1, 2, 0.5])
        with col1:
            selected_category = st.selectbox("Catégorie :", categories)
        with col2:
            excluded_ingredients_input = st.text_input(
                "Exclure des ingrédients (séparés par des virgules) :",
                placeholder="ex: lait, saumon, œuf"
            )
        with col3:
            st.markdown("""
            <style>
            div.stButton > button:first-child {
                height: 3rem !important;
                margin-bottom:0.8rem !important;
            }
            </style>
            """, unsafe_allow_html=True)
            filter_button = st.button("Filtrer", use_container_width=True)

    st.markdown('</div>', unsafe_allow_html=True)  # Fermeture de .header-block

    # --- Application du filtrage ---
    recettes_filtrees = recettes.copy()

    # Filtrage par catégorie
    if selected_category != "Toutes":
        recettes_filtrees = recettes_filtrees[recettes_filtrees["category"] == selected_category]

    # Filtrage par exclusion d'ingrédients
    if filter_button and excluded_ingredients_input.strip():
        excluded_keywords = [kw.strip().lower() for kw in excluded_ingredients_input.split(",") if kw.strip()]

        mask = ingredients["ingredient"].apply(
            lambda ingr: any(keyword in ingr for keyword in excluded_keywords)
        )
        excluded_ids = ingredients.loc[mask, "id_recette"].unique()
        recettes_filtrees = recettes_filtrees[~recettes_filtrees["id_recette"].isin(excluded_ids)]

    # --- Nettoyage des images ---
    recettes_filtrees["img_url"] = recettes_filtrees["img_url"].fillna("").astype(str).str.strip()

    # --- Si aucune recette ne correspond ---
    if recettes_filtrees.empty:
        st.warning("Aucune recette ne correspond à vos critères 😔")
        return

    st.markdown('<div class="content-block">', unsafe_allow_html=True)
    st.subheader("Vos recettes après filtrage")
    # --- HTML des cartes ---
    cards_html = """
    <style>
    .cards-container {
        display: flex; flex-wrap: wrap; justify-content: space-around; gap: 20px; padding: 20px;
    }
    .card {
        flex: 1 1 calc(22% - 40px);
        max-width: 22%;
        width: 250px;
        padding: 10px;
        background-color: white;
        border-radius: 15px;
        overflow: hidden;
        text-align: center;
        transition: border 0.2s ease, transform 0.2s ease;
    }
    .card:hover {
        border: 3px solid rgb(255,69,0);
        cursor: pointer;
        transform: translateY(-5px);
    }
    .card img {
        border-radius: 15px;
        width: 350px;
        height: auto;
        object-fit: cover;
    }
    .card-title {
        font-size: 18px;
        font-weight: bold;
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