
// api/analyze-image.js
import { GoogleGenAI, Type } from "@google/genai";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // Necessário para o formidable parsear o request
  },
};

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  // 2️⃣ Método permitido
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  // 1️⃣ Verificação da API KEY (CORRIGIDO)
  // A variável de ambiente correta é 'API_KEY', não 'GOOGLE_API_KEY'.
  if (!process.env.API_KEY) {
    return res.status(500).json({ error: "Configuração do servidor ausente (API_KEY)" });
  }

  const form = formidable({
    maxFileSize: 4 * 1024 * 1024, 
    keepExtensions: true,
  });

  try {
    // 3️⃣ Validação do payload (CORRIGIDO)
    // O frontend envia FormData, então precisamos usar 'formidable' para extrair o arquivo.
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

    // 4️⃣ Inicializa Gemini com SDK e modelo corretos
    // Use 'GoogleGenAI' e passe a chave da API como um objeto { apiKey: ... }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // O frontend espera um array de objetos Food, então definimos o schema.
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

    // 5️⃣ Chamada correta ao Gemini com prompt otimizado
    // Use 'ai.models.generateContent' com o modelo 'gemini-3-flash-preview' para velocidade.
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { text: "Identifique TODOS os alimentos na foto, mesmo em pequenas quantidades. Para cada um, estime os valores nutricionais (calorias, proteína, carboidratos, gordura) e a porção. Retorne APENAS um array JSON." },
            { inlineData: { data: base64Image, mimeType: mimeType } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, // Baixa temperatura para respostas mais rápidas e consistentes
      }
    });

    // 6️⃣ Resposta final (JSON garantido e formato correto)
    // O SDK moderno fornece a resposta de texto diretamente na propriedade '.text'.
    // O formato da resposta é '{ success: true, analysis: ... }' como esperado pelo frontend.
    const analysisText = result.text;
    JSON.parse(analysisText); // Valida se é um JSON válido

    return res.status(200).json({ 
      success: true, 
      analysis: analysisText
    });

  } catch (error) {
    console.error("Erro no servidor (api/analyze-image):", error);
    // 7️⃣ Fallback absoluto
    return res.status(500).json({ 
      error: "Falha na análise da imagem no servidor",
      details: error.message 
    });
  }
}
