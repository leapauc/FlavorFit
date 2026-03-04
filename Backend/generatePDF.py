import sys
import json
from weasyprint import HTML
from jinja2 import Template

# pip install weasyprint jinja2
# Lire les données venant de Node
input_data = sys.stdin.read()
data = json.loads(input_data)

# Charger template
with open("template.html", "r", encoding="utf-8") as f:
    template = Template(f.read())

# Générer HTML
html_content = template.render(
    constraints=data.get("constraints", {}),
    planning=data.get("planning", {}),
    shopping=data.get("shoppingList", {})
)


# Générer PDF
pdf = HTML(string=html_content).write_pdf()

# Envoyer PDF vers Node
sys.stdout.buffer.write(pdf)
sys.stdout.buffer.flush()