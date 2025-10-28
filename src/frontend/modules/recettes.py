import streamlit as st
import html
import streamlit.components.v1 as components
from tools.helpers import get_base64_image
import os
import math

def parse_score(score_str):
    """
    Transforme un score au format 'x/y' en float.
    Ex: '3.5/5' -> 3.5
    """
    import math

    if not score_str:
        return 0.0

    try:
        # Séparer '3.5/5' en ['3.5', '5']
        value, total = score_str.split("/")
        value = float(value)
        total = float(total)

        if math.isnan(value) or math.isnan(total) or total == 0:
            return 0.0

        # Retourner le score sur 5
        return (value / total) * 5
    except Exception:
        return 0.0

def render_stars(score_str, max_score=5):
    """
    Affiche les étoiles à partir d'un score au format 'x/y'.
    Gère les demi-étoiles.
    """
    score = parse_score(score_str)  # converti en float sur 5

    # Arrondi au 0,5
    rounded_score = round(score * 2) / 2
    full_stars = int(rounded_score)
    half_star = 1 if rounded_score - full_stars == 0.5 else 0
    empty_stars = max_score - full_stars - half_star

    full = "&#9733;"  # ★
    half = "&#9734;"  # ☆ utilisé comme demi-étoile simplifiée
    empty = "&#9734;" # ☆

    stars_html = full * full_stars + half * half_star + empty * empty_stars
    return f'<span style="color: gold; font-size: 25px;">{stars_html}</span>'


def render(recettes, ingredients, BASE_DIR):
    ASSETS_DIR = os.path.join(BASE_DIR, "assets", "background")
    image_path = os.path.join(ASSETS_DIR, "accueil.png")
    eco_score_img_path = os.path.join(BASE_DIR, "assets", "image")
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
        top: 300px;
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

    st.markdown('<div class="hero-section"><div class="header-block"><h1><span class="accent">Recettes</span></h1></div></div>', unsafe_allow_html=True)

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
    .card { flex: 1 1 calc(22% - 40px); padding: 10px; background-color: white; border-radius: 15px; text-align: center; transition: border 0.2s ease, transform 0.2s ease; cursor: pointer; }
    .card:hover { border: 3px solid rgb(255,69,0); transform: translateY(-5px); }
    .card img { border-radius: 15px; width: auto; height: auto; object-fit: cover; }
    .card-title { font-size: 18px; font-weight: bold; padding: 40px;}
    .modal { display: none; position: fixed; z-index: 100; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.6); }
    .modal-content { background-color: #fefefe; margin: 50px auto; border-radius: 15px; width: 60%; max-width: 700px; padding-bottom: 20px; overflow: hidden; position: relative; }
    .modal-header { position: relative; height: 300px; padding:20px; background-size: cover; background-position: center; }
    .modal-header h2 { position:absolute;top:5px;background-color:rgba(255,255,255,0.9);border-radius:15px;padding:15px;color:rgb(255,69,0); }
    .notation {position: absolute;bottom: 15px;left: 15px;background-color: rgba(255,255,255,1);padding: 8px 12px;border-radius: 10px;font-weight: bold; font-size:20px;}
    .info-prepa {position: absolute;bottom: 15px;right: 15px;background-color: rgba(255,255,255,0.85);padding: 8px 12px;border-radius: 10px;font-weight: bold;color: rgb(100,100,100);}
    .modal-body {position: relative;padding: 1rem;}
    .titre-section {display: inline-block;background: #f7b733; color: white;padding: 0.3rem 0.8rem;border-radius: 8px;position: relative;z-index: 2;margin-bottom: -0.8rem;box-shadow: 0 2px 6px rgba(0,0,0,0.1);font-size: 1.1rem;}
    .modal-body ul, .apport-nutritionel {background-color: rgb(249,137,52,0.09); border-radius:15px 40px 15px 40px;padding:30px;list-style: none;}
    .modal-body li {padding:2px;}
    .icon {font-size:35px;}
    .close { position: absolute; top: 10px; right: 20px; color: white; font-size: 28px; font-weight: bold; cursor: pointer; }
    .recette-lien {position: absolute; bottom: 40px; right: 30px; text-decoration: none !important;font-weight: bold; cursor: pointer;color:black !important}
    .kcal { background-color:lightsalmon;border-radius:20px;padding:10px 30px;}
    .ig { background-color:yellow;border-radius:20px;padding:10px 30px;}
    .prot { background-color:rgb(220,220,220);border-radius:20px;padding:10px 30px;}
    .lipide { background-color:lightgreen;border-radius:20px;padding:10px 30px;}
    .glucide { background-color:lightblue;border-radius:20px;padding:10px 30px;}
    th, td {padding: 15px;text-align:center;}
    </style>
    <div class="cards-container">
    """

    for idx, row in recettes_page.iterrows():
        score_html = render_stars(row.get("note", 0))
        nb_avis = row.get("nb_avis", '0 avis')
        # Vérifier si NaN ou invalide
        try:
            nb_avis = int(nb_avis)
            if nb_avis==0:
                nb_avis = '0 avis'
        except (TypeError, ValueError):
            nb_avis = '0 avis'
        eco_score = str(row.get("eco_score", "")).strip()
        img_eco_score = os.path.join(eco_score_img_path, f"{eco_score.replace(' ', '_')}.png")
        image_base64_eco_score = get_base64_image(img_eco_score) if os.path.exists(img_eco_score) else ""


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
                    <h2 style="position:absolute;top:5px;background-color:rgba(255,255,255,0.9);border-radius:15px;">{titre_card_html}</h2>
                    <p class="notation">{score_html}  |  {row.get("nb_avis")}</p>
                    <p class="info-prepa">
                        <span class="icon">&#9202;</span> {row.get("temps_prepa")}  -  
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 18.5 18.5" fill="none" stroke="rgb(100,100,100)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Silhouette de personne">
                            <!-- Tête -->
                            <circle cx="12" cy="6" r="4"/>
                            <!-- Corps -->
                            <path d="M6 20v-2c0-4 2-6 6-6s6 2 6 6v2H6z"/>
                        </svg> {row.get("proportion").split(' ')[0]}  -  
                        <svg fill="#646464" height="30px" width="30px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 481.04 481.04" xml:space="preserve" stroke="rgb(100,100,100)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M368.56,46.68c-6.992,0-14.016,0.704-21.352,2.136C319.808,17.96,280.72,0.36,239.2,0.36 c-41.088,0-80.048,17.432-107.592,47.992c-6.432-1.112-12.816-1.672-19.048-1.672C50.488,46.68,0,97.136,0,159.16 c0,62.064,50.496,112.56,112.56,112.56c2.176,0,4.32-0.216,6.48-0.336V456.68c0,13.232,10.768,24,24,24h192 c13.232,0,24-10.768,24-24V271.208c3.16,0.264,6.32,0.512,9.52,0.512c62.024,0,112.48-50.496,112.48-112.56 C481.04,97.136,430.584,46.68,368.56,46.68z M343.048,456.68h-0.008c0,4.408-3.584,8-8,8h-192c-4.416,0-8-3.592-8-8v-24h184 c4.424,0,8-3.584,8-8c0-4.416-3.576-8-8-8h-16v-48c0-4.416-3.576-8-8-8s-8,3.584-8,8v48h-40v-48c0-4.416-3.576-8-8-8s-8,3.584-8,8 v48h-40v-48c0-4.416-3.576-8-8-8s-8,3.584-8,8v48h-40V269.392c7.752-1.608,15.344-4.04,22.712-7.328 C181.944,278.608,210,287.32,239.2,287.32c29.728,0,58.144-8.944,82.488-25.912c6.928,3.2,14.072,5.584,21.36,7.296V456.68z M368.56,255.72c-3.208,0-6.368-0.248-9.52-0.56v-14.48c0-4.416-3.576-8-8-8s-8,3.584-8,8v11.448 c-6.32-1.752-12.52-4.04-18.496-7.12c-2.704-1.392-5.992-1.12-8.448,0.704c-22.424,16.752-49.016,25.608-76.896,25.608 c-27.36,0-53.608-8.624-75.904-24.936c-1.4-1.016-3.056-1.544-4.728-1.544c-1.208,0-2.432,0.28-3.56,0.832 c-6.464,3.216-13.136,5.616-19.96,7.296V240.68c0-4.416-3.576-8-8-8c-4.424,0-8,3.584-8,8v14.664 c-2.152,0.144-4.296,0.376-6.48,0.376c-53.24,0-96.56-43.32-96.56-96.56c0-53.2,43.32-96.48,96.56-96.48 c6.592,0,13.416,0.744,20.296,2.208c7.872,4.392,36.304,22.496,34.048,53.864c-0.32,4.408,3,8.24,7.408,8.552 c0.192,0.008,0.384,0.016,0.576,0.016c4.16,0,7.672-3.216,7.968-7.424c2.44-33.84-21.584-55.28-35.448-64.752 C171.64,30.472,204.512,16.36,239.2,16.36c34.832,0,67.64,14.04,91.712,38.648c-13.808,9.12-38.544,30.448-36.088,65.192 c0.296,4.216,3.808,7.44,7.968,7.44c0.184,0,0.384-0.008,0.568-0.016c4.408-0.312,7.728-4.136,7.416-8.544 c-2.184-31.024,24.952-48.736,33.408-53.48c0.624,0.008,1.256-0.024,1.888-0.168c7.88-1.848,15.232-2.752,22.496-2.752 c53.192,0,96.48,43.28,96.48,96.48C465.04,212.4,421.76,255.72,368.56,255.72z"></path> </g> </g> </g></svg>
                         {row.get("difficulty")}  -  
                        <svg width="30px" height="30px" viewBox="0.5 0 22.5 22.5" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="rgb(100,100,100)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 17V17.5V18" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"></path> <path d="M12 6V6.5V7" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"></path> <path d="M15 9.5C15 8.11929 13.6569 7 12 7C10.3431 7 9 8.11929 9 9.5C9 10.8807 10.3431 12 12 12C13.6569 12 15 13.1193 15 14.5C15 15.8807 13.6569 17 12 17C10.3431 17 9 15.8807 9 14.5" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"></path> <path d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"></path> </g></svg>                         
                         {row.get("prix")}
                    </p>
                </div>
                <div class="modal-body">
                    <h3 class="titre-section">Apports nutritionnels et impact environnemental</h3>
                    <div class="apport-nutritionel">
                        <p>par portion</p>
                        <table style="width:100%;">
                            <tr>
                                <td ><span class="kcal">{row.get("Kcal")} kcal</span></td>
                                <td><span class="ig">IG : {row.get("IG")}</span></td> 
                                <td rowspan="3" style="text-align:center; vertical-align:middle;">
                                    <img src="data:image/png;base64,{image_base64_eco_score}" alt="Éco-score" width="60">
                                </td>
                            </tr>
                            <tr>
                                <td><span class="prot">protéines : {row.get("Proteines")} g </span></td>
                                <td><span class="lipide">lipides : {row.get("Lipides")} g</span></td>
                            </tr>
                            <tr>
                                <td><span class="glucide">glucides : {row.get("Glucides")} g</span></td>
                            </tr>
                        </table> 
                    </div>

                    <h3 class="titre-section">Ingrédients</h3>
                    <ul>{ingredients_list}</ul>

                    <a href="https://www.marmiton.org{row.get('lien')}" target="_blank" class="recette-lien">
                        Voir la recette complète sur Marmiton
                    </a>
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

