import concurrent.futures
import requests
from bs4 import BeautifulSoup
import pandas as pd
from unidecode import unidecode
import os 
import time

from scrape_nutrition_stats import calculer_nutrition

# ========== CONFIG ==========
# URL du site à scraper (remplacez par la vôtre)
url_category = "https://www.marmiton.org/recettes/index/categorie/plat-principal/"
url = "https://www.marmiton.org/recettes/index/categorie/"
url_recettes = "https://www.marmiton.org"

# En-têtes pour simuler un navigateur (évite les blocages)
headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

max_pages=5
MAX_WORKERS = 10 

# ========== TOOLS ==========
def format_category(category):
    formated_category = category.replace(', ', '-').replace(' ', '-')
    formated_category = formated_category.replace('œ', 'oe')
    formated_category = unidecode(formated_category)
    return formated_category

def safe_float(value):
    """Convertit une chaîne contenant des chiffres FR ou EN en float."""
    value = float(value.replace('\xa0','').replace('gr','').replace('g','').replace(' ','').replace(',',''))
    return value

# ========== SCRAPERS ==========
def scraper_type(url_category):
    response = requests.get(f'{url_category}', headers=headers)
    if response.status_code != 200:
        print(f"Erreur lors de la requête : {response.status_code}")
        return []
    # Parser le HTML
    soup = BeautifulSoup(response.content, 'html.parser')
    # Trouver tous les éléments avec la classe "card-vertical-detailed card-vertical-detailed--auto"
    cards = soup.find_all(class_="card-tag")
    data=[]
    for idx,card in enumerate(cards):
        # Extraire le titre et le href de "card-tag__link"
        category_elem = card.find(class_="card-tag__link")
        category = category_elem.get_text(strip=True) if category_elem else "N/A"
        formated_category = format_category(category)
         # Ajouter à la liste sous forme de dictionnaire
        data.append({
            'id':idx+1,
            'category':category,
            'formated_category':formated_category
        })
    return data

# Fonction pour scraper les données
def scraper_recettes(url, list_category):
    data_recettes=[]
    idx=1
    # -- Boucle pour extraire les recettes par catégorie de plat --
    for type in list_category:
        compteur_page = 1
        category = type['formated_category']
        print(f"\n=== Scraping catégorie : {category} ===")
        # -- Boucle sur le nombre de page à extraire par catégorie de plat --
        while compteur_page <= max_pages:
            page_url = f"{url}{category}?page={compteur_page}"
            print(f"Scraping : {page_url}")

            response = requests.get(page_url, headers=headers)
            if response.status_code != 200:
                print(f"⚠️ Fin des pages pour {category} (code {response.status_code})")
                break

            soup = BeautifulSoup(response.content, 'html.parser')
            cards = soup.find_all(class_="card-vertical-detailed card-vertical-detailed--auto")
            # -- Message si aucun card n'est trouvé dans la page --
            if not cards:
                print(f"❌ Aucune carte trouvée sur {page_url}")
                break
            # -- Récupération des paramètres de la card de la recette --
            for card in cards:
                title_elem = card.find(class_="card-content__title")
                title = title_elem.get_text(strip=True) if title_elem else "N/A"
                href = title_elem.get('href') if title_elem and title_elem.get('href') else "N/A"
                rating_elem = card.find(class_="rating__rating")
                rating = rating_elem.get_text(strip=True) if rating_elem else "0/5"
            # -- FILTRAGE RECETTE MAL NOTEE --
            if float(rating.split('/')[0])>=3.5:
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
                idx+=1
            compteur_page += 1
    return data_recettes

# ========== SCRAPER INGREDIENTS EN PARALLÈLE ==========
def scrape_ingredients_for_one(recette):
    """Scrape une seule recette (appelée en parallèle)."""
    try:
        response = requests.get(f'{url_recettes}{recette["lien"]}', headers=headers, timeout=10)
        if response.status_code != 200:
            return None, recette

        soup = BeautifulSoup(response.content, 'html.parser')
        ingredient_list = []
        ingredients_lines = []

        cards = soup.find_all(class_="card-ingredient")
        for card in cards:
            ingredient_elem = card.find(class_="ingredient-name")
            ingredient = ingredient_elem.get_text(strip=True) if ingredient_elem else "N/A"

            count_elem = card.find(class_="count")
            count = count_elem.get_text(strip=True) if count_elem else ""
            unit_elem = card.find(class_="unit")
            unit = unit_elem.get_text(strip=True) if unit_elem else ""
            quantity = f'{count} {unit}'.strip()

            line = f"{quantity} {ingredient}".strip() if quantity else ingredient
            ingredients_lines.append(line)

            img_tag = card.find('img')
            img_url = img_tag.get('data-src', 'N/A') if img_tag else 'N/A'
            ingredient_list.append({
                'id_recette': recette['id_recette'],
                'ingredient': ingredient,
                'quantity': quantity,
                'img_url': img_url
            })

        div = soup.find('div', class_='mrtn-recette_ingredients-counter')
        servings_nb = div.get('data-servingsnb', '1') if div else '1'

        nutrition = calculer_nutrition("\n".join(ingredients_lines), headless=True)
        kcal = nutrition.get('Kcal', '-')
        prot = nutrition.get('Protéines', '-')
        lipide = nutrition.get('Lipides', '-')
        glucide = nutrition.get('Glucides', '-')

        if kcal != '-' and servings_nb != 'N/A':
            try:
                kcal = round(safe_float(kcal) / float(servings_nb))
                prot = round(safe_float(prot) / float(servings_nb))
                lipide = round(safe_float(lipide) / float(servings_nb))
                glucide = round(safe_float(glucide) / float(servings_nb))
            except:
                pass

        recette.update({
            'Kcal': kcal,
            'Proteines': prot,
            'Lipides': lipide,
            'Glucides': glucide,
            'proportion': servings_nb
        })

        return ingredient_list, recette

    except Exception as e:
        print(f"⚠️ Erreur sur {recette.get('titre', '?')}: {e}")
        return None, recette

def ingredients_recettes_parallel(df):
    all_ingredients = []
    updated_recettes = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = [executor.submit(scrape_ingredients_for_one, recette) for recette in df]
        for future in concurrent.futures.as_completed(futures):
            ingredients, recette = future.result()
            if ingredients:
                all_ingredients.extend(ingredients)
            updated_recettes.append(recette)

    return all_ingredients, updated_recettes

# ========== SAUVEGARDE ==========
def create_file(donnees, name_file):
    df = pd.DataFrame(donnees)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, '..', '..', 'data')
    os.makedirs(data_dir, exist_ok=True)
    file_path = os.path.join(data_dir, name_file)
    df.to_csv(file_path, index=False, encoding='utf-8-sig')
    print(f'✅ Données exportées dans "{file_path}"')
    return df


# ========== MAIN ==========
def main():
    start_time = time.time()
    list_category = scraper_type(url_category)
    donnees_recette = scraper_recettes(url, list_category)
    print('*** Scraping des recettes : Succès ! ***')

    donnees_ingredient, donnees_recette = ingredients_recettes_parallel(donnees_recette)
    print('*** Scraping des ingrédients (parallèle) : Succès ! ***')

    create_file(donnees_recette, 'recettes_scrapees.csv')
    print('*** Création fichier recettes : Succés ! ***')
    create_file(donnees_ingredient,'ingredient_scrapees.csv')
    print('*** Création fichier ingrédient : Succés ! ***')
    total_time = time.time() - start_time
    minutes, seconds = divmod(total_time, 60)
    print(f"\nTemps total d'exécution : {int(minutes)} min {seconds:.2f} s")

if __name__ == "__main__":
    main()
