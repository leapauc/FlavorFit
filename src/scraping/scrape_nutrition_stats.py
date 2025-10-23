from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time

def calculer_nutrition(ingredients: str, headless: bool = True) -> dict:
    """
    Scrape les données nutritionnelles depuis monmenu.fr pour une liste d'ingrédients.

    Args:
        ingredients (str): Liste d'ingrédients, chaque ingrédient sur une ligne.
        headless (bool): Si True, le navigateur est caché.

    Returns:
        dict: Dictionnaire avec Kcal, IG, Protéines, Lipides, Glucides, Portions.
    """
    # --- CONFIG SELENIUM ---
    options = Options()
    if headless:
        options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    driver = webdriver.Chrome(options=options)

    url = "http://www.monmenu.fr/s/calculer-calories.html"
    driver.get(url)

    try:
        # --- Étape 1 : attendre la textarea ---
        wait = WebDriverWait(driver, 15)
        textarea = wait.until(EC.presence_of_element_located((By.ID, "content")))

        # --- Étape 2 : injecter le texte ---
        driver.execute_script("arguments[0].value = arguments[1];", textarea, ingredients)

        # --- Étape 3 : rendre le bouton visible et cliquer ---
        button = driver.find_element(By.CSS_SELECTOR, "form#caloriesForm input[type='image']")
        driver.execute_script("arguments[0].style.display='block'; arguments[0].style.visibility='visible';", button)
        driver.execute_script("arguments[0].click();", button)

        # --- Étape 4 : attendre l’apparition du résultat ---
        try:
            WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.ID, "split")))
        except:
            print("[WARN] Aucun résultat détecté après 20 secondes.")
            return {}

        time.sleep(2)  # Laisser le temps au JS d'injecter le contenu

        # --- Étape 5 : parser les résultats ---
        soup = BeautifulSoup(driver.page_source, "html.parser")
        results = soup.find("ul", id="split")
        if not results:
            print("[WARN] Résultat introuvable dans le DOM final.")
            return {}

        nutrition = {}
        for li in results.find_all("li"):
            titre = li.find("h3").get_text(strip=True)
            valeur = li.find("div").get_text(strip=True)
            nutrition[titre] = valeur

        return nutrition

    finally:
        driver.quit()