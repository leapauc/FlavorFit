import base64
import bcrypt
import pandas as pd
import os

def hash_password(password: str) -> str:
    """Hash un mot de passe avec bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Vérifie qu’un mot de passe correspond au hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def load_users(data_dir):
    """
    Charge users.csv (séparateur flexible) et retourne un dict:
    { email: {"password": "...", "status": "..."} }
    """
    users_path = os.path.join(data_dir, "users.csv")
    if not os.path.exists(users_path):
        return {}

    # Essayer de détecter le séparateur (tab ou comma)
    # On lit la première ligne pour décider
    with open(users_path, "r", encoding="utf-8") as f:
        first_line = f.readline()
    sep = "\t" if "\t" in first_line else ","

    df = pd.read_csv(users_path, sep=sep, dtype=str).fillna("")
    users = {}
    for _, row in df.iterrows():
        email = str(row.get("email", "")).strip()
        password = str(row.get("password", "")).strip()
        status = str(row.get("status", "")).strip()
        if email:
            users[email] = {"password": password, "status": status}
    return users

def save_user(email, password, data_dir):
    """Ajoute un utilisateur avec mot de passe hashé"""
    users = load_users(data_dir)
    users_path = os.path.join(data_dir, "users.csv")

    if email in users["email"].values:
        return False  # email déjà existant

    hashed = hash_password(password)
    new_row = pd.DataFrame({"email": [email], "password": [hashed]})
    users = pd.concat([users, new_row], ignore_index=True)
    users.to_csv(users_path, index=False)
    return True

def get_base64_image(image_path: str) -> str:
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode()
