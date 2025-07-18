const express = require("express");
const multer = require("multer");
const Replicate = require("replicate");
const fs = require("fs");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
const upload = multer({ dest: "uploads/" });

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post("/generate", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Geen afbeelding ontvangen" });
    }

    const style = req.body.style || "cartoon";
    const imagePath = req.file.path;
    const imageData = fs.readFileSync(imagePath, { encoding: "base64" });
    const base64Image = `data:image/jpeg;base64,${imageData}`;

    const prompt = `Maak een ${style} afbeelding van deze foto`;

    console.log("Prompt:", prompt);
    console.log("Afbeelding grootte:", base64Image.length);

    const output = await replicate.run(
      "andreasjansson/controlnet-image-to-image:db21e45c1c30eab81f7fd47220f0eab2a04b4b76ce066d3cadb8b5c0b1f3bfa4",
      {
        input: {
          image: base64Image,
          prompt: prompt,
          a_prompt: "high quality, detailed",
          num_inference_steps: 30,
          strength: 0.8,
          guidance_scale: 7.5
        }
      }
    );

    fs.unlinkSync(imagePath);

    if (output && output.length > 0) {
      res.json({ image_url: output[0] });
    } else {
      res.status(500).json({ error: "Geen resultaat van AI" });
    }
  } catch (err) {
    console.error("AI-fout:", err);
    res.status(500).json({ error: "AI-fout tijdens generatie" });
  }
});

app.listen(port, () => {
  console.log(`Server draait op http://localhost:${port}`);
});
