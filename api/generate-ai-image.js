
// api/generate-ai-image.js
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // Garante que o Content-Type seja JSON, pois esperamos um corpo JSON
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido. Use POST." });
  }

  // FIX: Using API_KEY as per guidelines.
  if (!process.env.API_KEY) {
    console.error("ERRO CRÍTICO: API_KEY não está configurada no ambiente.");
    return res.status(500).json({ error: "Chave da API Gemini não configurada no servidor." });
  }

  const { prompt, type } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt de imagem ausente." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const style = type === 'food' 
        ? "Professional food photography, appetizing, high resolution, soft studio lighting" 
        : "Fitness lifestyle photography, energetic, high quality, realistic cinematic lighting";
    
    const fullPrompt = `${prompt}. ${style}. White background or natural environment.`;

    // FIX: Using gemini-2.5-flash-image for generation and correct parts structure.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: fullPrompt }] },
      config: {
        imageConfig: {
              aspectRatio: "1:1"
          }
      }
    });

    // A resposta do Gemini 2.5 Flash Image pode conter múltiplas partes (texto, imagem)
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        // Retorna o base64 da imagem diretamente
        return res.status(200).json({ imageUrl: `data:image/png;base64,${part.inlineData.data}` });
      }
    }

    return res.status(500).json({ error: "A IA não conseguiu gerar uma imagem. Tente um prompt diferente." });

  } catch (error) {
    console.error("Erro no backend generate-ai-image:", error);
    // Sempre retorna um erro JSON válido
    return res.status(500).json({ error: "Falha interna ao gerar a imagem com a IA. Tente novamente." });
  }
}
