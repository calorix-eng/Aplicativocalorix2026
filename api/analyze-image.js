
// api/analyze-image.js
import { GoogleGenAI, Type } from "@google/genai";
import formidable from "formidable";
import fs from "fs";

// CONFIGURAÇÃO OBRIGATÓRIA DA VERCEL: Desabilita o parser padrão para aceitar streams de arquivos
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // 1. Filtro de Método
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  // 2. Validação da Chave
  // FIX: Using API_KEY as per guidelines.
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY não configurada no ambiente da Vercel!");
    return res.status(500).json({ error: "Configuração do servidor incompleta (API KEY)." });
  }

  // 3. Parsing do FormData usando Formidable
  const form = formidable({
    maxFileSize: 4 * 1024 * 1024, // Limite de 4MB
  });

  try {
    const [fields, files] = await form.parse(req);
    const imageFile = files.image?.[0];

    if (!imageFile) {
      return res.status(400).json({ error: "Arquivo de imagem não detectado no envio." });
    }

    // 4. Conversão para Base64 (O Gemini exige esse formato no Node)
    const imageData = fs.readFileSync(imageFile.filepath);
    const base64Data = imageData.toString("base64");
    const mimeType = imageFile.mimetype || "image/jpeg";

    // 5. Inicialização da IA
    const ai = new GoogleGenAI({ apiKey });
    
    // Schema de Resposta para garantir JSON válido da IA
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

    // 6. Chamada ao Gemini 3 Flash usando o formato de parts correto
    // FIX: Using recommended generateContent parameters and gemini-3-flash-preview.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: "Analise a comida nesta imagem. Estime calorias e macros. Retorne estritamente um array JSON." },
          { inlineData: { data: base64Data, mimeType } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    // 7. Retorno Sempre em JSON
    // FIX: Accessing .text property directly.
    return res.status(200).json({ 
      success: true,
      analysis: response.text 
    });

  } catch (error) {
    console.error("Erro no processamento da IA:", error);
    
    // Garantia de que NUNCA retornaremos HTML em caso de erro
    return res.status(500).json({ 
      success: false,
      error: error.message || "Falha interna ao analisar imagem.",
      details: "Verifique o log da Vercel para mais informações."
    });
  }
}
