
// api/text-gemini-proxy.js
import { GoogleGenAI, Type } from "@google/genai";

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

  // O body já é parsed pela Vercel por padrão para application/json
  const { action, payload, modelName, config = {} } = req.body;

  if (!action || !payload) {
    return res.status(400).json({ error: "Ação e/ou payload ausentes na requisição." });
  }

  try {
    // FIX: Initialize with correct API key variable.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let geminiResponse;
    const currentModel = modelName || "gemini-3-flash-preview";

    // Definições de esquema para garantir formato de saída consistente (se a IA suportar)
    const foodSchema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "Nome do alimento em português." },
            calories: { type: Type.NUMBER, description: "Calorias estimadas." },
            protein: { type: Type.NUMBER, description: "Proteína em gramas." },
            carbs: { type: Type.NUMBER, description: "Carboidratos em gramas." },
            fat: { type: Type.NUMBER, description: "Gordura em gramas." },
            servingSize: { type: Type.STRING, description: "Porção detectada, ex: '1 unidade média', '100g', '2 colheres'."},
            micronutrients: {
                type: Type.OBJECT,
                properties: { // Exemplo, adicione mais micronutrientes se necessário
                    'Vitamina C': { type: Type.NUMBER, description: 'Vitamina C em mg' },
                    'Cálcio': { type: Type.NUMBER, description: 'Cálcio em mg' },
                    'Ferro': { type: Type.NUMBER, description: 'Ferro em mg' },
                }
            }
        },
        required: ["name", "calories", "protein", "carbs", "fat", "servingSize"],
    };
    const foodArraySchema = { type: Type.ARRAY, items: foodSchema };

    const recipeSchema = {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            timeInMinutes: { type: Type.NUMBER },
            totalCalories: { type: Type.NUMBER },
            totalProtein: { type: Type.NUMBER },
            totalCarbs: { type: Type.NUMBER },
            totalFat: { type: Type.NUMBER },
            imagePrompt: { type: Type.STRING, description: "Prompt em inglês para gerar imagem deste prato." },
            ingredients: { type: Type.ARRAY, items: foodSchema },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["name", "description", "category", "timeInMinutes", "totalCalories", "ingredients", "instructions"]
    };
    const recipeArraySchema = { type: Type.ARRAY, items: recipeSchema };

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

    const mealSuggestionArraySchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                mealCategory: { type: Type.STRING },
                reasoning: { type: Type.STRING },
                food: foodSchema
            },
            required: ["mealCategory", "reasoning", "food"]
        }
    };

    let geminiConfig = { ...config };

    // FIX: Using direct generateContent calls instead of deprecated getGenerativeModel.
    switch (action) {
      case 'getNutritionFromText':
        geminiConfig.responseMimeType = "application/json";
        geminiConfig.responseSchema = foodArraySchema;
        geminiResponse = await ai.models.generateContent({
          model: currentModel,
          contents: payload.query,
          config: geminiConfig,
        });
        break;
      case 'getNutritionFromBarcode':
        geminiConfig.responseMimeType = "application/json";
        geminiConfig.responseSchema = foodArraySchema;
        geminiResponse = await ai.models.generateContent({
          model: currentModel,
          contents: `Forneça as informações nutricionais completas para o produto com código de barras: "${payload.barcode}". Se for um produto brasileiro comum, use dados de tabelas oficiais (TACO/IBGE). Retorne array JSON.`,
          config: geminiConfig,
        });
        break;
      case 'getMotivationalMessage':
        // Não exige responseSchema nem JSON
        geminiResponse = await ai.models.generateContent({
          model: currentModel,
          contents: payload.prompt,
          config: geminiConfig,
        });
        break;
      case 'getMealRecommendations':
        geminiConfig.responseMimeType = "application/json";
        geminiConfig.responseSchema = mealSuggestionArraySchema;
        geminiResponse = await ai.models.generateContent({
          model: currentModel,
          contents: payload.prompt,
          config: geminiConfig,
        });
        break;
      case 'getRecipes':
        geminiConfig.responseMimeType = "application/json";
        geminiConfig.responseSchema = recipeArraySchema;
        geminiResponse = await ai.models.generateContent({
          model: currentModel,
          contents: payload.prompt,
          config: geminiConfig,
        });
        break;
      case 'generateWorkout':
        geminiConfig.responseMimeType = "application/json";
        geminiConfig.responseSchema = workoutSchema;
        geminiResponse = await ai.models.generateContent({
          model: "gemini-3-pro-preview", // Usar Pro para raciocínio de treino complexo
          contents: payload.prompt,
          config: geminiConfig,
        });
        break;
      default:
        return res.status(400).json({ error: `Ação desconhecida: ${action}` });
    }

    // FIX: Accessing .text property directly.
    const responseText = geminiResponse.text;
    
    // Tenta fazer um parse adicional para validar a estrutura JSON para ações que esperam JSON
    if (geminiConfig.responseMimeType === 'application/json') {
        try {
            JSON.parse(responseText); // Valida se é um JSON válido
        } catch (parseError) {
            console.error(`Gemini retornou JSON inválido para ${action}:`, responseText, parseError);
            return res.status(500).json({ error: `A IA retornou um formato JSON inválido para ${action}.`, rawResponse: responseText });
        }
    }

    return res.status(200).json({ analysis: responseText });

  } catch (error) {
    console.error(`Erro no backend text-gemini-proxy para a ação ${action}:`, error);
    // Sempre retorna um erro JSON válido
    return res.status(500).json({ error: `Falha interna ao processar requisição de texto para ${action}.` });
  }
}
