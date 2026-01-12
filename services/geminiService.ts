
import { Food } from '../types';

/**
 * Função principal de análise de imagem.
 * Implementa segurança multicamadas para evitar erros de JSON inesperados.
 */
export const getNutritionFromImage = async (imageFile: File): Promise<Food[]> => {
  // 1. Validação preventiva no cliente (Economiza largura de banda e evita 500 na Vercel)
  const MAX_SIZE = 3.5 * 1024 * 1024; // 3.5MB
  if (imageFile.size > MAX_SIZE) {
    throw new Error("A imagem é muito grande. Use uma foto mais simples ou reduza a resolução.");
  }

  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    // 2. Chamada ao backend
    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      body: formData,
    });

    // 3. Leitura Resiliente (Lê como texto primeiro para detectar HTML de erro)
    const rawText = await response.text();
    
    let data;
    try {
        data = JSON.parse(rawText);
    } catch (parseErr) {
        console.error("Resposta não-JSON detectada:", rawText.substring(0, 100));
        throw new Error("O servidor retornou um erro inesperado. Tente novamente em instantes.");
    }

    if (!response.ok) {
      throw new Error(data.error || `Erro ${response.status}: Falha na comunicação.`);
    }

    if (!data.analysis) {
        throw new Error("A IA não retornou dados válidos.");
    }

    // 4. Parse final do conteúdo gerado pelo Gemini
    const parsedFoods = JSON.parse(data.analysis);
    
    return parsedFoods.map((f: any) => ({
      ...f,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    }));

  } catch (error: any) {
    console.error("Erro no serviço de nutrição por imagem:", error.message);
    throw error;
  }
};

// ... Restante das funções do serviço seguindo o mesmo padrão de fetch
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
  formData.append('prompt', 'Identifique exercícios físicos. Retorne nomes separados por vírgula.');
  const response = await fetch('/api/extract-text-from-image', { method: 'POST', body: formData });
  const data = await response.json();
  return data.analysis.split(',').map((s: string) => s.trim()).filter(Boolean);
};

export const getMealRecommendations = async (profile: any, totals: any): Promise<any[]> => {
  const prompt = `Sugira refeições para completar as metas do dia: ${JSON.stringify(totals)}`;
  const response = await fetch('/api/text-gemini-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getMealRecommendations', payload: { prompt } }),
  });
  const data = await response.json();
  return JSON.parse(data.analysis);
};

export const getRecipes = async (goal: any, pref: any, profile: any): Promise<any[]> => {
  const prompt = `Gere 3 receitas para ${goal}. Preferências: ${pref}.`;
  const response = await fetch('/api/text-gemini-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getRecipes', payload: { prompt } }),
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
  const prompt = `Frase motivadora para ${name} do coach ${coach.name}.`;
  const response = await fetch('/api/text-gemini-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getMotivationalMessage', payload: { prompt } }),
  });
  const data = await response.json();
  return data.analysis;
};

export const generateWorkout = async (profile: any, eq: any, dur: any, lvl: any): Promise<any> => {
  const prompt = `Gere treino: ${lvl}, ${dur}min, equipamentos: ${eq.join(',')}`;
  const response = await fetch('/api/text-gemini-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'generateWorkout', payload: { prompt } }),
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
