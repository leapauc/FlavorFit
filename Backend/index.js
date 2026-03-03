const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./swaggerOptions");
require("dotenv").config();

const login = require("./routes/login.routes");
const patient = require("./routes/patient.routes");
const planning = require("./routes/planning.routes");
const praticien = require("./routes/praticien.routes");
const recette = require("./routes/recipe.routes");
const ingredient = require("./routes/ingredient.routes");
const admin = require("./routes/admin.routes");
const bdd_info = require("./routes/infobdd.routes");
const rdv = require("./routes/rdv.routes");
const pdf = require("./routes/pdf.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Utilisation des routes
app.use("/login", login);
app.use("/praticien", praticien);
app.use("/planning", planning);
app.use("/patient", patient);
app.use("/recipe", recette);
app.use("/ingredient", ingredient);
app.use("/admin", admin);
app.use("/bdd_info", bdd_info);
app.use("/rdv", rdv);
app.use("/pdf", pdf);

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
