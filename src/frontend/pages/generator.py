import streamlit as st
import pandas as pd
from tools.helpers import get_base64_image
import os

def show(recettes, ingredients, BASE_DIR):
    ASSETS_DIR = os.path.join(BASE_DIR, "assets", "background")
    # --- Chargement de l'image d'arrière-plan ---
    image_path = os.path.join(ASSETS_DIR, "accueil.png")
    image_base64 = get_base64_image(image_path) if os.path.exists(image_path) else ""

    st.markdown(f"""
        <style>
        .hero-section {{
            background-image: url("data:image/png;base64,{image_base64}");
            background-size: cover;
            background-position: center;
            position:absolute;
            top:0px;
            width:100%;
            height: 30vh;
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
    if "repas_generes" not in st.session_state:
        st.session_state.repas_generes = None  # pour stocker les repas proposés

    left, center, right = st.columns([1, 4, 1])
    with center: 
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
                filter_button = st.button("Générer", type="primary", use_container_width=True)

            with col3:
                nb_part = st.number_input(
                    label="Nombre de part",
                    min_value=0,
                    max_value=120,
                    value=2,     
                    step=1        
                )

        # --- Action lors du clic ---
        if filter_button:
            # Si aucun des deux n’est coché → avertissement
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
            recettes_filtrees = recettes.copy()

            if st.session_state.filtre_categorie != "Toutes":
                recettes_filtrees = recettes_filtrees[recettes_filtrees["category"] == st.session_state.filtre_categorie]

            if st.session_state.filtre_exclusions.strip():
                excluded_keywords = [kw.strip().lower() for kw in st.session_state.filtre_exclusions.split(",") if kw.strip()]
                mask = ingredients["ingredient"].apply(lambda ingr: any(kw in ingr for kw in excluded_keywords))
                excluded_ids = ingredients.loc[mask, "id_recette"].unique()
                recettes_filtrees = recettes_filtrees[~recettes_filtrees["id_recette"].isin(excluded_ids)]

            # --- Génération des repas ---
            jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]

            nb_repas_par_jour = 0
            if st.session_state.check_midi:
                nb_repas_par_jour += 1
            if st.session_state.check_diner:
                nb_repas_par_jour += 1

            # On choisit aléatoirement des recettes
            if len(recettes_filtrees) < len(jours) * nb_repas_par_jour:
                st.warning("⚠️ Pas assez de recettes disponibles pour générer toute la semaine.")
                st.stop()

            repas_generes = {}
            recettes_sample = recettes_filtrees.sample(
                len(jours) * nb_repas_par_jour, replace=False
            ).reset_index(drop=True)

            idx = 0
            for jour in jours:
                repas_generes[jour] = {}
                if st.session_state.check_midi:
                    repas_generes[jour]["Midi"] = recettes_sample.iloc[idx].to_dict()
                    idx += 1
                if st.session_state.check_diner:
                    repas_generes[jour]["Soir"] = recettes_sample.iloc[idx].to_dict()
                    idx += 1

            st.session_state.repas_generes = repas_generes

        # --- Affichage des repas générés ---
                # --- Affichage des repas générés ---
        if st.session_state.repas_generes:
            st.markdown("<hr><h2 style='text-align:center;font-size:50px;'>Menu de la semaine</h2>", unsafe_allow_html=True)

            # Création de deux grandes colonnes
            col_gauche, col_sep, col_space, col_droite = st.columns([2, 0.01,0.05, 2])

            # Jours pour chaque colonne
            jours_gauche = ["Lundi", "Mardi", "Mercredi", "Jeudi"]
            jours_droite = ["Vendredi", "Samedi", "Dimanche"]

            # --- Colonne gauche ---
            with col_gauche:
                for jour in jours_gauche:
                    if jour in st.session_state.repas_generes:
                        repas = st.session_state.repas_generes[jour]
                        st.markdown(f"<h3 style='color:orange;margin-top:25px;'>{jour}</h3>", unsafe_allow_html=True)

                        # Deux sous-colonnes pour midi/soir
                        col1, col2 = st.columns(2)
                        repas_items = list(repas.items())
                        
                        with col1:
                            if len(repas_items) > 0:
                                moment, recette = repas_items[0]
                                st.markdown(f"""
                                <div style='background-color:#fff3e0;padding:10px;border-radius:10px;margin-bottom:8px;'>
                                    <b>{moment}</b><br>{recette['titre']}
                                </div>
                                """, unsafe_allow_html=True)
                        with col2:
                            if len(repas_items) > 1:
                                moment, recette = repas_items[1]
                                st.markdown(f"""
                                <div style='background-color:#fff3e0;padding:10px;border-radius:10px;margin-bottom:8px;'>
                                    <b>{moment}</b><br>{recette['titre']}
                                </div>
                                """, unsafe_allow_html=True)
            with col_sep:
                st.markdown(f"""
                    <div style='height:80vh;background: linear-gradient(145deg, rgb(255,255,255), rgb(255,165,0));border-radius:10px;margin-bottom:8px;'></div>
                        """, unsafe_allow_html=True)
            # --- Colonne droite ---
            with col_droite:
                for jour in jours_droite:
                    if jour in st.session_state.repas_generes:
                        repas = st.session_state.repas_generes[jour]
                        st.markdown(f"<h3 style='color:orange;margin-top:25px;'>{jour}</h3>", unsafe_allow_html=True)

                        col1, col2 = st.columns(2)
                        repas_items = list(repas.items())

                        with col1:
                            if len(repas_items) > 0:
                                moment, recette = repas_items[0]
                                st.markdown(f"""
                                <div style='background-color:#fff3e0;padding:10px;border-radius:10px;margin-bottom:8px;'>
                                    <b>{moment}</b><br>{recette['titre']}
                                </div>
                                """, unsafe_allow_html=True)
                        with col2:
                            if len(repas_items) > 1:
                                moment, recette = repas_items[1]
                                st.markdown(f"""
                                <div style='align-text:center;background-color:#fff3e0;padding:10px;border-radius:10px;margin-bottom:8px;'>
                                    <b>{moment}</b><br>{recette['titre']}
                                </div>
                                """, unsafe_allow_html=True)

            st.button("Enregistrer la liste de course", use_container_width=True)
