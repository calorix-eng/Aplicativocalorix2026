
// api/analyze-image.js
import { GoogleGenAI, Type } from "@google/genai";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API_KEY ausente no servidor" });
  }

  const form = formidable({
    maxFileSize: 4 * 1024 * 1024, 
    keepExtensions: true,
  });

  try {
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const imageFile = files.image?.[0];
    if (!imageFile) {
      return res.status(400).json({ error: "Imagem não recebida" });
    }

    const imageBuffer = fs.readFileSync(imageFile.filepath);
    const base64Image = imageBuffer.toString("base64");
    const mimeType = imageFile.mimetype || "image/jpeg";

    const ai = new GoogleGenAI({ apiKey });
    
    const responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fat: { type: Type.NUMBER },
          servingSize: { type: Type.STRING },
        },
        required: ["name", "calories", "protein", "carbs", "fat", "servingSize"],
      },
    };

    // Chamada otimizada para o Gemini 3 Flash com o prompt aprimorado pelo usuário
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { text: "Analise cuidadosamente a imagem e identifique qualquer alimento visível, mesmo que esteja parcialmente visível ou em pequenas quantidades. Liste os alimentos identificados e forneça seus valores nutricionais aproximados. Retorne estritamente um array JSON estruturado." },
            { inlineData: { data: base64Image, mimeType: mimeType } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, // Deterministico e rápido
      }
    });

    return res.status(200).json({ 
      success: true, 
      analysis: result.text 
    });

  } catch (error) {
    console.error("Erro no servidor:", error);
    return res.status(500).json({ 
      error: "Falha na análise rápida",
      details: error.message 
    });
  }
}
