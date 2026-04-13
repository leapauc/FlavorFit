const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API - NEW QCM+",
      version: "1.0.0",
      description: "Documentation automatique de cette API.",
    },
    servers: [{ url: "http://localhost:3000", description: "Serveur local" }],
  },
  apis: ["./routes/*.js", "./controllers/*.js"],
};

const specs = swaggerJsdoc(options);
module.exports = specs;
