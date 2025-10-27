import requests
from bs4 import BeautifulSoup
import pandas as pd
from unidecode import unidecode
import os 
from concurrent.futures import ThreadPoolExecutor, as_completed
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

max_pages=30

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
    data_recettes = []
    seen_links = set()  # <-- ensemble des liens déjà vus
    idx = 1

    for type in list_category:
        compteur_page = 1
        category = type['formated_category']
        print(f"\n=== Scraping catégorie : {category} ===")

        while compteur_page <= max_pages:
            page_url = f"{url}{category}/{compteur_page}"
            print(f"Scraping : {page_url}")

            response = requests.get(page_url, headers=headers)
            if response.status_code != 200:
                print(f"⚠️ Fin des pages pour {category} (code {response.status_code})")
                break

            soup = BeautifulSoup(response.content, 'html.parser')
            cards = soup.find_all(class_="card-vertical-detailed card-vertical-detailed--auto")

            if not cards:
                print(f"❌ Aucune carte trouvée sur {page_url}")
                break

            for card in cards:
                title_elem = card.find(class_="card-content__title")
                title = title_elem.get_text(strip=True) if title_elem else "N/A"
                href = title_elem.get('href') if title_elem and title_elem.get('href') else "N/A"

                # ✅ Vérifie si cette recette a déjà été ajoutée
                if href in seen_links:
                    # Recette déjà présente, on saute
                    continue
                seen_links.add(href)  # Marque comme vue

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

# def ingredients_recettes(df):
#     ingredient_list = []
#     ingredients_text_per_recipe = {}
#     # -- Boucle pour extraire les ingrédients, apports nutritionnels et autres informations pour chaque recette --
#     for recette in df:
#         response = requests.get(f'{url_recettes}{recette["lien"]}', headers=headers)
#         if response.status_code != 200:
#             print(f"Erreur lors de la requête : {response.status_code}")
#             continue
        
#         soup = BeautifulSoup(response.content, 'html.parser')
#         ingredients_lines = []

#         # --- Récupération de la liste des ingrédients ---
#         cards = soup.find_all(class_="card-ingredient")
#         for card in cards:
#             ingredient_elem = card.find(class_="ingredient-name")
#             ingredient = ingredient_elem.get_text(strip=True) if ingredient_elem else "N/A"
            
#             count_elem = card.find(class_="count")
#             count = count_elem.get_text(strip=True) if count_elem else ""
#             unit_elem = card.find(class_="unit")
#             unit = unit_elem.get_text(strip=True) if unit_elem else ""
#             quantity = f'{count} {unit}'.strip()

#             # Ligne complète pour le bloc texte
#             line = f"{quantity} {ingredient}".strip() if quantity else ingredient
#             ingredients_lines.append(line)

#             # Stockage pour le CSV ingrédient (inchangé)
#             img_tag = card.find('img')
#             img_url = img_tag.get('data-src', 'N/A') if img_tag else 'N/A'
#             ingredient_list.append({
#                 'id_recette': recette['id_recette'],
#                 'ingredient': ingredient,
#                 'quantity': quantity,
#                 'img_url': img_url
#             })

#         # --- Récupération du nombres invités ---
#         div = soup.find('div', class_='mrtn-recette_ingredients-counter')
#         if div:
#             servings_nb = div.get('data-servingsnb', '')
#             servings_unit = div.get('data-servingsunit', '')
#             qt_counter = f"{servings_nb} {servings_unit}".strip()
#         else:
#             qt_counter = "-"

#         # --- Récupération des apports nutritionnels ---
#         # Stocker le bloc texte multi-lignes pour la recette
#         ingredients_text_per_recipe[recette['id_recette']] = "\n".join(ingredients_lines)
#         #print("\n".join(ingredients_lines))
#         nutrition = calculer_nutrition("\n".join(ingredients_lines), headless=True)
#         kcal = nutrition.get('Kcal', '-')
#         prot,lipide,glucide = nutrition.get('Protéines', '-'),nutrition.get('Lipides', '-'),nutrition.get('Glucides', '-')
#         # Ajouter directement les valeurs nutritionnelles dans la recette
#         if servings_nb:
#             if servings_nb!='N/A':
#                 if kcal != 'N/A':
#                     kcal=round(safe_float(kcal)/float(servings_nb))
#                 if prot != 'N/A':
#                     prot=round(safe_float(prot)/float(servings_nb))
#                 if lipide != 'N/A':
#                     lipide=round(safe_float(lipide)/float(servings_nb))
#                 if glucide != 'N/A':
#                     glucide=round(safe_float(glucide)/float(servings_nb))
                
#         recette['Kcal']      = kcal
#         recette['IG']        = nutrition.get('IG', '-')
#         recette['Proteines'] = prot
#         recette['Lipides']   = lipide
#         recette['Glucides']  = glucide

#         # --- Récupération infos variés de la recette ---
#         card_title = soup.find(class_="recipe-header__title")
#         score_eco_elem = card_title.find(class_="score-img") if card_title else None
#         eco_score = score_eco_elem.get('alt') if score_eco_elem else "-"

#         items = soup.find_all(class_="recipe-primary__item")
#         items_values = [item.find('span').get_text(strip=True) if item.find('span') else "N/A" for item in items]

#         # --- Fusionner infos dans la recette ---
#         recette.update({
#             'temps_prepa': items_values[0] if len(items_values) > 0 else "-",
#             'difficulty': items_values[1] if len(items_values) > 1 else "-",
#             'prix': items_values[2] if len(items_values) > 2 else "-",
#             'proportion': qt_counter,
#             'eco_score': eco_score,
#         })

#     return ingredient_list, df
def process_single_recipe(recette):
    try:
        response = requests.get(f'{url_recettes}{recette["lien"]}', headers=headers)
        if response.status_code != 200:
            print(f"Erreur lors de la requête : {response.status_code} pour {recette['lien']}")
            return None, None

        soup = BeautifulSoup(response.content, 'html.parser')

        # --- Extraction ingrédients ---
        ingredient_lines = []
        ingredient_list = []
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
            ingredient_lines.append(line)

            img_tag = card.find('img')
            img_url = img_tag.get('data-src', 'N/A') if img_tag else 'N/A'
            ingredient_list.append({
                'id_recette': recette['id_recette'],
                'ingredient': ingredient,
                'quantity': quantity,
                'img_url': img_url
            })

        # --- Nombre d'invités ---
        div = soup.find('div', class_='mrtn-recette_ingredients-counter')
        servings_nb = div.get('data-servingsnb', '') if div else "-"
        servings_unit = div.get('data-servingsunit', '') if div else "-"
        qt_counter = f"{servings_nb} {servings_unit}".strip()

        # --- Nutrition ---
        ingredients_text = "\n".join(ingredient_lines)
        nutrition = calculer_nutrition(ingredients_text, headless=True)
        kcal = nutrition.get('Kcal', '-')
        prot, lipide, glucide = nutrition.get('Protéines', '-'), nutrition.get('Lipides', '-'), nutrition.get('Glucides', '-')
        if servings_nb and servings_nb != 'N/A':
            if kcal != 'N/A': kcal = round(safe_float(kcal)/float(servings_nb))
            if prot != 'N/A': prot = round(safe_float(prot)/float(servings_nb))
            if lipide != 'N/A': lipide = round(safe_float(lipide)/float(servings_nb))
            if glucide != 'N/A': glucide = round(safe_float(glucide)/float(servings_nb))

        recette.update({
            'Kcal': kcal,
            'IG': nutrition.get('IG', '-'),
            'Proteines': prot,
            'Lipides': lipide,
            'Glucides': glucide,
            'proportion': qt_counter
        })

        # --- Infos variés ---
        card_title = soup.find(class_="recipe-header__title")
        score_eco_elem = card_title.find(class_="score-img") if card_title else None
        eco_score = score_eco_elem.get('alt') if score_eco_elem else "-"
        items = soup.find_all(class_="recipe-primary__item")
        items_values = [item.find('span').get_text(strip=True) if item.find('span') else "N/A" for item in items]

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
    """
    Récupère ingrédients et détails des recettes en parallèle.
    - df : liste des recettes (dictionnaires)
    - max_workers : nombre de threads
    """
    all_ingredients = []
    all_recipes = []

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
    # Créer DataFrame
    df = pd.DataFrame(donnees)

    # Chemin vers le dossier data, basé sur l'emplacement du script
    script_dir = os.path.dirname(os.path.abspath(__file__))  # src/
    data_dir = os.path.join(script_dir, '..', '..', 'data')        # ../data
    os.makedirs(data_dir, exist_ok=True)                     # crée si manquant

    # Chemin complet du fichier CSV
    file_path = os.path.join(data_dir, name_file)

    # Export CSV
    df.to_csv(file_path, index=False, encoding='utf-8-sig')
    print(f'Données exportées dans "{file_path}"')

    return df

# ========== MAIN ==========
def main():
    start=time.time()
    # Scraper les données
    list_category=scraper_type(url_category)
    donnees_recette = scraper_recettes(url,list_category)
    print('*** Scraping des recettes : Succés ! ***')

    [donnees_ingredient,donnees_recette] = ingredients_recettes(donnees_recette)
    print('*** Scraping des ingrédients : Succés ! ***')
    create_file(donnees_recette,'recettes_scrapees.csv')
    print('*** Création fichier recettes : Succés ! ***')
    create_file(donnees_ingredient,'ingredient_scrapees.csv')
    print('*** Création fichier ingrédient : Succés ! ***')
    duration=time.time()-start
    print(f'Le scraping a duré : {duration} s')

if __name__ == "__main__":
    main()
