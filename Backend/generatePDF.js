const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const nunjucks = require("nunjucks");

/**
 * SAFE GROUP CLASS
 */
function getGroupClass(name = "") {
  const n = (name || "").toLowerCase();

  if (n.includes("viande") || n.includes("oeuf") || n.includes("poisson")) return "group-red";
  if (n.includes("fruit") || n.includes("légume") || n.includes("legume") || n.includes("oléagineux") || n.includes("légumineuse")) return "group-green";
  if (n.includes("eau") || n.includes("boisson")) return "group-blue";
  if (n.includes("matière grasse") || n.includes("matieres grasses")) return "group-orange";
  if (n.includes("céréale")) return "group-brown";
  if (n.includes("lait")) return "group-black";
  if (n.includes("sucre")) return "group-pink";
  if (n.includes("culinaire")) return "group-purple";

  return "group-default";
}

/**
 * NORMALIZE PLANNING (safe)
 */
function normalizePlanning(planning) {
  if (!planning || typeof planning !== "object") return {};

  const safe = {};

  for (const [day, meals] of Object.entries(planning)) {
    safe[day] = {};

    if (meals && typeof meals === "object") {
      for (const [meal, recipe] of Object.entries(meals)) {
        safe[day][meal] = recipe?.title ? { title: recipe.title } : { title: "—" };
      }
    }
  }

  return safe;
}

/**
 * NORMALIZE SHOPPING
 */
function normalizeShopping(shopping) {
  if (!shopping || typeof shopping !== "object") return {};

  const safe = {};

  for (const [group, items] of Object.entries(shopping)) {
    safe[group] = Array.isArray(items)
      ? items.map(i => ({
          name: i?.name || "—",
          quantity_g: i?.quantity_g || 0,
        }))
      : [];
  }

  return safe;
}

/**
 * MAIN PDF GENERATION
 */
async function generatePDF(data) {
  const templatePath = path.join(__dirname, "template.html");
  const templateHtml = fs.readFileSync(templatePath, "utf8");

  /**
   * 🔥 IMPORTANT FIX LOGO PATH
   */
  const logoPathRaw = path.resolve(
    __dirname,
    "../Frontend/public/img/logo_flavorFit.webp"
  );

  // encode URI properly (IMPORTANT for Puppeteer/Linux)
  const logoPath = "file://" + logoPathRaw.split(path.sep).join("/");

  const planning = normalizePlanning(data.planning);
  const shopping = normalizeShopping(data.shoppingList);

  const html = nunjucks.renderString(templateHtml, {
    constraints: data.constraints || {},
    planning,
    shopping,
    firstName: data.firstName || "",
    lastName: data.lastName || "",

    // 🔥 MUST HAVE
    logo_path: logoPath,

    // safe function injection
    getGroupClass,
  });

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: "networkidle0",
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  return pdfBuffer;
}

module.exports = generatePDF;