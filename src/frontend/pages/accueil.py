import streamlit as st
from tools.helpers import get_base64_image
import os 
import streamlit.components.v1 as components
import html

def render_carousel(recettes_list):
    st.markdown("<h2 style='text-align:center; font-size:50px;margin-top:40px;'>Recettes à découvrir</h2>", unsafe_allow_html=True)

    if len(recettes_list) == 0:
        st.warning("Aucune recette disponible.")
        return

    recettes_sample = recettes_list.sample(n=min(12, len(recettes_list)))

    cards_html = """
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" />
    <style>
    .swiper {
      width: 100%;
      padding: 40px 0;
    }
    .swiper-slide {
      background-color: white;
      border-radius: 15px;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: transform 0.3s ease;
      width: calc(25% - 20px); /* par défaut 4 slides par vue */
      margin-right: 20px; /* espace entre slides */
      box-sizing: border-box;
    }
    .swiper-slide img {
      border-radius: 15px; width: auto; height: auto; object-fit: cover;
    }
    .card-title {
      font-size: 18px; font-weight: bold; padding: 10px;
    }
    .swiper-button-next, .swiper-button-prev {
      color: rgb(255,69,0);
    }
    .swiper-button-next:hover, .swiper-button-prev:hover {
      color: rgb(255,139,0);
    }
    </style>

    <div class="swiper">
      <div class="swiper-wrapper">
    """

    for _, recette in recettes_sample.iterrows():
        titre = html.escape(recette.get("titre", "Recette sans titre"))
        img = recette.get("img_url", "https://via.placeholder.com/300x200?text=Image+non+disponible")
        cards_html += f"""
        <div class="swiper-slide">
            <img src="{img}" alt="{titre}">
            <div class="card-title">{titre}</div>
        </div>
        """

    cards_html += """
      </div>
      <div class="swiper-button-next"></div>
      <div class="swiper-button-prev"></div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>
    <script>
      const swiper = new Swiper('.swiper', {
        slidesPerView: 'auto', // adapte automatiquement selon la largeur du slide
        spaceBetween: 20,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
      });
    </script>
    """

    components.html(cards_html, height=500, scrolling=False)

def render_pricing_visual():
    st.markdown("""
    <style>
    :root {
        --purple: #2b0f2b;
        --accent: #ff8a00;
        --muted: #9aa0a6;
        --card-bg: #ffffff;

    }

    body { background: white; font-family: "Helvetica Neue", Arial, sans-serif; }

    .eyebrow-center {
        font-size: 50px;  /* ou la taille que tu veux */
        color: var(--purple);
        font-weight: 700;
        text-align: center;  /* 🔥 centre le texte */
        margin-bottom: 20px;
    }

    .hero-title {
        font-size: 67px !important;
        line-height: 1.2;
        font-weight: 800;
        color: var(--purple);
        margin-bottom: 20px;
    }
    .hero-title .accent {
        background: linear-gradient(90deg, rgb(255,69,0), rgb(255,165,0)); /* du rouge-orangé au orange clair */
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
                
    .main-container {
        width: 90%;           
        margin-left: auto;
        margin-right: auto;   
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .stColumns {
        width: 100% !important; 
    }

    /* --- Cartes --- */
    .card-pro, .card-novice {
        background: var(--card-bg);
        border-radius: 16px;
        margin: 0px 20px;
        padding: 40px 32px;
        box-sizing: border-box;
        border: 3px solid transparent;
        box-shadow: 0 8px 25px rgba(0,0,0,0.08);
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 500px; /* 🔥 même hauteur pour les 2 cartes */
    }

    .card-novice { border-color: #2b0f2b; }
    .card-pro { border-color: var(--accent); }

    .card-pro:hover, .card-novice:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 28px rgba(0,0,0,0.15);
    }

    .card-novice, .card-pro {
        position: relative; /* ⚠️ nécessaire pour que le badge soit positionné par rapport à la carte */
    }

    .badge {
        position: absolute; /* badge flottant */
        top: 20px;          /* distance du haut de la carte */
        right: 0px;        /* distance du bord droit de la carte */
        padding: 8px 14px;
        border-radius: 6px 0 0 6px;
        font-weight:700;
        font-size: 25px;
        color: white;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        z-index: 10;        /* pour qu’il soit au-dessus de tout */
    }
    .badge.novice { background: linear-gradient(90deg,#2b0f2b,#40133d); }
    .badge.pro { background: var(--accent); }

    .price {
        font-size: 40px;
        font-weight: 900;
        color: var(--purple);
        padding-top:40px;
        margin-bottom: 4px;
    }

    .per-month {
        color: var(--muted);
        font-size: 20px;
        margin-bottom: 24px;
    }

    .features { list-style:none; padding:0; margin:0 0 30px 0; flex-grow: 1; }
    .features li {
        margin: 12px 0;
        font-size: 22px;
        display:flex;
        align-items:center;
        gap:20px;
        color:#222;
        line-height: 1.4;
    }

    .tick {
        display:inline-flex;
        min-width:22px;
        height:22px;
        border-radius:50%;
        align-items:center;
        justify-content:center;
        font-weight:700;
        font-size:14px;
    }
    .tick-black {
        background:#2b0f2b;
        color:white;
    }
    .tick-orange {
        background:var(--accent);
        color:white;
    }

    .cta {
        display:inline-block;
        padding:14px 24px;
        border-radius: 30px;
        text-decoration:none !important;
        font-weight:800;
        font-size:16px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: all 0.3s ease;
        text-align:center;
    }
    .cta.primary {
        background: var(--purple);
        color: white;
    }
    .cta.secondary {
        background: var(--accent);
        color: white;
    }
    .cta:hover {
        transform: scale(1.05);
    }

    /* Responsive : empile les colonnes sur mobile */
    @media (max-width: 900px) {
        .block-container {
            display: flex;
            flex-direction: column !important;
            align-items: center;
        }
        .card-pro, .card-novice {
            width: 90%;
            margin-bottom: 30px;
        }
    }
    </style>
    """, unsafe_allow_html=True)
    st.markdown("""
        <div class="main-container">
        """, unsafe_allow_html=True)
    st.markdown("""
        <br><div class="eyebrow-center">Nos Produits</div><br>
        """, unsafe_allow_html=True)
    
    # --- Disposition en 3 colonnes ---
    col1, col2, col3 = st.columns([1, 1, 1])
  
    with col1:
        st.markdown("""
        <h1 class="hero-title">
            Choisissez Le<br><span class="accent">Meilleur Plan</span><br>Pour Vous
        </h1>
        <p style="color:#555; font-size:18px;">Mensuel / Annuel</p>
        """, unsafe_allow_html=True)

    # --- Carte "Novice" ---
    with col2:
        st.markdown("""
        <div class="card-novice">
            <div>
                <div class="badge novice">Version Novice</div>
                <div class="price">5 €</div>
                <div class="per-month">Par mois</div>
                <br>
                <hr>
                <br>
                <ul class="features">
                    <li><span class="tick tick-black">✓</span> Recettes adaptées à vos exigences</li>
                    <li><span class="tick tick-black">✓</span> Génération de planning hebdomadaire</li>
                    <li><span class="tick tick-black">✓</span> Recettes Marmiton uniquement</li>
                    <li><span class="tick tick-black">✓</span> Proposition de partenaires pour les courses</li>
                </ul>
                <br>
            </div>
            <a class="cta primary" href="#">OBTENIR CE PLAN</a>
        </div>
        """, unsafe_allow_html=True)

    # --- Carte "Pro" ---
    with col3:
        st.markdown("""
        <div class="card-pro">
            <div>
                <div class="badge pro">Version Pro</div>
                <div class="price">10 €</div>
                <div class="per-month">Par mois</div>
                <br>
                <hr>
                <br>
                <ul class="features">
                    <li><span class="tick tick-orange">✓</span> Recettes adaptées à vos exigences</li>
                    <li><span class="tick tick-orange">✓</span> Génération de planning hebdomadaire</li>
                    <li><span class="tick tick-orange">✓</span> Multi-plateformes</li>
                    <li><span class="tick tick-orange">✓</span> Proposition de partenaires pour les courses</li>
                    <li><span class="tick tick-orange">✓</span> Détails des apports nutritionnels</li>
                </ul>
            </div>
            <a class="cta secondary" href="#">OBTENIR CE PLAN</a>
        </div>
        """, unsafe_allow_html=True)
    st.markdown("""
        </div><hr>
        """, unsafe_allow_html=True)

def render_objectif_section(BASE_DIR):
    ASSETS_DIR = os.path.join(BASE_DIR, "assets", "image")
    image_path = os.path.join(ASSETS_DIR, "accueil_notreObjectif.png")
    image_base64 = get_base64_image(image_path) if os.path.exists(image_path) else ""

    st.markdown("""
    <style>
    .eyebrow-center {
        font-size: 50px;  /* ou la taille que tu veux */
        color: var(--purple);
        font-weight: 700;
        text-align: center;  /* 🔥 centre le texte */
        margin-bottom: 20px;
    }
    .objectif-text-container {
        display: flex;
        flex-direction: column;
        justify-content: center;   
        height: 100%;
        margin-top: 40px; /* 🔹 décale le bloc vers le bas */
    }
    .objectif-title {
        font-size: 45px !important;
        line-height: 1.2;
        font-weight: 800;
        color: #2b0f2b;
        margin-bottom: 20px;
        text-align: center; 
    }
    .objectif-title .accent {
        font-size: 45px !important;
        background: linear-gradient(90deg, rgb(255,69,0), rgb(255,165,0));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .planif-repas {
        display:block;
        margin: 20px auto; /* centre horizontalement */
        padding: 15px 30px;
        color:white;
        background-color: rgb(255,165,0);
        border: 0;
        border-radius: 15px;
        box-shadow: 0 8px 25px rgb(255,165,0);
        font-weight: bold;
        font-size: 26px;
        cursor: pointer;
    }
    .planif-repas:hover{
        transform:scale(1.05);
    }
    .objectif-image {
        width: 100%;
        border-radius: 16px;
    }
    </style>
    """, unsafe_allow_html=True)

    st.markdown('<div class="eyebrow-center">Notre objectif</div>', unsafe_allow_html=True)

    # Colonnes avec proportion personnalisée: 40% / 60%
    col_text, col_image = st.columns([4, 6])

    with col_text:
        st.markdown(f"""
            <div class="objectif-text-container">
                <h1 class="objectif-title">
                    Aider les <span class="accent">diététiciens / médecins-nutritionnistes</span>
                    dans l'accompagnement de leurs patients <br> OU <br>
                    <span class="accent">toute personne</span> soucieuse de sa nutrition.
                </h1>
                <button class="planif-repas">Planifier et varier ses repas dès maintenant &gt;</button>
            </div>
        """, unsafe_allow_html=True)

    with col_image:
        st.markdown(f"""
            <div style="padding:0;">
                <img src="data:image/png;base64,{image_base64}" 
                    style="width:100%; display:block; border-radius:16px;" 
                    alt="Notre Objectif">
            </div>
        """, unsafe_allow_html=True)
    st.markdown("""<hr>""", unsafe_allow_html=True)


def show(recettes_list,BASE_DIR):
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
        top: 125px; /* position verticale fixe (modifiable) */
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
        font-size: 50px;
    }} 
    .fixed-text h3 {{
        font-size: 30px;
    }}  
    .content-block {{
        padding-left:10%;
        width:80%;
    }}
    </style>
    """, unsafe_allow_html=True)

    st.markdown('<div class="hero-section"><div class="fixed-text"><h1><span class="accent">Bienvenue !!!</span></h1><h4>Manger sainement et varier les repas sans prise de tête</h4><h3><span class="accent">Inscrivez-vous, ce site est fait pour vous !</span></h3></div>', unsafe_allow_html=True)

    st.markdown('<div class="content-block">', unsafe_allow_html=True)
    render_objectif_section(BASE_DIR)

    render_pricing_visual()

    render_carousel(recettes_list) 

    st.markdown('</div></div>', unsafe_allow_html=True)

    
