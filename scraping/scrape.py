import requests
from bs4 import BeautifulSoup
import pandas as pd
import csv

# Fonction pour scraper les données
def scraper_recettes(url):
    # En-têtes pour simuler un navigateur (évite les blocages)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    # Envoyer la requête
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Erreur lors de la requête : {response.status_code}")
        return []
    
    # Parser le HTML
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Liste pour stocker les données
    data = []
    
    # Trouver tous les éléments avec la classe "card-content card-content--auto"
    cards = soup.find_all(class_="card-content card-content--auto")
    
    for card in cards:
        # Extraire le titre et le href de "card-content__title"
        title_elem = card.find(class_="card-content__title")
        title = title_elem.get_text(strip=True) if title_elem else "N/A"
        href = title_elem.get('href') if title_elem and title_elem.get('href') else "N/A"
        
        # Extraire la note de "rating__rating"
        rating_elem = card.find(class_="rating__rating")
        rating = rating_elem.get_text(strip=True) if rating_elem else "N/A"
        
        # Extraire le nombre d'avis de "rating_nbreview"
        nbreview_elem = card.find(class_="rating__nbreviews")
        nbreview = nbreview_elem.get_text(strip=True) if nbreview_elem else "N/A"
        
        # Ajouter à la liste sous forme de dictionnaire
        data.append({
            'Titre': title,
            'Lien': href,
            'Note': rating,
            'Nombre d\'avis': nbreview
        })
    
    return data

def tab_file_recettes(donnees):
    # Créer une table Python (DataFrame pandas)
    df = pd.DataFrame(donnees)

    # Afficher la table (optionnel, pour vérification)
    print(df)

    # Exporter vers un fichier CSV
    df.to_csv('recettes_scrapees.csv', index=False, encoding='utf-8')
    print("Données exportées dans 'recettes_scrapees.csv'")
    return df

def main():
    # URL du site à scraper (remplacez par la vôtre)
    url = "https://www.marmiton.org/recettes/index/categorie/plat-principal/" 

    # Scraper les données
    donnees = scraper_recettes(url)

    # Créer une table Python (DataFrame pandas)
    df = tab_file_recettes(donnees)

if __name__ == "__main__":
    main()
