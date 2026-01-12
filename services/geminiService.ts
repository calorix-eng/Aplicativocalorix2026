
import { Food } from '../types';

/**
 * Analisa imagem de comida com foco em velocidade e detecção de detalhes.
 */
export const getNutritionFromImage = async (imageFile: File): Promise<Food[]> => {
  // Validação leve no cliente
  const MAX_SIZE = 4 * 1024 * 1024;
  if (imageFile.size > MAX_SIZE) {
    throw new Error("Imagem muito pesada. Tente reduzir a qualidade da foto.");
  }

  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    // Timeout de 25 segundos para evitar espera infinita (Vercel tem limite de 30s)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const rawText = await response.text();
    let data;
    
    try {
        data = JSON.parse(rawText);
    } catch (e) {
        throw new Error("Erro na resposta da IA. Tente novamente.");
    }

    if (!response.ok) {
      throw new Error(data.error || "Erro ao processar imagem.");
    }

    const parsedFoods = JSON.parse(data.analysis);
    
    return parsedFoods.map((f: any) => ({
      ...f,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    }));

  } catch (error: any) {
    if (error.name === 'AbortError') {
        throw new Error("A análise demorou demais. Verifique sua conexão.");
    }
    throw error;
  }
};

export const getNutritionFromText = async (query: string): Promise<Food[]> => {
  const response = await fetch('/api/text-gemini-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getNutritionFromText', payload: { query } }),
  });
  const data = await response.json();
  return JSON.parse(data.analysis).map((f: any) => ({ ...f, id: crypto.randomUUID() }));
};

export const getNutritionFromBarcode = async (barcode: string): Promise<Food[]> => {
  const response = await fetch('/api/text-gemini-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getNutritionFromBarcode', payload: { barcode } }),
  });
  const data = await response.json();
  return JSON.parse(data.analysis).map((f: any) => ({ ...f, id: crypto.randomUUID() }));
};

export const getExercisesFromImage = async (file: File): Promise<string[]> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('prompt', 'Liste exercícios por nome, separados por vírgula.');
  const response = await fetch('/api/extract-text-from-image', { method: 'POST', body: formData });
  const data = await response.json();
  return data.analysis.split(',').map((s: string) => s.trim()).filter(Boolean);
};

export const getMealRecommendations = async (profile: any, totals: any): Promise<any[]> => {
  const response = await fetch('/api/text-gemini-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getMealRecommendations', payload: { prompt: `Sugestões para metas: ${JSON.stringify(totals)}` } }),
  });
  const data = await response.json();
  return JSON.parse(data.analysis);
};

export const getRecipes = async (goal: any, pref: any, profile: any): Promise<any[]> => {
  const response = await fetch('/api/text-gemini-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getRecipes', payload: { prompt: `Receitas para ${goal}, pref: ${pref}` } }),
  });
  const data = await response.json();
  return JSON.parse(data.analysis);
};

export const generateAiImage = async (prompt: string, type?: string): Promise<string> => {
  const response = await fetch('/api/generate-ai-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, type }),
  });
  const data = await response.json();
  return data.imageUrl || "";
};

export const getMotivationalMessage = async (name: string, coach: any): Promise<string> => {
  const response = await fetch('/api/text-gemini-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getMotivationalMessage', payload: { prompt: `Frase motivacional curta para ${name}` } }),
  });
  const data = await response.json();
  return data.analysis;
};

export const generateWorkout = async (profile: any, eq: any, dur: any, lvl: any): Promise<any> => {
  const response = await fetch('/api/text-gemini-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'generateWorkout', payload: { prompt: `Treino ${lvl}, ${dur}min` } }),
  });
  const data = await response.json();
  return JSON.parse(data.analysis);
};

export const parseWorkoutFromImage = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch('/api/parse-workout-image', { method: 'POST', body: formData });
  const data = await response.json();
  return JSON.parse(data.workout);
};

export const generateExerciseImage = async (prompt: string) => {
  return await generateAiImage(prompt, 'fitness');
};

export const testApiHealth = async () => ({ status: 'ok' });
