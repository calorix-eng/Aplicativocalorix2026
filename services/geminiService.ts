
import { Food } from '../types';

/**
 * FUNÇÃO DE DIAGNÓSTICO: Testa se a API da Vercel está viva e retornando JSON.
 * Se esta função logar HTML, o erro é de rota/infraestrutura na Vercel.
 */
export const testApiHealth = async () => {
  console.log("Iniciando teste de saúde da API...");
  try {
    const response = await fetch('/api/analyze-image', { method: 'POST' });
    const rawText = await response.text();
    
    console.log("Status da Resposta:", response.status);
    console.log("Conteúdo Bruto Recebido:", rawText);

    try {
      const json = JSON.parse(rawText);
      console.log("JSON Parseado com Sucesso:", json);
      return json;
    } catch (parseError) {
      console.error("ERRO CRÍTICO: O servidor retornou algo que não é JSON!");
      throw new Error(`Resposta inválida (Não-JSON). Verifique o console.`);
    }
  } catch (error: any) {
    console.error("Falha na comunicação com /api/analyze-image:", error);
    throw error;
  }
};

// Helper for proxy calls to text-gemini-proxy
const fetchGeminiProxy = async (action: string, payload: any, modelName?: string) => {
  const response = await fetch('/api/text-gemini-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload, modelName }),
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Erro na comunicação com a IA');
  }
  
  return await response.json();
};

/**
 * Wrapper de produção que agora utiliza o fluxo de diagnóstico.
 */
export const getNutritionFromImage = async (imageFile: File): Promise<Food[]> => {
  // Primeiro, validamos se a API está funcionando
  await testApiHealth();

  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('prompt', 'Analise esta imagem de comida e extraia uma lista de alimentos com calorias, proteínas, carboidratos e gorduras. Retorne um array JSON no formato: [{"name": "nome", "calories": 100, "protein": 10, "carbs": 20, "fat": 5, "servingSize": "100g", "id": "uuid"}].');

  try {
    const response = await fetch('/api/extract-text-from-image', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) return [];
    const data = await response.json();
    return JSON.parse(data.analysis);
  } catch (err) {
    console.error("Erro ao analisar imagem de comida:", err);
    return [];
  }
};

// Funções de fallback agora implementadas para chamar o backend
export const getNutritionFromText = async (query: string): Promise<Food[]> => {
  try {
    const data = await fetchGeminiProxy('getNutritionFromText', { query });
    return JSON.parse(data.analysis);
  } catch (err) {
    console.error("Erro ao obter nutrição por texto:", err);
    return [];
  }
};

export const getNutritionFromBarcode = async (barcode: string): Promise<Food[]> => {
  try {
    const data = await fetchGeminiProxy('getNutritionFromBarcode', { barcode });
    return JSON.parse(data.analysis);
  } catch (err) {
    console.error("Erro ao obter nutrição por código de barras:", err);
    return [];
  }
};

export const getExercisesFromImage = async (file: File): Promise<string[]> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('prompt', 'Identifique os exercícios físicos sendo realizados ou listados nesta imagem. Retorne apenas uma lista de nomes de exercícios separados por vírgula.');

  try {
    const response = await fetch('/api/extract-text-from-image', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) return [];
    const data = await response.json();
    return data.analysis.split(',').map((s: string) => s.trim()).filter(Boolean);
  } catch (err) {
    console.error("Erro ao extrair exercícios da imagem:", err);
    return [];
  }
};

export const getMealRecommendations = async (profile: any, totals: any): Promise<any[]> => {
  try {
    const prompt = `Com base no perfil do usuário: ${JSON.stringify(profile)} e no que ele já consumiu hoje (calorias: ${totals.calories}, proteínas: ${totals.protein}g, carbos: ${totals.carbs}g, gorduras: ${totals.fat}g), sugira refeições equilibradas para completar as metas do dia.`;
    const data = await fetchGeminiProxy('getMealRecommendations', { prompt });
    return JSON.parse(data.analysis);
  } catch (err) {
    console.error("Erro ao obter recomendações de refeição:", err);
    return [];
  }
};

export const getRecipes = async (goal: any, pref: any, profile: any): Promise<any[]> => {
  try {
    const prompt = `Gere 3 receitas saudáveis para o objetivo de "${goal}". Preferências: ${pref}. Considere o seguinte perfil nutricional: ${JSON.stringify(profile.goals)}`;
    const data = await fetchGeminiProxy('getRecipes', { prompt });
    return JSON.parse(data.analysis);
  } catch (err) {
    console.error("Erro ao gerar receitas:", err);
    return [];
  }
};

// FIX: Updated signature to accept 'type' argument to match usage in components (fixing "Expected 1 arguments, but got 2" error).
export const generateAiImage = async (prompt: string, type?: string): Promise<string> => {
  try {
    const response = await fetch('/api/generate-ai-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, type }),
    });
    if (!response.ok) return "";
    const data = await response.json();
    return data.imageUrl || "";
  } catch (error) {
    console.error("Erro ao gerar imagem com IA:", error);
    return "";
  }
};

export const getMotivationalMessage = async (name: string, coach: any): Promise<string> => {
  try {
    const prompt = `Gere uma frase motivadora curta e impactante para o usuário ${name}. A mensagem deve parecer vir do coach ${coach.name}.`;
    const data = await fetchGeminiProxy('getMotivationalMessage', { prompt });
    return data.analysis;
  } catch (err) {
    console.error("Erro ao obter mensagem motivadora:", err);
    return "Foco no progresso, não na perfeição!";
  }
};

export const generateWorkout = async (profile: any, eq: any, dur: any, lvl: any): Promise<any> => {
  try {
    const prompt = `Gere um treino personalizado. Objetivo: ${profile.goal}. Equipamentos: ${eq.join(', ')}. Duração: ${dur} minutos. Nível: ${lvl}.`;
    const data = await fetchGeminiProxy('generateWorkout', { prompt });
    return JSON.parse(data.analysis);
  } catch (err) {
    console.error("Erro ao gerar treino:", err);
    return null;
  }
};

export const parseWorkoutFromImage = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('image', file);
  try {
    const response = await fetch('/api/parse-workout-image', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) return null;
    const data = await response.json();
    return JSON.parse(data.workout);
  } catch (err) {
    console.error("Erro ao parsear treino da imagem:", err);
    return null;
  }
};

// FIX: Changed to async to follow pattern and usage in components.
export const generateExerciseImage = async (prompt: string) => {
  return await generateAiImage(prompt, 'fitness');
};
