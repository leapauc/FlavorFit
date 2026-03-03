const { spawn } = require("child_process");
const path = require("path");

exports.generatedPDF = async (req, res) => {
  try {
    const pythonPath = path.join(__dirname, "../../.venv/bin/python3");
    const scriptPath = path.join(__dirname, "../generatePDF.py");

    const pythonProcess = spawn(pythonPath, [scriptPath]);

    pythonProcess.stdin.write(JSON.stringify(req.body));
    pythonProcess.stdin.end();

    let data = [];

    pythonProcess.stdout.on("data", (chunk) => {
      data.push(chunk);
    });

    pythonProcess.stderr.on("data", (err) => {
      console.error("Python error:", err.toString());
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        return res.status(500).json({ message: "Erreur génération PDF" });
      }

      const pdfBuffer = Buffer.concat(data);

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=rapport.pdf",
      });

      res.send(pdfBuffer);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
