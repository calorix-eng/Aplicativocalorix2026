
// api/analyze-image.js
import { GoogleGenAI, Type } from "@google/genai";
import formidable from "formidable";
import fs from "fs"; // Módulo nativo do Node.js

// Desabilitar o bodyParser padrão da Vercel para que 'formidable' possa lidar com 'multipart/form-data'
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido. Use POST." });
  }

  // Verificar se a chave da API está configurada
  if (!process.env.GOOGLE_API_KEY) {
    console.error("ERRO CRÍTICO: GOOGLE_API_KEY não está configurada no ambiente.");
    return res.status(500).json({ error: "Chave da API Gemini não configurada no servidor. Contate o suporte." });
  }

  const form = formidable({
    // Opções para gerenciar o upload de arquivos
    maxFileSize: 5 * 1024 * 1024, // Limite de 5MB por arquivo (ajuste conforme a necessidade)
    allowEmptyFiles: false,
    minFileSize: 100, // Tamanho mínimo para arquivos válidos
  });

  try {
    const [fields, files] = await form.parse(req); // Parseia a requisição para obter campos e arquivos
    
    // 'image' é o nome do campo de arquivo no FormData do frontend
    const imageFile = files.image?.[0]; 

    if (!imageFile) {
      return res.status(400).json({ error: "Nenhuma imagem foi enviada ou o arquivo está vazio." });
    }

    const imageData = fs.readFileSync(imageFile.filepath); // Lê o arquivo temporário
    const base64Image = imageData.toString("base64"); // Converte para Base64
    const mimeType = imageFile.mimetype; // Obtém o tipo MIME do arquivo

    // Inicializa o cliente Gemini com a chave segura do ambiente
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
    
    // Usar gemini-3-flash-preview para análise multimodal de imagens
    const model = ai.models.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `Analise detalhadamente a comida nesta foto. Identifique cada item visível no prato ou embalagem. Estime as calorias e macronutrientes (proteínas, carboidratos e gorduras) baseando-se no tamanho visual das porções. Retorne obrigatoriamente um array JSON de objetos, onde cada objeto tem as propriedades: name (string), calories (number), protein (number), carbs (number), fat (number), servingSize (string, ex: '1 unidade média', '100g', '2 colheres'). Não inclua outros textos além do JSON.`;

    // Define o schema de resposta esperado para garantir o formato JSON
    const responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Nome do alimento em português." },
            calories: { type: Type.NUMBER, description: "Calorias estimadas." },
            protein: { type: Type.NUMBER, description: "Proteína em gramas." },
            carbs: { type: Type.NUMBER, description: "Carboidratos em gramas." },
            fat: { type: Type.NUMBER, description: "Gordura em gramas." },
            servingSize: { type: Type.STRING, description: "Porção detectada, ex: '1 unidade média', '100g', '2 colheres'."},
          },
          required: ["name", "calories", "protein", "carbs", "fat", "servingSize"],
        },
      };

    const result = await model.generateContent({
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { data: base64Image, mimeType: mimeType } }, // Formato CORRETO para imagens
        ],
      }],
      config: {
        responseMimeType: "application/json", // Solicita resposta em JSON
        responseSchema: responseSchema,      // Aplica o esquema para guiar a IA
      },
    });

    const responseText = result.text; // Retorna o texto JSON do Gemini

    // Tenta fazer um parse adicional para validar a estrutura JSON
    try {
        JSON.parse(responseText);
    } catch (parseError) {
        console.error("Gemini retornou JSON inválido para análise de imagem:", responseText, parseError);
        // Retorna um erro JSON claro para o frontend
        return res.status(500).json({ error: "A IA retornou um formato inválido. Tente outra foto.", rawResponse: responseText });
    }

    return res.status(200).json({ analysis: responseText }); // Sempre retorna JSON válido

  } catch (error) {
    console.error("Erro no backend analyze-image:", error);
    // Tratamento de erros do 'formidable' ou outros erros internos
    if (error.code === formidable.errors.biggerThanMaxFileSize) {
        return res.status(413).json({ error: "A imagem é muito grande (limite 5MB). Por favor, comprima-a antes de enviar." });
    }
    // Sempre retorna um erro JSON válido
    return res.status(500).json({ error: "Falha interna ao processar a imagem. Tente novamente." });
  }
}
