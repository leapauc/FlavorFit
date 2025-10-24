import streamlit as st
import html
import streamlit.components.v1 as components
from tools.helpers import get_base64_image
import os

def render(recettes, ingredients, BASE_DIR):
    ASSETS_DIR = os.path.join(BASE_DIR, "assets", "background")
    image_path = os.path.join(ASSETS_DIR, "accueil.png")
    image_base64 = get_base64_image(image_path) if os.path.exists(image_path) else ""

    # --- CSS général ---
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
        left: 50%;
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
    .accent {{
        background: linear-gradient(90deg, rgb(255,69,0), rgb(255,165,0));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }}
    div[data-testid="stHorizontalBlock"] {{
        align-items: center !important;
    }}
    .stButton > button {{
        height: 2.7rem;
        margin-top: 1.35rem;
    }}
    </style>
    """, unsafe_allow_html=True)

    st.markdown('<div class="header-block"><h1><span class="accent">Recettes</span></h1></div>', unsafe_allow_html=True)

    # --- Vérifications des colonnes ---
    if "category" not in recettes.columns:
        st.warning("Aucune colonne 'category' trouvée dans les données de recettes.")
        return
    if "ingredient" not in ingredients.columns or "id_recette" not in ingredients.columns:
        st.warning("Le DataFrame 'ingredients' doit contenir les colonnes 'ingredient' et 'id_recette'.")
        return

    # --- Nettoyage des ingrédients ---
    ingredients["ingredient"] = ingredients["ingredient"].astype(str).str.strip().str.lower()
    categories = ["Toutes"] + list(recettes["category"].unique())

    # --- Initialisation de l'état de session ---
    if "filtre_categorie" not in st.session_state:
        st.session_state.filtre_categorie = "Toutes"
    if "filtre_exclusions" not in st.session_state:
        st.session_state.filtre_exclusions = ""
    if "page_recettes" not in st.session_state:
        st.session_state.page_recettes = 1

    # --- Section filtrage ---
    st.markdown('<h2 style="text-align: center;font-size:50px;">Filtrage</h2>', unsafe_allow_html=True)
    with st.container():
        col0, col1, col2, col3, col4 = st.columns([1,1,2,0.5,1])
        with col1:
            selected_category = st.selectbox(
                "Catégorie :", 
                categories, 
                index=categories.index(st.session_state.filtre_categorie)
            )
        with col2:
            excluded_ingredients_input = st.text_input(
                "Exclure des ingrédients (séparés par des virgules) :",
                placeholder="ex: lait, saumon, œuf",
                value=st.session_state.filtre_exclusions
            )
        with col3:
            st.markdown("""
            <style>
            .stButton > button {
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 0 auto;
                height: 60px;
                width: 120px;
                color: white !important;
                background-color: rgb(255,165,0) !important;
                border: 0 !important;
                border-radius: 15px !important;
                font-size: 28px !important;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.2s ease-in-out;
            }
            .stButton > button:hover { transform: scale(1.1); }
            </style>
            """, unsafe_allow_html=True)
            filter_button = st.button("Filtrer", use_container_width=True)

    st.markdown('</div><hr>', unsafe_allow_html=True)

    # --- Application du filtrage UNIQUEMENT si le bouton est cliqué ---
    if filter_button:
        st.session_state.filtre_categorie = selected_category
        st.session_state.filtre_exclusions = excluded_ingredients_input
        st.session_state.page_recettes = 1  # réinitialiser pagination

    # --- Appliquer les filtres enregistrés dans la session ---
    recettes_filtrees = recettes.copy()

    if st.session_state.filtre_categorie != "Toutes":
        recettes_filtrees = recettes_filtrees[recettes_filtrees["category"] == st.session_state.filtre_categorie]

    if st.session_state.filtre_exclusions.strip():
        excluded_keywords = [kw.strip().lower() for kw in st.session_state.filtre_exclusions.split(",") if kw.strip()]
        mask = ingredients["ingredient"].apply(lambda ingr: any(kw in ingr for kw in excluded_keywords))
        excluded_ids = ingredients.loc[mask, "id_recette"].unique()
        recettes_filtrees = recettes_filtrees[~recettes_filtrees["id_recette"].isin(excluded_ids)]

    # --- Aucune recette trouvée ---
    if recettes_filtrees.empty:
        st.warning("Aucune recette ne correspond à vos critères 😔")
        return

    # --- Section cartes ---
    st.markdown('<h2 style="text-align: center;font-size:50px;">Vos recettes après filtrage</h2>', unsafe_allow_html=True)

    # --- Pagination ---
    RECETTES_PAR_PAGE = 12
    total_recettes = len(recettes_filtrees)
    total_pages = (total_recettes - 1) // RECETTES_PAR_PAGE + 1

    col1, col2, col3 = st.columns([1,1,1])
    with col1:
        st.markdown('<div style="text-align: right; display: flex; justify-content: flex-end;">', unsafe_allow_html=True)
        if st.session_state.page_recettes > 1:
            if st.button("Précédent", key="prev_page"):
                st.session_state.page_recettes -= 1
                st.rerun()
        st.markdown(f"</div>",unsafe_allow_html=True)

    with col3:
        if st.session_state.page_recettes < total_pages:
            if st.button("Suivant", key="next_page"):
                st.session_state.page_recettes += 1
                st.rerun()
    with col2:
        st.markdown(
            f"<p style='text-align:center;font-size:20px;'>Page {st.session_state.page_recettes} / {total_pages}</p>",
            unsafe_allow_html=True
        )

    start_idx = (st.session_state.page_recettes - 1) * RECETTES_PAR_PAGE
    end_idx = start_idx + RECETTES_PAR_PAGE
    recettes_page = recettes_filtrees.iloc[start_idx:end_idx]

    cards_html = """
    <style>
    .cards-container { display: flex; flex-wrap: wrap; justify-content: space-around; gap: 20px; padding: 20px; }
    .card { flex: 1 1 calc(22% - 40px); max-width: 22%; width: 250px; padding: 10px; background-color: white; border-radius: 15px; text-align: center; transition: border 0.2s ease, transform 0.2s ease; cursor: pointer; }
    .card:hover { border: 3px solid rgb(255,69,0); transform: translateY(-5px); }
    .card img { border-radius: 15px; width: auto; height: 350px; object-fit: cover; }
    .card-title { font-size: 18px; font-weight: bold; padding: 10px; }
    .modal { display: none; position: fixed; z-index: 100; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.6); }
    .modal-content { background-color: #fefefe; margin: 50px auto; border-radius: 15px; width: 60%; max-width: 700px; padding-bottom: 20px; overflow: hidden; position: relative; }
    .modal-header { position: relative; height: 300px; background-size: cover; background-position: center; }
    .modal-header h2 { position: absolute; bottom: 20px; left: 20px; color: white; text-shadow: 1px 1px 4px rgba(0,0,0,0.7); }
    .modal-body { padding: 20px; }
    .close { position: absolute; top: 10px; right: 20px; color: white; font-size: 28px; font-weight: bold; cursor: pointer; }
    </style>
    <div class="cards-container">
    """

    for idx, row in recettes_page.iterrows():
        image_url = row.get("img_url", "") or "https://via.placeholder.com/300x200?text=Image+non+disponible"
        titre_card_html = html.escape(row.get("titre", "Recette sans titre"))
        ingredients_list = "".join(f"<li>{html.escape(ing)}</li>" for ing in ingredients[ingredients["id_recette"]==row["id_recette"]]["ingredient"].tolist())
        cards_html += f"""
        <div class="card" onclick="openModal('modal{idx}')">
            <img src="{image_url}" alt="{titre_card_html}">
            <div class="card-title">{titre_card_html}</div>
        </div>
        <div id="modal{idx}" class="modal">
            <div class="modal-content">
                <div class="modal-header" style="background-image:url('{image_url}')">
                    <span class="close" onclick="closeModal('modal{idx}')">&times;</span>
                    <h2>{titre_card_html}</h2>
                </div>
                <div class="modal-body">
                    <h3>Ingrédients</h3>
                    <ul>{ingredients_list}</ul>
                </div>
            </div>
        </div>
        """

    cards_html += """
    </div>
    <script>
    function openModal(id) { document.getElementById(id).style.display = "block"; }
    function closeModal(id) { document.getElementById(id).style.display = "none"; }
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) { event.target.style.display = "none"; }
    }
    </script>
    """

    components.html(cards_html, height=1400, scrolling=False)

