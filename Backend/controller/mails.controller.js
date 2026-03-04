const nodemailer = require("nodemailer");
const { spawn } = require("child_process");
const path = require("path");

exports.sendPlanningEmail = async (req, res) => {
  try {
    const { email, firstName, lastName, startDate, payload } = req.body;

    // ============================
    // 1️⃣ VALIDATION
    // ============================

    if (!email || !startDate) {
      return res.status(400).json({
        message: "Email ou date manquante",
      });
    }

    if (!payload) {
      return res.status(400).json({
        message: "Payload manquant pour génération PDF",
      });
    }

    // ============================
    // 2️⃣ LANCER PYTHON
    // ============================

    const pythonPath = path.join(__dirname, "../../.venv/bin/python3");
    const scriptPath = path.join(__dirname, "../generatePDF.py");

    const pythonProcess = spawn(pythonPath, [scriptPath]);

    // Envoyer les données au script
    pythonProcess.stdin.write(JSON.stringify(payload));
    pythonProcess.stdin.end();

    let pdfBuffer = Buffer.alloc(0);
    let pythonError = "";

    // Récupérer le PDF
    pythonProcess.stdout.on("data", (data) => {
      pdfBuffer = Buffer.concat([pdfBuffer, data]);
    });

    // Récupérer les erreurs Python
    pythonProcess.stderr.on("data", (data) => {
      pythonError += data.toString();
    });

    pythonProcess.on("close", async (code) => {
      if (code !== 0) {
        console.error("ERREUR PYTHON :", pythonError);
        return res.status(500).json({
          message: "Erreur génération PDF",
        });
      }

      if (!pdfBuffer || pdfBuffer.length === 0) {
        return res.status(500).json({
          message: "PDF vide",
        });
      }

      // ============================
      // 3️⃣ ENVOI EMAIL
      // ============================

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `MealPlan - ${startDate}`,
        html: `
          <h2>Bonjour ${firstName} ${lastName}</h2>
          <p>
            Votre planning alimentaire du <strong>${startDate}</strong> est disponible en pièce jointe.
          </p>
          <br/>
          <p>
            Une alimentation équilibrée contribue à votre santé et votre bien-être.
          </p>
        `,
        attachments: [
          {
            filename: `MealPlan-${startDate}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });

      return res.status(200).json({
        message: "Email envoyé avec PDF",
      });
    });
  } catch (error) {
    console.error("Erreur serveur :", error);
    return res.status(500).json({
      message: "Erreur serveur",
    });
  }
};
