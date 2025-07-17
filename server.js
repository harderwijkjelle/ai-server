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
  const style = req.body.style;
  const imagePath = req.file.path;

  const imageData = fs.readFileSync(imagePath, { encoding: "base64" });
  const base64Image = `data:image/jpeg;base64,${imageData}`;

  const prompt = `Maak een ${style} afbeelding van deze foto`;

  try {
const output = await replicate.run(
  "tstramer/stable-diffusion-xl:db21e45c1c30eab81f7fd47220f0eab2a04b4b76ce066d3cadb8b5c0b1f3bfa4",
  {
    input: {
      image: base64Image,
      prompt: prompt
    }
  }
);


    fs.unlinkSync(imagePath);
    res.json({ image_url: output[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI-fout" });
  }
});

app.listen(port, () => {
  console.log(`Server draait op http://localhost:${port}`);
});
