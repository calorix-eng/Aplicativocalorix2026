
// services/geminiService.ts
import { Food, UserProfile, MealSuggestion, Recipe, Workout } from '../types';

/**
 * Utilitário para validar e parsear a resposta da API com segurança total.
 * Evita o erro "Unexpected end of JSON input".
 */
async function safeFetchJson(response: Response) {
  const text = await response.text();
  try {
    const json = JSON.parse(text);
    if (!response.ok) {
      throw new Error(json.error || `Erro na API (${response.status})`);
    }
    return json;
  } catch (err) {
    console.error("Resposta não-JSON detectada:", text);
    throw new Error(`O servidor retornou uma resposta inválida. Status: ${response.status}`);
  }
}

/**
 * Analisa uma imagem enviada via câmera ou galeria.
 * @param imageFile Objeto File do navegador (input type="file" ou capture)
 */
export const getNutritionFromImage = async (imageFile: File): Promise<Food[]> => {
  // 1. Proteção de tamanho (Vercel Serverless tem limite de payload)
  const MAX_SIZE = 3.5 * 1024 * 1024; // 3.5MB para segurança
  if (imageFile.size > MAX_SIZE) {
    throw new Error("A imagem é muito grande. Tente tirar uma foto mais simples ou reduza a qualidade.");
  }

  try {
    // 2. Construção do FormData (Padrão para envio de arquivos)
    const formData = new FormData();
    formData.append('image', imageFile);

    // 3. Chamada para o SEU backend (Proxy)
    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      body: formData,
      // IMPORTANTE: Não defina Content-Type manualmente ao usar FormData!
      // O navegador fará isso automaticamente incluindo o boundary.
    });

    const data = await safeFetchJson(response);
    
    // O Gemini via backend retorna o JSON da análise no campo 'analysis'
    const foods = JSON.parse(data.analysis); 
    
    return foods.map((f: any) => ({
      ...f,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    }));
  } catch (error: any) {
    console.error("Erro crítico no processamento da imagem:", error);
    throw error;
  }
};

// FIX: Added getNutritionFromText to handle manual search queries using Gemini.
export const getNutritionFromText = async (query: string): Promise<Food[]> => {
  try {
    const response = await fetch('/api/text-gemini-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'getNutritionFromText', 
        payload: { query: `Forneça os dados nutricionais (calorias, proteína, carboidratos, gordura) para: "${query}". Retorne um array JSON.` } 
      }),
    });

    const data = await safeFetchJson(response);
    const foods = JSON.parse(data.analysis);
    
    return foods.map((f: any) => ({
      ...f,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    }));
  } catch (error: any) {
    console.error("Erro ao buscar nutrição por texto:", error);
    throw error;
  }
};

// FIX: Added getNutritionFromBarcode to process scanned product barcodes using Gemini.
export const getNutritionFromBarcode = async (barcode: string): Promise<Food[]> => {
  try {
    const response = await fetch('/api/text-gemini-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'getNutritionFromBarcode', 
        payload: { barcode } 
      }),
    });

    const data = await safeFetchJson(response);
    const foods = JSON.parse(data.analysis);
    
    return foods.map((f: any) => ({
      ...f,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    }));
  } catch (error: any) {
    console.error("Erro ao buscar nutrição por código de barras:", error);
    throw error;
  }
};

// FIX: Added getExercisesFromImage to extract workout names from photos.
export const getExercisesFromImage = async (imageFile: File): Promise<string[]> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('prompt', "Liste apenas os nomes dos exercícios físicos presentes nesta imagem, em português, separados por vírgula. Retorne apenas o texto puro.");

    const response = await fetch('/api/extract-text-from-image', {
      method: 'POST',
      body: formData,
    });

    const data = await safeFetchJson(response);
    return data.analysis.split(',').map((s: string) => s.trim()).filter(Boolean);
  } catch (error: any) {
    console.error("Erro ao extrair exercícios da imagem:", error);
    throw error;
  }
};

// FIX: Added getMealRecommendations for AI-powered personalized food suggestions.
export const getMealRecommendations = async (userProfile: UserProfile, consumedTotals: { calories: number; protein: number; carbs: number; fat: number }): Promise<MealSuggestion[]> => {
  try {
    const prompt = `Com base nas metas: ${JSON.stringify(userProfile.goals)} e no consumo atual: ${JSON.stringify(consumedTotals)}, sugira 3 refeições curtas para hoje.`;
    const response = await fetch('/api/text-gemini-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'getMealRecommendations', 
        payload: { prompt } 
      }),
    });

    const data = await safeFetchJson(response);
    return JSON.parse(data.analysis).map((s: any) => ({
        ...s,
        food: { ...s.food, id: crypto.randomUUID() }
    }));
  } catch (error: any) {
    console.error("Erro ao obter recomendações de refeição:", error);
    throw error;
  }
};

// FIX: Added getRecipes to generate structured recipe data via Gemini.
export const getRecipes = async (goal: string, preferences: string, userProfile: UserProfile): Promise<Recipe[]> => {
  try {
    const prompt = `Crie 3 receitas saudáveis para quem quer "${goal}". Preferências do usuário: "${preferences}". Perfil: ${JSON.stringify(userProfile)}.`;
    const response = await fetch('/api/text-gemini-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'getRecipes', 
        payload: { prompt } 
      }),
    });

    const data = await safeFetchJson(response);
    return JSON.parse(data.analysis).map((r: any) => ({
        ...r,
        id: r.id || crypto.randomUUID()
    }));
  } catch (error: any) {
    console.error("Erro ao obter receitas:", error);
    throw error;
  }
};

// FIX: Added generateAiImage to produce images using Gemini 2.5 Flash Image.
export const generateAiImage = async (prompt: string, type: 'food' | 'fitness'): Promise<string> => {
  try {
    const response = await fetch('/api/generate-ai-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, type }),
    });

    const data = await safeFetchJson(response);
    return data.imageUrl;
  } catch (error: any) {
    console.error("Erro ao gerar imagem AI:", error);
    throw error;
  }
};

// FIX: Added getMotivationalMessage for personalized coaching feedback.
export const getMotivationalMessage = async (userName: string, coach: { name: string }): Promise<string> => {
  try {
    const prompt = `Você é o coach ${coach.name}. Dê uma dica de saúde curta e motivacional para ${userName}.`;
    const response = await fetch('/api/text-gemini-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'getMotivationalMessage', 
        payload: { prompt } 
      }),
    });

    const data = await safeFetchJson(response);
    return data.analysis;
  } catch (error: any) {
    console.error("Erro ao obter mensagem motivacional:", error);
    return "Mantenha o foco nos seus objetivos!";
  }
};

// FIX: Added generateWorkout to create tailored fitness plans via Gemini.
export const generateWorkout = async (userProfile: UserProfile, equipment: string[], duration: number, level: string): Promise<Workout> => {
  try {
    const prompt = `Crie um treino completo de ${duration} minutos, nível ${level}, usando: ${equipment.join(', ')}. Perfil: ${JSON.stringify(userProfile)}.`;
    const response = await fetch('/api/text-gemini-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'generateWorkout', 
        payload: { prompt } 
      }),
    });

    const data = await safeFetchJson(response);
    const workout = JSON.parse(data.analysis);
    return {
        ...workout,
        id: crypto.randomUUID(),
        date: new Date().toISOString()
    };
  } catch (error: any) {
    console.error("Erro ao gerar treino:", error);
    throw error;
  }
};

// FIX: Added parseWorkoutFromImage to scan workout sheets from photos.
export const parseWorkoutFromImage = async (imageFile: File): Promise<Workout> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch('/api/parse-workout-image', {
      method: 'POST',
      body: formData,
    });

    const data = await safeFetchJson(response);
    const workout = JSON.parse(data.workout);
    return {
        ...workout,
        id: crypto.randomUUID(),
        date: new Date().toISOString()
    };
  } catch (error: any) {
    console.error("Erro ao ler ficha de treino:", error);
    throw error;
  }
};

// FIX: Added generateExerciseImage for visual exercise demonstrations.
export const generateExerciseImage = async (prompt: string): Promise<string> => {
    return generateAiImage(prompt, 'fitness');
};
