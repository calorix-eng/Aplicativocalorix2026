
// api/parse-workout-image.js
import { GoogleGenAI, Type } from "@google/genai";
import formidable from "formidable";
import fs from "fs";

// Desabilitar o bodyParser padrão da Vercel para ler arquivos binários
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Garante que o Content-Type seja JSON
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido. Use POST." });
  }

  // FIX: Using API_KEY as per guidelines.
  if (!process.env.API_KEY) {
    console.error("ERRO CRÍTICO: API_KEY não está configurada no ambiente.");
    return res.status(500).json({ error: "Chave da API Gemini não configurada no servidor." });
  }

  const form = formidable({
    maxFileSize: 5 * 1024 * 1024,
    allowEmptyFiles: false,
    minFileSize: 100,
  });

  try {
    const [fields, files] = await form.parse(req);
    const imageFile = files.image?.[0];

    if (!imageFile) {
      return res.status(400).json({ error: "Nenhuma imagem de treino foi enviada." });
    }

    const imageData = fs.readFileSync(imageFile.filepath);
    const base64Image = imageData.toString("base64");
    const mimeType = imageFile.mimetype;

    // FIX: Initialize with correct API key variable.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Esta é uma foto de uma ficha de academia ou plano de exercícios. Extraia todos os exercícios, séries, repetições e tempo de descanso. Estime as calorias totais queimadas para esse treino completo. Retorne um objeto JSON estritamente no formato: { name?: string, duration_min: number, intensity: string, calories_estimated: number, exercises: [{ id: string, name: string, sets: string, reps: string, rest_s: number, muscle_group?: string, image_prompt?: string }] }. Garanta que cada exercício tenha um 'id' único.`;

    const workoutSchema = {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            duration_min: { type: Type.NUMBER },
            intensity: { type: Type.STRING },
            calories_estimated: { type: Type.NUMBER },
            exercises: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        sets: { type: Type.STRING },
                        reps: { type: Type.STRING },
                        rest_s: { type: Type.NUMBER },
                        muscle_group: { type: Type.STRING },
                        image_prompt: { type: Type.STRING, description: "Prompt em inglês para ilustrar o exercício." }
                    },
                    required: ["name", "sets", "reps", "rest_s"]
                }
            }
        },
        required: ["name", "duration_min", "exercises", "calories_estimated"]
    };

    // FIX: Using direct generateContent call instead of deprecated getGenerativeModel.
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { data: base64Image, mimeType: mimeType } },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: workoutSchema,
      },
    });

    // FIX: Accessing .text property directly.
    const responseText = result.text;
    
    try {
        JSON.parse(responseText);
    } catch (parseError) {
        console.error("Gemini retornou JSON inválido para treino:", responseText, parseError);
        return res.status(500).json({ error: "A IA retornou um formato de treino inválido. Tente outra foto.", rawResponse: responseText });
    }

    return res.status(200).json({ workout: responseText });

  } catch (error) {
    console.error("Erro no backend parse-workout-image:", error);
    if (error.code === formidable.errors.biggerThanMaxFileSize) {
        return res.status(413).json({ error: "A imagem é muito grande (limite 5MB). Por favor, comprima-a antes de enviar." });
    }
    // Sempre retorna um erro JSON válido
    return res.status(500).json({ error: "Falha interna ao analisar a imagem do treino. Tente novamente." });
  }
}
