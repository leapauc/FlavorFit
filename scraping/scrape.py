import requests
from bs4 import BeautifulSoup
import pandas as pd
import csv

# URL du site à scraper (remplacez par la vôtre)
url_category = "https://www.marmiton.org/recettes/index/categorie/plat-principal/"
url = "https://www.marmiton.org/recettes/index/categorie/"
url_recettes = "https://www.marmiton.org/recettes"

# En-têtes pour simuler un navigateur (évite les blocages)
headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

max_pages=2


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
         # Ajouter à la liste sous forme de dictionnaire
        data.append({
            'id':idx+1,
            'category':category
        })
    print(data)
    return data

# Fonction pour scraper les données
def scraper_recettes(url,list_category):  
    # Liste pour stocker les données
    data = []
    for type in list_category:
        compteur_page=1
        while requests.get(f'{url}{type['category']}/{compteur_page}', headers=headers).status_code == 200 and compteur_page<=max_pages :
            print(f'{url}{type['category']}/{compteur_page}')

            response = requests.get(f'{url}{type['category']}/{compteur_page}', headers=headers)
            if response.status_code != 200:
                print(f"Erreur lors de la requête : {response.status_code}")
                return []
            
            # Parser le HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Trouver tous les éléments avec la classe "card-vertical-detailed card-vertical-detailed--auto"
            cards = soup.find_all(class_="card-vertical-detailed card-vertical-detailed--auto")
            
            for idx,card in enumerate(cards):
                # Extraire le titre et le href de "card-content__title"
                title_elem = card.find(class_="card-content__title")
                title = title_elem.get_text(strip=True) if title_elem else "N/A"
                href = title_elem.get('href') if title_elem and title_elem.get('href') else "N/A"
                
                # Extraire la note de "rating__rating"
                rating_elem = card.find(class_="rating__rating")
                rating = rating_elem.get_text(strip=True) if rating_elem else "N/A"
                
                # Extraire le nombre d'avis de "rating_nbreview"
                nbreview_elem = card.find(class_="rating__nbreviews")
                nbreview = nbreview_elem.get_text('strip=True') if nbreview_elem else "N/A"

                # Extraire la note de "image"
                img_elem = card.find(class_="image")
                img = img_elem.get('src') if img_elem else "N/A"
                
                # Ajouter à la liste sous forme de dictionnaire
                data.append({
                    'id':idx+1,
                    'titre': title,
                    'lien': href,
                    'note': rating,
                    'nb_avis': nbreview,
                    'img_url': img,
                    'category':type['category']
                })
            compteur_page+=1
        
    return data

def tab_file_recettes(donnees):
    # Créer une table Python (DataFrame pandas)
    df = pd.DataFrame(donnees)

    # Afficher la table (optionnel, pour vérification)
    # print(df)

    # Exporter vers un fichier CSV
    df.to_csv('recettes_scrapees.csv', index=False, encoding='utf-8')
    print("Données exportées dans 'recettes_scrapees.csv'")
    return df

def ingredients_recettes(df):
    # print(df.columns)
    for recette in df:
        print(f'{url_recettes}{df.Lien}')
        response = requests.get(f'{url_recettes}{df.Lien}', headers=headers)
        if response.status_code != 200:
            print(f"Erreur lors de la requête : {response.status_code}")
            return []
        
        # Parser le HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Trouver tous les éléments avec la classe "card-content card-content--auto"
        cards = soup.find_all(class_="card-ingredients")
        # Liste pour stocker les données
        data = []

        for idx,card in enumerate(cards):
            # Extraire le titre et le href de "card-content__title"
            ingredient_elem = card.find(class_="ingredient-name")
            ingredient = ingredient_elem.get_text(strip=True) if ingredient_elem else "N/A"
            
            # Extraire la note de "rating__rating"
            rating_elem = card.find(class_="ingredient-name")
            rating = rating_elem.get_text(strip=True) if rating_elem else "N/A"
            
            # Extraire le nombre d'avis de "rating_nbreview"
            nbreview_elem = card.find(class_="rating__nbreviews")
            nbreview = nbreview_elem.get_text(strip=True) if nbreview_elem else "N/A"
            
            # Ajouter à la liste sous forme de dictionnaire
            data.append({
                'id':idx+1,
                'Note': rating,
                'Nombre d\'avis': nbreview
            })


def main():
    # Scraper les données
    list_category=scraper_type(url_category)
    donnees = scraper_recettes(url,list_category)

    # # Créer une table Python (DataFrame pandas)
    df = tab_file_recettes(donnees)

    # ingredients_recettes(df)



if __name__ == "__main__":
    main()
