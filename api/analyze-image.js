
import { GoogleGenAI, Type } from "@google/genai";
import formidable from "formidable";
import fs from "fs";

// CONFIGURAÇÃO CRÍTICA DA VERCEL
// Desabilita o parser automático para que o Formidable possa ler o stream da imagem
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // 1. Garantir que a resposta seja SEMPRE JSON
  res.setHeader('Content-Type', 'application/json');

  // 2. Filtro de Método
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  // 3. Validação de Configuração
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("ERRO: API_KEY não encontrada no ambiente.");
    return res.status(500).json({ error: "Configuração do servidor incompleta (API_KEY)" });
  }

  // 4. Configurar Formidable para ler a imagem
  const form = formidable({
    maxFileSize: 4 * 1024 * 1024, // Limite interno de 4MB
    keepExtensions: true,
  });

  try {
    // 5. Parsear o FormData
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const imageFile = files.image?.[0];
    if (!imageFile) {
      return res.status(400).json({ error: "Nenhuma imagem foi enviada" });
    }

    // 6. Converter imagem para Base64
    const imageBuffer = fs.readFileSync(imageFile.filepath);
    const base64Image = imageBuffer.toString("base64");
    const mimeType = imageFile.mimetype || "image/jpeg";

    // 7. Inicializar Gemini
    const ai = new GoogleGenAI({ apiKey });
    
    // Schema para garantir JSON válido da IA
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

    // 8. Chamar Gemini 3 Flash no formato correto
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { text: "Analise a comida nesta imagem. Identifique os itens e forneça calorias, proteínas, carboidratos e gorduras. Retorne APENAS o JSON no formato especificado." },
            { inlineData: { data: base64Image, mimeType: mimeType } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    // 9. Retorno de Sucesso
    return res.status(200).json({ 
      success: true, 
      analysis: result.text 
    });

  } catch (error) {
    console.error("ERRO NO BACKEND:", error);
    
    // Fallback de Erro: Garante que a resposta seja JSON
    const statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 500;
    const message = statusCode === 413 
      ? "Imagem muito grande para processamento" 
      : "Falha ao processar imagem no servidor";

    return res.status(statusCode).json({ 
      error: message,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    // Limpeza opcional de arquivos temporários (a Vercel limpa automaticamente no fim da execução, mas é boa prática)
  }
}
