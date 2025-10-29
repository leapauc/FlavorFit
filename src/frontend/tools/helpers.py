import base64
import bcrypt
import pandas as pd
import os

def hash_password(password: str) -> str:
    """Hash un mot de passe avec bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(input_pwd: str, stored_pwd: str) -> bool:
    """Vérifie si input_pwd correspond à stored_pwd hashé ou en clair"""
    if not input_pwd or not stored_pwd:
        return False
    stored = stored_pwd.strip()
    if stored.startswith("$2"):
        try:
            return bcrypt.checkpw(input_pwd.encode("utf-8"), stored.encode("utf-8"))
        except Exception:
            return False
    return input_pwd == stored

def load_users(users_file: str) -> pd.DataFrame:
    """Charge le CSV et retourne un DataFrame avec colonnes email, password, status"""
    if not os.path.exists(users_file):
        return pd.DataFrame(columns=["email", "password", "status"])
    df = pd.read_csv(users_file, dtype=str).fillna("")
    df["email"] = df["email"].astype(str).str.strip().str.lower()
    df["password"] = df["password"].astype(str).str.strip()
    df["status"] = df["status"].astype(str).str.strip()
    return df

def save_users(df: pd.DataFrame, users_file: str):
    """Sauvegarde le DataFrame dans le CSV"""
    df.to_csv(users_file, index=False)

def get_base64_image(image_path: str) -> str:
    if not os.path.exists(image_path):
        return ""
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode()
