import pandas as pd
import spacy
from pathlib import Path

# ==============================
# 1. Charger spaCy (français)
# ==============================
nlp = spacy.load("fr_core_news_md")

# ==============================
# 2. Fonctions utilitaires
# ==============================
def normalize_text(text: str) -> str:
    """
    Nettoyage léger sans perte d'information
    """
    if not isinstance(text, str):
        return ""
    return (
        text.strip()
        .lower()
        .replace("®", "")
    )


def to_singular_phrase(text: str) -> str:
    """
    Lemmatisation mot à mot
    - conserve les mots outils (de, à, en…)
    - conserve les noms composés
    """
    if not isinstance(text, str) or text.strip() == "":
        return text

    doc = nlp(text)
    return " ".join(
        token.lemma_ if token.pos_ not in {"ADP", "DET"} else token.text
        for token in doc
    )


def to_plural_phrase(text: str) -> str:
    """
    Pluralisation simple et SAFE :
    - pluralise uniquement le premier nom
    - ne touche pas aux adjectifs / compléments
    """
    if not isinstance(text, str) or text.strip() == "":
        return text

    doc = nlp(text)
    tokens = []

    plural_done = False
    for token in doc:
        if not plural_done and token.pos_ == "NOUN":
            word = token.text
            if word.endswith("al"):
                tokens.append(word[:-2] + "aux")
            elif word.endswith(("eau", "eu")):
                tokens.append(word + "x")
            else:
                tokens.append(word + "s")
            plural_done = True
        else:
            tokens.append(token.text)

    return " ".join(tokens)


# ==============================
# 3. Charger le CSV (IMPORTANT)
# ==============================
file_path = Path("files/Table Ciqual 2025_FR_2025_07_07.csv.csv")

df = pd.read_csv(
    file_path,
    sep=",",
    decimal=",",
    encoding="utf-8",
    dtype=str,          # ⚠️ empêche Pandas de casser les lignes
    keep_default_na=False
)

# ==============================
# 4. Normalisation des ingrédients
# ==============================
df["ingredient_original"] = df["ingredient"]

df["ingredient"] = (
    df["ingredient"]
    .apply(normalize_text)
)

df["singulier"] = df["ingredient"].apply(to_singular_phrase)
df["pluriel"] = df["singulier"].apply(to_plural_phrase)

# ==============================
# 5. AUCUNE déduplication destructive
# ==============================
df_normalise = df.copy()

# ==============================
# 6. Sauvegarde
# ==============================
output_path = Path("files/ingredients_normalises.csv")

df_normalise.to_csv(
    output_path,
    index=False,
    encoding="utf-8"
)

print("✔ Fichier généré :", output_path)
print("✔ Nombre de lignes :", len(df_normalise))
print(df_normalise[["ingredient_original", "singulier", "pluriel"]].head(10))
