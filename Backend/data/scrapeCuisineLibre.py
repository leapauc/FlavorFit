import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import re
import psycopg2
from psycopg2.extras import execute_values
import os
from dotenv import load_dotenv


# ------------------------
# 🔹 CONFIG DB
# ------------------------
load_dotenv()
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

# ------------------------
# 🔹 SCRAP CONFIG
# ------------------------
BASE_URL = "https://www.cuisine-libre.org/"
TYPE_REPAS = [
    "tartines-et-sandwichs"
    "salades",
    "soupes-et-potees",
    "pates-pilafs-et-risottos",
    "enfournez",
    "poele-et-grill",
    "garnitures",
    "cremerie",
    "boulangerie-et-patisserie"
]
PLAT_URL = "?mots%5B%5D=82&max=400"
HEADERS = {"User-Agent": "Mozilla/5.0"}


# ------------------------
# 🔒 UTILITAIRES
# ------------------------
def is_valid_url(url):
    return url and urlparse(url).netloc == urlparse(BASE_URL).netloc

def extract_portions(texte):
    if not texte:
        return None
    match_range = re.search(r"(\d+)\s*(?:à|-)\s*\d+", texte)
    if match_range:
        return int(match_range.group(1))
    match_single = re.search(r"\d+", texte)
    if match_single:
        return int(match_single.group())
    return None

def reset_table():
    try:
        conn = psycopg2.connect(
            host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASSWORD, dbname=DB_NAME
        )
        cur = conn.cursor()
        cur.execute("DROP TABLE IF EXISTS recipes_libre")
        cur.execute("""
            CREATE TABLE recipes_libre (
                id SERIAL PRIMARY KEY,
                type_repas TEXT,
                titre TEXT,
                url TEXT,
                image TEXT,
                auteur TEXT,
                difficulte TEXT,
                duree TEXT,
                regime TEXT,
                likes TEXT,
                prep_time TEXT,
                cook_time TEXT,
                total_time TEXT,
                cuisson_type TEXT,
                contraintes TEXT,
                rating TEXT,
                votes TEXT,
                portions INTEGER,
                ingredients TEXT
            )
        """)
        conn.commit()
        cur.close()
        conn.close()
        print("✅ Table recipes_libre réinitialisée")
    except Exception as e:
        print(f"❌ Erreur réinitialisation table: {e}")

# ------------------------
# 🔥 SCRAP DETAIL RECETTE
# ------------------------
def scrape_recette_detail(url):
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")
        result = {}

        extend = soup.find("div", class_="extend")
        if extend:
            recipe_infos = extend.find("p", id="recipe-infos")
            if recipe_infos:
                prep = recipe_infos.find("time", class_=lambda x: x and "preparation" in x)
                cook = recipe_infos.find("time", class_=lambda x: x and "cuisson" in x)
                result["prep_time"] = prep.get_text(strip=True) if prep else None
                result["cook_time"] = cook.get_text(strip=True) if cook else None
                total = recipe_infos.find("span", itemprop="totalTime")
                result["total_time"] = total["content"] if total else None
                cuisson_type = recipe_infos.find("a")
                result["cuisson_type"] = cuisson_type.get_text(strip=True) if cuisson_type else None

            regime = extend.find("img", class_="picto_regime")
            result["regime_detail"] = regime.get("title") if regime else None

            evictions = extend.find("div", class_="evictions")
            if evictions:
                tags = [span.get_text(strip=True) for span in evictions.find_all("span", class_="on")]
                result["contraintes"] = ", ".join(tags)
            else:
                result["contraintes"] = None

            rating = extend.find("span", itemprop="ratingValue")
            result["rating"] = rating.get_text(strip=True) if rating else None

            votes = extend.find("span", itemprop="ratingCount")
            result["votes"] = votes.get_text(strip=True) if votes else None

        ingredients_block = soup.find("div", id="ingredients")
        if ingredients_block:
            yield_tag = ingredients_block.find("span", itemprop="recipeYield")
            result["portions"] = extract_portions(yield_tag.get_text(strip=True)) if yield_tag else None
            ingredients = ingredients_block.find_all("li", class_="ingredient")
            result["ingredients"] = " | ".join([i.get_text(strip=True) for i in ingredients])
        else:
            result["portions"] = None
            result["ingredients"] = None

        return result
    except Exception as e:
        print(f"❌ Erreur sur {url}: {e}")
        return {}

# ------------------------
# 🔄 SCRAP LISTES
# ------------------------
recettes = []
for type_repas in TYPE_REPAS:
    url = f"{BASE_URL}{type_repas}{PLAT_URL}"
    print(f"📄 Scraping liste: {url}")
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")
    except Exception as e:
        print(f"❌ Erreur liste {url}: {e}")
        continue

    recettes_div = soup.find("div", id="recettes")
    if not recettes_div:
        continue
    items = recettes_div.find_all("li")
    for li in items:
        item = li.find("div", class_="item")
        if not item:
            continue
        a = item.find("a")
        href = urljoin(BASE_URL, a["href"]) if a else None
        titre = a.find("strong").get_text(strip=True) if a else None
        img = a.find("img") if a else None
        image = urljoin(BASE_URL, img["src"]) if img else None
        auteurs = item.find_all("em", class_="auteur")
        auteur = None
        difficulte = None
        for em in auteurs:
            if "par" in em.get_text():
                auteur = em.get_text(strip=True).replace("par", "").strip()
            if em.find("img"):
                difficulte = em.find("img").get("title")
        duree_tag = item.find("em", class_="duree")
        duree = duree_tag.get_text(strip=True) if duree_tag else None
        regime_img = item.find("img", class_="picto_regime")
        regime = regime_img.get("title") if regime_img else None
        note_tag = item.find("div", class_="notation")
        note = note_tag.find("abbr").get_text(strip=True) if note_tag and note_tag.find("abbr") else None

        if is_valid_url(href):
            recettes.append({
                "type_repas": type_repas,
                "titre": titre,
                "href": href,
                "image": image,
                "auteur": auteur,
                "difficulte": difficulte,
                "duree": duree,
                "regime": regime,
                "note": note
            })

# ------------------------
# ⚡ SCRAP DÉTAILS EN PARALLÈLE
# ------------------------
def process_recette(recette):
    try:
        details = scrape_recette_detail(recette["href"])
        return [
            recette["type_repas"], recette["titre"], recette["href"], recette["image"],
            recette["auteur"], recette["difficulte"], recette["duree"], recette["regime"], recette["note"],
            details.get("prep_time"), details.get("cook_time"), details.get("total_time"), details.get("cuisson_type"),
            details.get("contraintes"), details.get("rating"), details.get("votes"), details.get("portions"),
            details.get("ingredients")
        ]
    except Exception as e:
        print(f"❌ Erreur recette {recette['href']}: {e}")
        return None

data = []
with ThreadPoolExecutor(max_workers=10) as executor:
    futures = [executor.submit(process_recette, r) for r in recettes]
    for future in as_completed(futures):
        res = future.result()
        if res:
            data.append(res)

# ------------------------
# 💾 INSERT DB
# ------------------------
try:
    reset_table()
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        dbname=DB_NAME
    )
    cursor = conn.cursor()
    # On insère plusieurs lignes en une seule requête
    sql = """
        INSERT INTO recipes_libre (
            type_repas, titre, url, image, auteur, difficulte, duree, regime, likes,
            prep_time, cook_time, total_time, cuisson_type, contraintes,
            rating, votes, portions, ingredients
        ) VALUES %s
    """
    execute_values(cursor, sql, data)
    conn.commit()
    cursor.close()
    conn.close()
    print(f"✅ {len(data)} recettes insérées dans recipes_libre")
except Exception as e:
    print(f"❌ Erreur insertion DB: {e}")