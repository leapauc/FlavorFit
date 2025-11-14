import requests
from bs4 import BeautifulSoup
import pandas as pd
from unidecode import unidecode
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

from scrape_nutrition_stats import calculer_nutrition

# ========== CONFIG ==========
url_category = "https://www.marmiton.org/recettes/index/categorie/plat-principal/"
url = "https://www.marmiton.org/recettes/index/categorie/"
url_recettes = "https://www.marmiton.org"

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}
max_pages = 60

# ========== TOOLS ==========

def get_soup(url):
    """Télécharge et parse une page HTML avec encodage UTF-8 correct."""
    response = requests.get(url, headers=headers)
    response.encoding = 'utf-8'  # ✅ force le bon encodage
    if response.status_code != 200:
        print(f"Erreur lors de la requête : {response.status_code} ({url})")
        return None
    return BeautifulSoup(response.text, 'html.parser')

def format_category(category):
    """Nettoie et formate le nom de la catégorie."""
    formated_category = category.replace(', ', '-').replace(' ', '-')
    formated_category = formated_category.replace('œ', 'oe')
    formated_category = unidecode(formated_category)
    return formated_category

def safe_float(value):
    """Convertit une chaîne contenant des chiffres FR ou EN en float."""
    try:
        return float(value.replace('\xa0', '').replace('gr', '').replace('g', '').replace(' ', '').replace(',', ''))
    except:
        return 0.0

def format_text(text):
    """Nettoie les caractères mal encodés et espaces parasites."""
    if not text:
        return ""
    text = text.strip().replace('\xa0', ' ')
    try:
        # Essaye de réinterpréter si encodé latin1 par erreur
        text = text.encode('latin1').decode('utf-8')
    except (UnicodeEncodeError, UnicodeDecodeError):
        pass
    return text

def normalize_dataframe(df):
    """Applique format_text à toutes les colonnes du DataFrame."""
    for col in df.columns:
        df[col] = df[col].astype(str).apply(lambda x: format_text(x))
    return df

# ========== SCRAPERS ==========

def scraper_type(url_category):
    soup = get_soup(url_category)
    if not soup:
        return []
    cards = soup.find_all(class_="card-tag")
    data = []
    for idx, card in enumerate(cards):
        category_elem = card.find(class_="card-tag__link")
        category = format_text(category_elem.get_text(strip=True)) if category_elem else "N/A"
        formated_category = format_category(category)
        data.append({
            'id': idx + 1,
            'category': category,
            'formated_category': formated_category
        })
    return data

def scraper_recettes(url, list_category):
    data_recettes = []
    seen_links = set()
    idx = 1

    for type in list_category:
        compteur_page = 1
        category = type['formated_category']
        print(f"\n=== Scraping catégorie : {category} ===")

        while compteur_page <= max_pages:
            page_url = f"{url}{category}/{compteur_page}"
            print(f"Scraping : {page_url}")

            soup = get_soup(page_url)
            if not soup:
                print(f"⚠️ Fin des pages pour {category}")
                break

            cards = soup.find_all(class_="card-vertical-detailed card-vertical-detailed--auto")
            if not cards:
                print(f"❌ Aucune carte trouvée sur {page_url}")
                break

            for card in cards:
                title_elem = card.find(class_="card-content__title")
                title = format_text(title_elem.get_text(strip=True)) if title_elem else "N/A"
                href = title_elem.get('href') if title_elem and title_elem.get('href') else "N/A"

                if href in seen_links:
                    continue
                seen_links.add(href)

                rating_elem = card.find(class_="rating__rating")
                rating = rating_elem.get_text(strip=True) if rating_elem else "0/5"

                try:
                    note = float(rating.split('/')[0])
                except ValueError:
                    note = 0.0

                if note >= 3.5:
                    nbreview_elem = card.find(class_="rating__nbreviews")
                    nbreview = nbreview_elem.get_text(strip=True) if nbreview_elem else "0 avis"

                    img_elem = card.find("img")
                    img = img_elem.get('src') if img_elem else "N/A"

                    data_recettes.append({
                        'id_recette': idx,
                        'titre': title,
                        'lien': href,
                        'note': rating,
                        'nb_avis': nbreview,
                        'img_url': img,
                        'category': type['category']
                    })
                    idx += 1
            compteur_page += 1

    return data_recettes

def process_single_recipe(recette):
    try:
        soup = get_soup(f'{url_recettes}{recette["lien"]}')
        if not soup:
            return None, None

        # --- Nombre d'invités ---
        div = soup.find('div', class_='mrtn-recette_ingredients-counter')
        servings_nb = div.get('data-servingsnb', '') if div else "-"
        servings_unit = div.get('data-servingsunit', '') if div else "-"
        qt_counter = f"{servings_nb} {servings_unit}".strip()

        # --- Ingrédients ---
        ingredient_lines = []
        ingredient_list = []
        cards = soup.find_all(class_="card-ingredient")

        for card in cards:
            ingredient_elem = card.find(class_="ingredient-name")
            ingredient = format_text(ingredient_elem.get_text(strip=True)) if ingredient_elem else "N/A"

            count_elem = card.find(class_="count")
            count = count_elem.get_text(strip=True) if count_elem else ""
            unit_elem = card.find(class_="unit")
            unit = unit_elem.get_text(strip=True) if unit_elem else ""
            quantity = f'{count} {unit}'.strip()
            try:
                count = float(count) / int(servings_nb)
            except:
                pass

            line = f"{quantity} {ingredient}".strip() if quantity else ingredient
            ingredient_lines.append(line)

            img_tag = card.find('img')
            img_url = img_tag.get('data-src', 'N/A') if img_tag else 'N/A'

            ingredient_list.append({
                'id_recette': recette['id_recette'],
                'ingredient': ingredient,
                'quantity': count,
                'unit': unit,
                'img_url': img_url
            })

        # --- Nutrition ---
        ingredients_text = "\n".join(ingredient_lines)
        nutrition = calculer_nutrition(ingredients_text, headless=True)
        kcal = nutrition.get('Kcal', '-')
        prot, lipide, glucide = nutrition.get('Protéines', '-'), nutrition.get('Lipides', '-'), nutrition.get('Glucides', '-')
        if servings_nb and servings_nb != 'N/A':
            try:
                kcal = round(safe_float(kcal) / float(servings_nb))
                prot = round(safe_float(prot) / float(servings_nb))
                lipide = round(safe_float(lipide) / float(servings_nb))
                glucide = round(safe_float(glucide) / float(servings_nb))
            except:
                pass

        recette.update({
            'Kcal': kcal,
            'IG': nutrition.get('IG', '-'),
            'Proteines': prot,
            'Lipides': lipide,
            'Glucides': glucide,
            'proportion': qt_counter
        })

        # --- Autres infos ---
        card_title = soup.find(class_="recipe-header__title")
        score_eco_elem = card_title.find(class_="score-img") if card_title else None
        eco_score = score_eco_elem.get('alt') if score_eco_elem else "-"
        items = soup.find_all(class_="recipe-primary__item")
        items_values = [format_text(item.find('span').get_text(strip=True)) if item.find('span') else "N/A" for item in items]

        recette.update({
            'temps_prepa': items_values[0] if len(items_values) > 0 else "-",
            'difficulty': items_values[1] if len(items_values) > 1 else "-",
            'prix': items_values[2] if len(items_values) > 2 else "-",
            'eco_score': eco_score
        })

        return ingredient_list, recette
    except Exception as e:
        print(f"Erreur lors du scraping de {recette['lien']}: {e}")
        return None, None

def ingredients_recettes(df, max_workers=5):
    """Scraping parallèle des détails des recettes."""
    all_ingredients, all_recipes = [], []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(process_single_recipe, recette) for recette in df]
        for future in as_completed(futures):
            ingredients, recette = future.result()
            if ingredients and recette:
                all_ingredients.extend(ingredients)
                all_recipes.append(recette)
    return all_ingredients, all_recipes

# ========== SAUVEGARDE ==========

def create_file(donnees, name_file):
    df = pd.DataFrame(donnees)
    df = normalize_dataframe(df)

    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, '..', '..', 'data')
    os.makedirs(data_dir, exist_ok=True)
    file_path = os.path.join(data_dir, name_file)

    df.to_csv(file_path, index=False, encoding='utf-8')  # ✅ export UTF-8
    print(f'Données exportées dans "{file_path}"')
    return df

# ========== MAIN ==========

def main():
    start = time.time()
    list_category = scraper_type(url_category)
    donnees_recette = scraper_recettes(url, list_category)
    print('*** Scraping des recettes : Succès ! ***')

    donnees_ingredient, donnees_recette = ingredients_recettes(donnees_recette)
    print('*** Scraping des ingrédients : Succès ! ***')

    create_file(donnees_recette, 'recettes_scrapees.csv')
    print('*** Fichier recettes créé avec succès ***')

    create_file(donnees_ingredient, 'ingredients_scrapees.csv')
    print('*** Fichier ingrédients créé avec succès ***')

    duration = time.time() - start
    print(f'⏱️ Le scraping a duré : {duration:.2f} s')

if __name__ == "__main__":
    main()
