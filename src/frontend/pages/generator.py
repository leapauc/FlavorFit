import streamlit as st
import pandas as pd
from tools.helpers import get_base64_image
import os

def show(recettes, ingredients, BASE_DIR):
    ASSETS_DIR = os.path.join(BASE_DIR, "assets", "background")
    # --- Chargement de l'image d'arrière-plan ---
    image_path = os.path.join(ASSETS_DIR, "accueil.png")
    image_base64 = get_base64_image(image_path) if os.path.exists(image_path) else ""

    left, center, right = st.columns([1, 2, 1])
    with center:
        st.markdown(f"""
        <style>
        .hero-section {{
            background-image: url("data:image/png;base64,{image_base64}");
            background-size: cover;
            background-position: center;
            position:absolute;
            top:0px;
            height: 70vh;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            position: relative;
        }}
        .accent {{
            background: linear-gradient(90deg, rgb(255,69,0), rgb(255,165,0)); /* du rouge-orangé au orange clair */
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        /* Div centrée horizontalement et y fixe */
        .fixed-text {{
            position: absolute;
            top: 55px; /* position verticale fixe (modifiable) */
            left: 50%;   /* centre horizontal */
            transform: translateX(-50%);
            background-color: rgba(255,255,255,0.9);
            padding: 15px 30px;
            border-radius: 40px;
            text-align: center;
            font-size: 1.8rem;
            font-weight: bold;
        }}
        .fixed-text h1 {{
            font-size: 30px;
        }} 
        .fixed-text h3 {{
            font-size: 20px;
        }}  
        .content-block {{
            padding-left:10%;
            width:80%;
        }}
        </style>
        """, unsafe_allow_html=True)
        st.markdown('<div class="hero-section"><div class="fixed-text"><h1><span class="accent">HebMealGenerator</span></h1><h3><span>Générer votre programme de repas de la semaine sans prise de tête.</span></h3></div>', unsafe_allow_html=True)

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
    if "repas_generes" not in st.session_state:
        st.session_state.repas_generes = None  # pour stocker les repas proposés

    # --- Section filtrage ---
    st.markdown('<h2 style="text-align: center;font-size:50px;">Filtrage</h2>', unsafe_allow_html=True)
    with st.container():
        col0, col1, col2, col3, col4 = st.columns([1, 1, 2, 0.5, 1])
        with col1:
            selected_category = st.selectbox(
                "Catégorie :", 
                categories, 
                index=categories.index(st.session_state.filtre_categorie)
            )
            check_midi = st.checkbox("Repas du midi")
        with col2:
            excluded_ingredients_input = st.text_input(
                "Exclure des ingrédients (séparés par des virgules) :",
                placeholder="ex: lait, saumon, œuf",
                value=st.session_state.filtre_exclusions
            )
            check_diner = st.checkbox("Repas du soir")
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
            filter_button = st.button("Générer", use_container_width=True)

    # --- Action lors du clic ---
    if filter_button:
        # Si aucun des deux n’est coché → afficher un “modal” d’avertissement
        if not (check_midi or check_diner):
            st.warning("⚠️ Veuillez sélectionner au moins un type de repas (midi ou soir).")
            st.stop()

        # Sauvegarde des filtres
        st.session_state.filtre_categorie = selected_category
        st.session_state.filtre_exclusions = excluded_ingredients_input
        st.session_state.check_midi = check_midi
        st.session_state.check_diner = check_diner
        st.session_state.page_recettes = 1

        # --- Simulation du filtrage des repas ---
        filtred = recettes.copy()

        if selected_category != "Toutes":
            filtred = filtred[filtred["category"] == selected_category]

        if excluded_ingredients_input:
            excluded = [i.strip().lower() for i in excluded_ingredients_input.split(",")]
            filtred = filtred[~filtred["ingredients"].str.lower().apply(lambda x: any(e in x for e in excluded))]

        # Ici tu peux générer un “programme de repas” par jour
        st.session_state.repas_generes = filtred.sample(min(7, len(filtred))) if not filtred.empty else pd.DataFrame()

    # --- Affichage du programme ---
    if st.session_state.repas_generes is not None:
        st.markdown("## Vos repas proposés cette semaine :")

        if st.session_state.repas_generes.empty:
            st.info("Aucune recette ne correspond à vos critères.")
        else:
            for i, row in st.session_state.repas_generes.iterrows():
                st.markdown(f"**Jour {i+1}** — {row['title']} ({row['category']})")
                st.divider()
