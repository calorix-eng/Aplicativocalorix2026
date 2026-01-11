
// services/geminiService.ts
// IMPORTANTE: O frontend NÃO inicializa mais GoogleGenAI diretamente nem acessa API_KEY.
// A SDK do Gemini (@google/genai) NÃO DEVE ser importada neste arquivo do frontend.
import { Food, Micronutrient, MealSuggestion, UserProfile, Recipe, Workout } from '../types';
import { fileToBase64 } from '../utils/fileUtils'; // Adicionado para converter File para Base64 quando necessário

// O 'Type' do @google/genai não é mais importado aqui.
// As definições de esquema são apenas para referência de tipo no TypeScript, não para uso em runtime.
// No frontend, passamos os prompts e o backend se encarrega de construir o schema se necessário.
const micronutrientProperties: Record<Micronutrient, { type: string, description: string }> = {
    'Vitamina C': { type: 'number', description: 'Vitamina C em mg' },
    'Cálcio': { type: 'number', description: 'Cálcio em mg' },
    'Ferro': { type: 'number', description: 'Ferro em mg' },
    'Vitamina D': { type: 'number', description: 'Vitamina D em mcg' },
    'Vitamina A': { type: 'number', description: 'Vitamina A em mcg' },
    'Potássio': { type: 'number', description: 'Potássio em mg' },
    'Magnésio': { type: 'number', description: 'Magnésio em mg' },
};

// --- Funções de Nutrição ---

/**
 * Envia um arquivo de imagem diretamente para o backend para análise nutricional.
 * @param imageFile O objeto File da imagem.
 * @returns Uma Promise que resolve para um array de Food.
 */
export const getNutritionFromImage = async (imageFile: File): Promise<Food[]> => {
    try {
        const formData = new FormData();
        formData.append('image', imageFile); // Anexa o File diretamente

        const response = await fetch('/api/analyze-image', {
            method: 'POST',
            body: formData,
            // 'Content-Type': 'multipart/form-data' é definido automaticamente pelo navegador
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro desconhecido na análise de imagem.');
        }

        const data = await response.json();
        // O backend agora retorna o JSON já parsed pelo Gemini
        const parsedData = JSON.parse(data.analysis); 
        return parsedData.map((item: any) => ({ ...item, id: crypto.randomUUID() }));
    } catch (error) {
        console.error("Error analyzing image:", error);
        throw error; // Propaga o erro para o componente UI
    }
};

/**
 * Envia uma consulta de texto para o backend para análise nutricional.
 * @param query A consulta de texto.
 * @returns Uma Promise que resolve para um array de Food.
 */
export const getNutritionFromText = async (query: string): Promise<Food[]> => {
     try {
        const response = await fetch('/api/text-gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'getNutritionFromText',
                payload: { query },
                modelName: 'gemini-3-flash-preview',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro desconhecido na busca por texto.');
        }

        const data = await response.json();
        const parsedData = JSON.parse(data.analysis);
        return parsedData.map((item: any) => ({ ...item, id: crypto.randomUUID() }));
    } catch (error) {
        console.error("Error fetching nutrition from text:", error);
        throw error;
    }
};

/**
 * Envia um código de barras para o backend para análise nutricional.
 * @param barcode O código de barras.
 * @returns Uma Promise que resolve para um array de Food.
 */
export const getNutritionFromBarcode = async (barcode: string): Promise<Food[]> => {
    try {
        const response = await fetch('/api/text-gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'getNutritionFromBarcode',
                payload: { barcode },
                modelName: 'gemini-3-flash-preview',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro desconhecido na busca por código de barras.');
        }

        const data = await response.json();
        const parsedData = JSON.parse(data.analysis);
        return parsedData.map((item: any) => ({ ...item, id: crypto.randomUUID() }));
    } catch (error) {
        console.error("Error fetching nutrition from barcode:", error);
        throw error;
    }
};

// --- Funções do Coach e Recomendações ---

export const getMotivationalMessage = async (userName: string, coach: any): Promise<string> => {
    try {
        const prompt = `Aja como um coach de saúde e fitness chamado ${coach.name}. O usuário se chama ${userName}. Escreva uma mensagem motivacional curta (máximo 2 frases) para o dashboard do app, incentivando o usuário a manter o foco em sua dieta e exercícios hoje. Seja empático, direto e inspirador. Não use emojis em excesso.`;
        
        const response = await fetch('/api/text-gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'getMotivationalMessage',
                payload: { prompt },
                modelName: 'gemini-3-flash-preview',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro desconhecido ao obter mensagem motivacional.');
        }

        const data = await response.json();
        return data.analysis?.trim() || "A persistência é o caminho para o sucesso. Continue focado nas suas metas hoje!";
    } catch (error) {
        console.error("Error getting motivational message:", error);
        throw error; // Propaga o erro
    }
};

export const getMealRecommendations = async (userProfile: UserProfile, consumed: any): Promise<MealSuggestion[]> => {
    try {
        const prompt = `Com base no perfil do usuário (Meta: ${userProfile.goal}) e no que ele já consumiu hoje (${consumed.calories}kcal, P:${consumed.protein}g, C:${consumed.carbs}g, G:${consumed.fat}g), sugira 3 opções de refeições saudáveis (Café da Manhã, Almoço ou Jantar) para ajudá-lo a atingir suas metas diárias. Retorne um array JSON com cada objeto contendo as propriedades: mealCategory (string), reasoning (string), e food (objeto Food com name, calories, protein, carbs, fat, servingSize).`;
        
        const response = await fetch('/api/text-gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'getMealRecommendations',
                payload: { prompt },
                modelName: 'gemini-3-flash-preview',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro desconhecido nas recomendações de refeições.');
        }

        const data = await response.json();
        return JSON.parse(data.analysis);
    } catch (error) {
        console.error("Error getting meal recommendations:", error);
        throw error;
    }
};

export const getRecipes = async (goal: string, preferences: string, userProfile: UserProfile): Promise<Recipe[]> => {
    try {
        const prompt = `Crie 3 receitas saudáveis e detalhadas para o objetivo: ${goal}. Preferências do usuário: ${preferences}. Nível de atividade: ${userProfile.activityLevel}. Retorne um array JSON com cada objeto contendo: id, name, description, category, timeInMinutes, totalCalories, totalProtein, totalCarbs, totalFat, imagePrompt (prompt em inglês para gerar imagem), ingredients (array de Food), instructions (array de strings).`;

        const response = await fetch('/api/text-gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'getRecipes',
                payload: { prompt },
                modelName: 'gemini-3-flash-preview',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro desconhecido ao buscar receitas.');
        }

        const data = await response.json();
        const recipes = JSON.parse(data.analysis);
        return recipes.map((r: any) => ({ ...r, id: r.id || crypto.randomUUID() }));
    } catch (error) {
        console.error("Error getting recipes:", error);
        throw error;
    }
};

// --- Funções de Treino ---

export const generateWorkout = async (userProfile: UserProfile, equipment: string[], duration: number, level: string): Promise<Workout | null> => {
    try {
        const prompt = `Crie uma rotina de treino personalizada para um usuário com objetivo de ${userProfile.goal}. Equipamentos disponíveis: ${equipment.join(', ')}. Duração: ${duration} minutos. Nível: ${level}. Retorne um objeto JSON seguindo o esquema: { name?: string, duration_min: number, intensity: string, calories_estimated: number, exercises: [{ id: string, name: string, sets: string, reps: string, rest_s: number, muscle_group?: string, image_prompt?: string }] }.`;

        const response = await fetch('/api/text-gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generateWorkout',
                payload: { prompt },
                modelName: 'gemini-3-pro-preview', // Pro para raciocínio de treino complexo
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro desconhecido ao gerar treino.');
        }

        const data = await response.json();
        const workout = JSON.parse(data.analysis);
        return { ...workout, id: crypto.randomUUID(), date: new Date().toISOString() };
    } catch (error) {
        console.error("Error generating workout:", error);
        throw error;
    }
};

/**
 * Envia um arquivo de imagem de ficha de treino para o backend para análise.
 * @param imageFile O objeto File da imagem.
 * @returns Uma Promise que resolve para um objeto Workout ou null.
 */
export const parseWorkoutFromImage = async (imageFile: File): Promise<Workout | null> => {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await fetch('/api/parse-workout-image', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro desconhecido na análise da imagem do treino.');
        }

        const data = await response.json();
        const workout = JSON.parse(data.workout);
        return { ...workout, id: crypto.randomUUID(), date: new Date().toISOString() };
    } catch (error) {
        console.error("Error parsing workout from image:", error);
        throw error;
    }
};

/**
 * Envia um arquivo de imagem para o backend para extrair nomes de exercícios.
 * @param imageFile O objeto File da imagem.
 * @returns Uma Promise que resolve para um array de strings com os nomes dos exercícios.
 */
export const getExercisesFromImage = async (imageFile: File): Promise<string[]> => {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('prompt', `Liste apenas os nomes dos exercícios físicos identificados nesta imagem, separados por vírgula. Retorne apenas os nomes, sem frases adicionais. Exemplo: Agachamento, Supino, Flexão.`);

        const response = await fetch('/api/extract-text-from-image', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro desconhecido ao extrair exercícios da imagem.');
        }
        const data = await response.json();
        // O backend agora retorna um campo 'analysis' com a string de texto.
        return data.analysis?.split(',').map((s: string) => s.trim()).filter(Boolean) || [];
    } catch (error) {
        console.error("Error getting exercises from image:", error);
        throw error;
    }
};

// --- Geração de Imagens ---

/**
 * Envia um prompt para o backend para gerar uma imagem com IA.
 * @param prompt O prompt de texto para a geração da imagem.
 * @param type O tipo de imagem a ser gerada ('food' ou 'fitness').
 * @returns Uma Promise que resolve para a URL da imagem (base64 data URL) ou null.
 */
export const generateAiImage = async (prompt: string, type: 'food' | 'fitness' = 'food'): Promise<string | null> => {
    try {
        const response = await fetch('/api/generate-ai-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, type }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro desconhecido na geração de imagem.');
        }

        const data = await response.json();
        return data.imageUrl || null;
    } catch (error) {
        console.error("Image generation failed:", error);
        throw error;
    }
};

export const generateExerciseImage = (prompt: string) => generateAiImage(prompt, 'fitness');
