
// api/extract-text-from-image.js
import { GoogleGenAI } from "@google/genai";
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
    // O prompt é enviado como um campo de texto no FormData
    const userPrompt = fields.prompt?.[0] || 'Descreva o conteúdo desta imagem.';

    if (!imageFile) {
      return res.status(400).json({ error: "Nenhuma imagem foi enviada." });
    }

    const imageData = fs.readFileSync(imageFile.filepath);
    const base64Image = imageData.toString("base64");
    const mimeType = imageFile.mimetype;

    // FIX: Initialize with correct API key variable.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // FIX: Using direct generateContent call instead of deprecated getGenerativeModel.
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Flash para velocidade
      contents: {
        parts: [
          { text: userPrompt },
          { inlineData: { data: base64Image, mimeType: mimeType } },
        ],
      },
      // Não pedimos JSON aqui, a resposta é texto simples, sem responseSchema
    });

    // FIX: Accessing .text property directly.
    const responseText = result.text;
    return res.status(200).json({ analysis: responseText });

  } catch (error) {
    console.error("Erro no backend extract-text-from-image:", error);
    if (error.code === formidable.errors.biggerThanMaxFileSize) {
        return res.status(413).json({ error: "A imagem é muito grande (limite 5MB). Por favor, comprima-a antes de enviar." });
    }
    // Sempre retorna um erro JSON válido
    return res.status(500).json({ error: "Falha interna ao extrair texto da imagem. Tente novamente." });
  }
}
