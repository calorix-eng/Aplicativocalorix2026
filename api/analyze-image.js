
// api/analyze-image.js
import { GoogleGenAI, Type } from "@google/genai";
import formidable from "formidable";
import fs from "fs";

// Desativa o body parser padrão para permitir upload de arquivos
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Garantia absoluta de header JSON
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Configuração do servidor ausente (API_KEY)" });
  }

  const form = formidable({
    maxFileSize: 4 * 1024 * 1024, // 4MB
    keepExtensions: true,
  });

  try {
    // 1. Parsing do FormData
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const imageFile = files.image?.[0];
    if (!imageFile) {
      return res.status(400).json({ error: "Nenhuma imagem recebida no servidor" });
    }

    // 2. Preparação dos dados para o Gemini
    const imageBuffer = fs.readFileSync(imageFile.filepath);
    const base64Image = imageBuffer.toString("base64");
    const mimeType = imageFile.mimetype || "image/jpeg";

    const ai = new GoogleGenAI({ apiKey });
    
    // Schema estrito para evitar respostas de texto livre da IA
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

    // 3. Chamada ao Gemini 3 Flash
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { text: "Identifique os alimentos nesta foto e retorne seus valores nutricionais aproximados em formato JSON." },
            { inlineData: { data: base64Image, mimeType: mimeType } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    // 4. Retorno de Sucesso
    return res.status(200).json({ 
      success: true, 
      analysis: result.text 
    });

  } catch (error) {
    console.error("CRITICAL SERVER ERROR:", error);
    
    // Fallback de erro amigável sempre em JSON
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 500;
    const message = status === 413 ? "A imagem enviada é muito pesada" : "Falha ao processar imagem no servidor";
    
    return res.status(status).json({ 
      error: message,
      details: error.message 
    });
  }
}
