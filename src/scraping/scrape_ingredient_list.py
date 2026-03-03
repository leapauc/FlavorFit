"""
================================================================================
Scraper combiné Marmiton + Ciqual (version headless)
================================================================================

📌 Objectif
-----------
Ce script combine deux tâches principales :
1. **Scraping du site Marmiton.org** pour extraire la liste complète des ingrédients.
2. **Scraping du site Ciqual (ANSES)** pour obtenir, pour chaque ingrédient,
   les principales valeurs nutritionnelles (Énergie, Protéines, Lipides, etc.).

Le tout s'exécute de manière automatisée et silencieuse (mode headless),
afin de générer un fichier CSV final regroupant l'ensemble des données.

--------------------------------------------------------------------------------
🧠 Contexte
-----------
- **Marmiton.org** est un site de recettes de cuisine comportant une base
  d'ingrédients classés par ordre alphabétique.
- **Ciqual (anses.fr)** est une base de données nutritionnelles française
  recensant la composition alimentaire des produits.

L'objectif de ce script est de croiser ces deux sources :
> "Pour chaque ingrédient trouvé sur Marmiton, obtenir ses valeurs nutritionnelles
   (kJ/100 g, protéines, lipides, glucides, etc.) depuis la base Ciqual."

--------------------------------------------------------------------------------
📦 Résultat
-----------
Le script génère un fichier CSV unique :
    → `ingredients_marmiton_ciqual.csv`

Ce fichier contient les colonnes suivantes :
    - **Ingrédient**
    - **Énergie (kJ/100g)**
    - **Protéines (g/100g)**
    - **Lipides (g/100g)**
    - **Glucides (g/100g)**
    - **Sucres (g/100g)**
    - **Fibres (g/100g)**
    - **Sel (g/100g)**
    - **AG saturés (g/100g)**
    - **Cholestérol (mg/100g)**

--------------------------------------------------------------------------------
⚙️ Prérequis techniques
------------------------
✅ Bibliothèques Python :
    pip install requests beautifulsoup4 selenium pandas

✅ Navigateur + driver Selenium :
    - Google Chrome + ChromeDriver (recommandé)
      https://chromedriver.chromium.org/downloads
    - Firefox + GeckoDriver (alternative)
      https://github.com/mozilla/geckodriver/releases

✅ Environnement :
    - Windows / macOS / Linux
    - Python 3.8+

--------------------------------------------------------------------------------
⚠️ Mentions légales et éthiques
-------------------------------
- Ce script est conçu à des fins éducatives et de recherche.
- Respecte les conditions d'utilisation de Marmiton.org et Ciqual.anses.fr.
- Évite les requêtes trop fréquentes (une pause `time.sleep` est incluse).
- Ne redistribue pas les données Ciqual sans autorisation.

--------------------------------------------------------------------------------
Auteur  : Léa PAUCHOT + OpenAI
Version : 13 Novembre 2025
================================================================================
"""

# =====================================================
# 🧩 IMPORTS ET CONSTANTES
# =====================================================

import requests
from bs4 import BeautifulSoup
import string
import time
import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, StaleElementReferenceException


# =====================================================
# 🔹 1. SCRAPING MARMITON
# =====================================================

BASE_URL = "https://www.marmiton.org/recettes/index/ingredient/"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; IngredientScraper/1.0; +https://example.com)"
}


def get_ingredient_names(letter):
    """
    Récupère tous les noms d'ingrédients pour une lettre donnée sur Marmiton.

    Args:
        letter (str): Lettre de l'alphabet à scraper (ex. 'a').

    Returns:
        list[str]: Liste des noms d'ingrédients trouvés.
    """
    ingredients = []
    page = 1

    while True:
        url = f"{BASE_URL}{letter}/{page}"
        response = requests.get(url, headers=HEADERS)
        if response.status_code != 200:
            break

        soup = BeautifulSoup(response.text, "html.parser")
        spans = soup.select("span.card-needed__name")
        if not spans:
            break

        for span in spans:
            ingredients.append(span.text.strip())

        print(f"[{letter.upper()}] Page {page} → {len(spans)} ingrédients trouvés")
        page += 1
        time.sleep(0.5)

    return ingredients


def scrape_all_ingredients():
    """
    Scrape la liste complète des ingrédients de A à Z.

    Returns:
        list[str]: Liste de tous les ingrédients trouvés.
    """
    all_ingredients = []
    for letter in string.ascii_lowercase:
        all_ingredients.extend(get_ingredient_names(letter))
    return all_ingredients


# =====================================================
# 🔹 2. SCRAPING CIQUAL (ÉTENDU)
# =====================================================

NUTRIENTS_TO_EXTRACT = {
    "Energie, N x facteur Jones, avec fibres": "Energie, N x facteur Jones, avec fibres (kJ/100 g)",
    "Protéines, N x 6.25": "Protéines, N x 6.25 (g/100 g)",
    "Lipides": "Lipides (g/100g)",
    "Glucides": "Glucides (g/100g)",
    "Sucres": "Sucres (g/100g)",
    "Fibres alimentaires": "Fibres (g/100g)",
    "Sel (NaCl)": "Sel chlorure de sodium (g/100 g)",
    "AG saturés": "AG saturés (g/100g)",
    "Cholestérol": "Cholestérol (mg/100g)"
}


def get_driver(headless=True):
    """
    Initialise le navigateur Selenium (mode headless par défaut).

    Args:
        headless (bool): Si True, exécute le navigateur sans interface graphique.

    Returns:
        selenium.webdriver.Chrome: Navigateur prêt à l’emploi.
    """
    options = Options()
    if headless:
        options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    return webdriver.Chrome(options=options)

def get_nutritional_values(driver, ingredient):
    """
    Recherche un ingrédient sur Ciqual et extrait ses valeurs nutritionnelles.

    Args:
        driver (webdriver): Instance active de Selenium.
        ingredient (str): Nom de l'ingrédient à rechercher.

    Returns:
        dict: Dictionnaire des nutriments et valeurs associées.
    """
    data = {"Ingrédient": ingredient}
    for label in NUTRIENTS_TO_EXTRACT.values():
        data[label] = None

    try:
        search_box = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "champ-recherche"))
        )
        search_box.clear()
        search_box.send_keys(ingredient)
        search_box.send_keys(Keys.RETURN)
        time.sleep(0.4)  # Pause courte pour laisser la page se charger

        for nutri_label, col_name in NUTRIENTS_TO_EXTRACT.items():
            try:
                label_elem = driver.find_element(
                    By.XPATH, f"//span[contains(text(), '{nutri_label}')]"
                )
                value_elem = label_elem.find_element(By.XPATH, "./ancestor::tr/td[2]")
                data[col_name] = value_elem.text.strip()
            except (NoSuchElementException, StaleElementReferenceException):
                # Gestion des exceptions : élément non trouvé ou obsolète
                data[col_name] = None
    except TimeoutException:
        pass

    return data


def scrape_ciqual_extended(ingredients, output_file="ingredients_marmiton_ciqual.csv", headless=True):
    """
    Scrape Ciqual pour obtenir les nutriments de chaque ingrédient.

    Args:
        ingredients (list[str]): Liste d'ingrédients à interroger.
        output_file (str): Nom du fichier CSV final.
        headless (bool): Mode d’exécution sans interface graphique.

    Returns:
        pd.DataFrame: Données nutritionnelles complètes.
    """
    driver = get_driver(headless=headless)
    driver.get("https://ciqual.anses.fr/")
    results = []

    for i, ing in enumerate(ingredients, start=1):
        print(f"({i}/{len(ingredients)}) Recherche : {ing}")
        nutri_data = get_nutritional_values(driver, ing)
        results.append(nutri_data)
        found = sum(v is not None for v in nutri_data.values()) - 1
        print(f"→ {found} nutriments trouvés")
        time.sleep(0.2)

    driver.quit()
    df = pd.DataFrame(results)
    df.to_csv(output_file, index=False, encoding="utf-8")
    print(f"\n✅ Données enregistrées dans : {output_file}")
    return df


# =====================================================
# 🔹 3. CHAÎNAGE AUTOMATIQUE
# =====================================================

if __name__ == "__main__":
    """
    Point d'entrée principal du script.

    Étapes :
        1️⃣ Scraping complet des ingrédients Marmiton.
        2️⃣ Scraping étendu des valeurs nutritionnelles sur Ciqual.
        3️⃣ Sauvegarde finale dans un fichier CSV unique.
    """
    print("🔸 Étape 1 : Scraping des ingrédients Marmiton...")
    ingredients = scrape_all_ingredients()

    print(f"\n📦 {len(ingredients)} ingrédients extraits depuis Marmiton.\n")

    print("🔸 Étape 2 : Scraping des valeurs nutritionnelles sur Ciqual...")
    scrape_ciqual_extended(ingredients, headless=True)