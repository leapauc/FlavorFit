import sys
import json
import os
from weasyprint import HTML
from jinja2 import Template

input_data = sys.stdin.read()
data = json.loads(input_data)

# Chemin absolu du logo
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

logo_path = os.path.abspath(
    os.path.join(BASE_DIR, "../Frontend/public/img/logo_flavorFit.webp")
)

with open("template_py.html", "r", encoding="utf-8") as f:
    template = Template(f.read())

html_content = template.render(
    constraints=data.get("constraints", {}),
    planning=data.get("planning", {}),
    shopping=data.get("shoppingList", {}),
    logo_path=logo_path
)

pdf = HTML(
    string=html_content,
    base_url=BASE_DIR
).write_pdf()

sys.stdout.buffer.write(pdf)
sys.stdout.buffer.flush()