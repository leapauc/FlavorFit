import requests
from bs4 import BeautifulSoup
import pandas as pd
from unidecode import unidecode
import csv
import os 

from scrape_nutrition_stats import calculer_nutrition


# URL du site à scraper (remplacez par la vôtre)
url_category = "https://www.marmiton.org/recettes/index/categorie/plat-principal/"
url = "https://www.marmiton.org/recettes/index/categorie/"
url_recettes = "https://www.marmiton.org"

# En-têtes pour simuler un navigateur (évite les blocages)
headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

max_pages=1
data_recettes=[]

def format_category(category):
    formated_category = category.replace(', ', '-').replace(' ', '-')
    formated_category = formated_category.replace('œ', 'oe')
    formated_category = unidecode(formated_category)
    return formated_category

def format_string2number(number):
    number = float(unidecode(number).replace(' ','').replace('gr',''))
    return number

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
    idx=1
    for type in list_category:
        compteur_page = 1
        category = type['formated_category']
        print(f"\n=== Scraping catégorie : {category} ===")

        while compteur_page <= max_pages:
            page_url = f"{url}{category}?page={compteur_page}"
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
                rating_elem = card.find(class_="rating__rating")
                rating = rating_elem.get_text(strip=True) if rating_elem else "N/A"
                nbreview_elem = card.find(class_="rating__nbreviews")
                nbreview = nbreview_elem.get_text(strip=True) if nbreview_elem else "N/A"
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

def ingredients_recettes(df):
    ingredient_list = []
    ingredients_text_per_recipe = {}  # clé=id_recette, valeur=texte multi-lignes

    for recette in df:
        response = requests.get(f'{url_recettes}{recette["lien"]}', headers=headers)
        if response.status_code != 200:
            print(f"Erreur lors de la requête : {response.status_code}")
            continue
        
        soup = BeautifulSoup(response.content, 'html.parser')
        ingredients_lines = []

        # --- Ingrédients ---
        cards = soup.find_all(class_="card-ingredient")
        for card in cards:
            ingredient_elem = card.find(class_="ingredient-name")
            ingredient = ingredient_elem.get_text(strip=True) if ingredient_elem else "N/A"
            
            count_elem = card.find(class_="count")
            count = count_elem.get_text(strip=True) if count_elem else ""
            unit_elem = card.find(class_="unit")
            unit = unit_elem.get_text(strip=True) if unit_elem else ""
            quantity = f'{count} {unit}'.strip()

            # Ligne complète pour le bloc texte
            line = f"{quantity} {ingredient}".strip() if quantity else ingredient
            ingredients_lines.append(line)

            # Stockage pour le CSV ingrédient (inchangé)
            img_tag = card.find('img')
            img_url = img_tag.get('data-src', 'N/A') if img_tag else 'N/A'
            ingredient_list.append({
                'id_recette': recette['id_recette'],
                'ingredient': ingredient,
                'quantity': quantity,
                'img_url': img_url
            })

        # --- Nb invités ---
        div = soup.find('div', class_='mrtn-recette_ingredients-counter')
        if div:
            servings_nb = div.get('data-servingsnb', 'N/A')
            servings_unit = div.get('data-servingsunit', 'N/A')
            qt_counter = f"{servings_nb} {servings_unit}".strip()
        else:
            qt_counter = "N/A"

        # Stocker le bloc texte multi-lignes pour la recette
        ingredients_text_per_recipe[recette['id_recette']] = "\n".join(ingredients_lines)
        #print("\n".join(ingredients_lines))
        nutrition = calculer_nutrition("\n".join(ingredients_lines), headless=True)
        print(f"=== Valeurs nutritionnelles {recette['id_recette']} ===")
        kcal = nutrition.get('Kcal', 'N/A')
        prot,lipide,glucide = nutrition.get('Protéines', 'N/A'),nutrition.get('Lipides', 'N/A'),nutrition.get('Glucides', 'N/A')
        # Ajouter directement les valeurs nutritionnelles dans la recette
        if servings_nb:
            if servings_nb!='N/A':
                if kcal != 'N/A':
                    kcal=round(format_string2number(kcal)/float(servings_nb))
                if prot != 'N/A':
                    prot=round(format_string2number(prot)/float(servings_nb))
                if lipide != 'N/A':
                    lipide=round(format_string2number(lipide)/float(servings_nb))
                if glucide != 'N/A':
                    glucide=round(format_string2number(glucide)/float(servings_nb))
                
        recette['Kcal']      = kcal
        recette['IG']        = nutrition.get('IG', 'N/A')
        recette['Proteines'] = prot
        recette['Lipides']   = lipide
        recette['Glucides']  = glucide

        # --- Fusionner infos dans la recette ---
        card_title = soup.find(class_="recipe-header__title")
        score_eco_elem = card_title.find(class_="score-img") if card_title else None
        eco_score = score_eco_elem.get('alt') if score_eco_elem else "N/A"

        items = soup.find_all(class_="recipe-primary__item")
        items_values = [item.find('span').get_text(strip=True) if item.find('span') else "N/A" for item in items]

        recette.update({
            'temps_prepa': items_values[0] if len(items_values) > 0 else "N/A",
            'difficulty': items_values[1] if len(items_values) > 1 else "N/A",
            'prix': items_values[2] if len(items_values) > 2 else "N/A",
            'proportion': qt_counter,
            'eco_score': eco_score,
        })

    return ingredient_list, df


def main():
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


if __name__ == "__main__":
    main()
