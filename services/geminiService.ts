
import { Food, UserProfile, MealSuggestion, Recipe, Workout } from '../types';

/**
 * Utilitário para garantir que a resposta do servidor seja tratada com segurança.
 * Previne o erro "Unexpected token < at position 0" (HTML retornado em vez de JSON).
 */
async function safeParseResponse(response: Response) {
  const text = await response.text();
  try {
    const data = JSON.parse(text);
    if (!response.ok) {
      throw new Error(data.error || `Erro do servidor (${response.status})`);
    }
    return data;
  } catch (e) {
    console.error("Falha ao parsear resposta como JSON. Recebido:", text.substring(0, 100));
    throw new Error("O servidor retornou uma resposta inválida. Tente novamente mais tarde.");
  }
}

/**
 * Envia imagem para análise nutricional via Proxy Serverless.
 */
export const getNutritionFromImage = async (imageFile: File): Promise<Food[]> => {
  // 1. Validação de Tamanho (Limite Vercel ~4.5MB, usamos 3MB para segurança)
  const MAX_FILE_SIZE = 3 * 1024 * 1024; 
  if (imageFile.size > MAX_FILE_SIZE) {
    throw new Error("A imagem é muito grande (máx 3MB). Tente tirar uma foto com menor resolução.");
  }

  try {
    // 2. Preparação do FormData
    const formData = new FormData();
    formData.append('image', imageFile);

    // 3. Chamada ao backend (Proxy Seguro)
    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      body: formData,
      // IMPORTANTE: Não defina headers de Content-Type manualmente aqui, 
      // o navegador fará isso automaticamente com o boundary correto.
    });

    const data = await safeParseResponse(response);

    // O Gemini retorna o JSON como uma string dentro do campo 'analysis'
    if (!data.analysis) {
        throw new Error("A análise da IA veio vazia.");
    }

    const parsedFoods = JSON.parse(data.analysis);
    
    return parsedFoods.map((f: any) => ({
      ...f,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    }));

  } catch (error: any) {
    console.error("Erro no fluxo de análise de imagem:", error.message);
    // Repassa o erro para a UI tratar sem quebrar o app
    throw error;
  }
};

// ... outras funções de texto seguem o mesmo padrão de safeParseResponse
export const getNutritionFromText = async (query: string): Promise<Food[]> => {
    try {
        const response = await fetch('/api/text-gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getNutritionFromText', payload: { query } }),
        });
        const data = await safeParseResponse(response);
        return JSON.parse(data.analysis).map((f: any) => ({ ...f, id: crypto.randomUUID() }));
    } catch (error: any) {
        throw error;
    }
};

// FIX: Added getNutritionFromBarcode to fix error in AddFoodModal.tsx
export const getNutritionFromBarcode = async (barcode: string): Promise<Food[]> => {
    try {
        const response = await fetch('/api/text-gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getNutritionFromBarcode', payload: { barcode } }),
        });
        const data = await safeParseResponse(response);
        return JSON.parse(data.analysis).map((f: any) => ({ ...f, id: crypto.randomUUID() }));
    } catch (error: any) {
        throw error;
    }
};

// FIX: Added getExercisesFromImage to fix error in ProfileModal.tsx
export const getExercisesFromImage = async (imageFile: File): Promise<string[]> => {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('prompt', 'Identifique apenas os nomes dos exercícios presentes nesta imagem de ficha de treino. Retorne uma lista de nomes separados por vírgula, sem explicações extras.');
        const response = await fetch('/api/extract-text-from-image', {
            method: 'POST',
            body: formData,
        });
        const data = await safeParseResponse(response);
        const text = data.analysis;
        return text.split(',').map((s: string) => s.trim()).filter(Boolean);
    } catch (error: any) {
        throw error;
    }
};

// FIX: Added getMealRecommendations to fix error in MealRecommendations.tsx
export const getMealRecommendations = async (userProfile: UserProfile, consumedTotals: any): Promise<MealSuggestion[]> => {
    try {
        const prompt = `Com base no perfil do usuário (Objetivo: ${userProfile.goal}, Peso: ${userProfile.weight}kg) e no que ele já consumiu hoje (${consumedTotals.calories}kcal, P:${consumedTotals.protein}g, C:${consumedTotals.carbs}g, F:${consumedTotals.fat}g), sugira 3 opções de refeições saudáveis (nome, calorias, macros e porção) que ajudem a atingir as metas diárias (${userProfile.goals.calories}kcal). Retorne em JSON.`;
        const response = await fetch('/api/text-gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getMealRecommendations', payload: { prompt } }),
        });
        const data = await safeParseResponse(response);
        return JSON.parse(data.analysis);
    } catch (error: any) {
        throw error;
    }
};

// FIX: Added getRecipes to fix error in RecipesDashboard.tsx
export const getRecipes = async (goal: string, preferences: string, userProfile: UserProfile): Promise<Recipe[]> => {
    try {
        const prompt = `Gere 3 receitas saudáveis para quem tem o objetivo de ${goal}. Preferências do usuário: ${preferences || 'nenhuma'}. Considere que o usuário tem ${userProfile.age} anos e pesa ${userProfile.weight}kg. Retorne um array de objetos JSON com id, name, description, category, timeInMinutes, totalCalories, totalProtein, totalCarbs, totalFat, imagePrompt (em inglês), ingredients (array de objetos Food) e instructions (array de strings).`;
        const response = await fetch('/api/text-gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getRecipes', payload: { prompt } }),
        });
        const data = await safeParseResponse(response);
        return JSON.parse(data.analysis);
    } catch (error: any) {
        throw error;
    }
};

// FIX: Added generateAiImage to fix error in RecipesDashboard.tsx and RecipeDetailModal.tsx
export const generateAiImage = async (prompt: string, type: 'food' | 'exercise'): Promise<string> => {
    try {
        const response = await fetch('/api/generate-ai-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, type }),
        });
        const data = await safeParseResponse(response);
        return data.imageUrl;
    } catch (error: any) {
        throw error;
    }
};

// FIX: Added getMotivationalMessage to fix error in MotivationalCoach.tsx
export const getMotivationalMessage = async (userName: string, coach: any): Promise<string> => {
    try {
        const prompt = `Você é o coach ${coach.name}. O usuário se chama ${userName}. Dê uma mensagem motivacional curta e direta para ele continuar focado na dieta e nos treinos hoje. Use um tom encorajador.`;
        const response = await fetch('/api/text-gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getMotivationalMessage', payload: { prompt } }),
        });
        const data = await safeParseResponse(response);
        return data.analysis;
    } catch (error: any) {
        throw error;
    }
};

// FIX: Added generateWorkout to fix error in WorkoutDashboard.tsx
export const generateWorkout = async (userProfile: UserProfile, equipment: string[], duration: number, level: string): Promise<Workout> => {
    try {
        const prompt = `Gere um treino personalizado para o usuário ${userProfile.name} (Nível: ${level}). Equipamentos disponíveis: ${equipment.join(', ')}. Duração desejada: ${duration} minutos. O objetivo dele é ${userProfile.goal}. Retorne um objeto JSON de treino com id, name, duration_min, intensity, calories_estimated e um array de exercises (id, name, sets, reps, rest_s, muscle_group, image_prompt).`;
        const response = await fetch('/api/text-gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'generateWorkout', payload: { prompt } }),
        });
        const data = await safeParseResponse(response);
        return JSON.parse(data.analysis);
    } catch (error: any) {
        throw error;
    }
};

// FIX: Added parseWorkoutFromImage to fix error in WorkoutDashboard.tsx
export const parseWorkoutFromImage = async (imageFile: File): Promise<Workout> => {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);
        const response = await fetch('/api/parse-workout-image', {
            method: 'POST',
            body: formData,
        });
        const data = await safeParseResponse(response);
        // api/parse-workout-image returns { workout: string (JSON) }
        return JSON.parse(data.workout);
    } catch (error: any) {
        throw error;
    }
};

// FIX: Added generateExerciseImage to fix error in WorkoutDashboard.tsx
export const generateExerciseImage = (prompt: string) => generateAiImage(prompt, 'exercise');
