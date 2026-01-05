
import { GoogleGenAI, Type } from "@google/genai";
import { Food, Micronutrient, MealSuggestion, UserProfile, Recipe, Workout, Exercise } from '../types';

// Inicialização segura seguindo as diretrizes
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const micronutrientProperties: Record<Micronutrient, { type: Type, description: string }> = {
    'Vitamina C': { type: Type.NUMBER, description: 'Vitamina C em mg' },
    'Cálcio': { type: Type.NUMBER, description: 'Cálcio em mg' },
    'Ferro': { type: Type.NUMBER, description: 'Ferro em mg' },
    'Vitamina D': { type: Type.NUMBER, description: 'Vitamina D em mcg' },
    'Vitamina A': { type: Type.NUMBER, description: 'Vitamina A em mcg' },
    'Potássio': { type: Type.NUMBER, description: 'Potássio em mg' },
    'Magnésio': { type: Type.NUMBER, description: 'Magnésio em mg' },
};

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
            properties: micronutrientProperties,
            description: "Valores de micronutrientes para a porção."
        }
    },
    required: ["name", "calories", "protein", "carbs", "fat", "servingSize"],
};

const foodArraySchema = {
    type: Type.ARRAY,
    items: foodSchema
};

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
        ingredients: {
            type: Type.ARRAY,
            items: foodSchema
        },
        instructions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
    },
    required: ["name", "description", "category", "timeInMinutes", "totalCalories", "ingredients", "instructions"]
};

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

// --- Funções de Nutrição ---

export const getNutritionFromImage = async (base64Image: string, mimeType: string): Promise<Food[]> => {
    try {
        const imagePart = {
            inlineData: {
                mimeType: mimeType,
                data: base64Image,
            },
        };

        const prompt = `Analise detalhadamente a comida nesta foto. Identifique cada item visível no prato ou embalagem. Estime as calorias e macronutrientes baseando-se no tamanho visual das porções. Retorne obrigatoriamente um array JSON de objetos seguindo o esquema definido.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: foodArraySchema,
            }
        });

        const jsonStr = response.text.trim();
        const parsedData = JSON.parse(jsonStr);

        return parsedData.map((item: any) => ({ ...item, id: crypto.randomUUID() }));
    } catch (error) {
        console.error("Error analyzing image with Gemini:", error);
        throw error;
    }
};

export const getNutritionFromText = async (query: string): Promise<Food[]> => {
     try {
        const prompt = `Forneça as informações nutricionais completas (calorias, macronutrientes e micronutrientes), nas unidades corretas (mg/mcg), para a consulta: "${query}". Liste correspondências precisas.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
             config: {
                responseMimeType: 'application/json',
                responseSchema: foodArraySchema,
            }
        });
        
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr).map((item: any) => ({ ...item, id: crypto.randomUUID() }));
    } catch (error) {
        console.error("Error fetching nutrition from text with Gemini:", error);
        return [];
    }
};

export const getNutritionFromBarcode = async (barcode: string): Promise<Food[]> => {
    try {
        const prompt = `Forneça as informações nutricionais completas para o produto com código de barras: "${barcode}". Se for um produto brasileiro comum, use dados de tabelas oficiais (TACO/IBGE). Retorne array JSON.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: foodArraySchema,
            }
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr).map((item: any) => ({ ...item, id: crypto.randomUUID() }));
    } catch (error) {
        console.error("Error fetching nutrition from barcode with Gemini:", error);
        return [];
    }
};

// --- Funções do Coach e Recomendações ---

export const getMotivationalMessage = async (userName: string, coach: any): Promise<string> => {
    try {
        const prompt = `Aja como um coach de saúde e fitness chamado ${coach.name}. O usuário se chama ${userName}. Escreva uma mensagem motivacional curta (máximo 2 frases) para o dashboard do app, incentivando o usuário a manter o foco em sua dieta e exercícios hoje. Seja empático, direto e inspirador. Não use emojis em excesso.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        
        return response.text?.trim() || "A persistência é o caminho para o sucesso. Continue focado nas suas metas hoje!";
    } catch (error) {
        return "Cada pequena escolha saudável hoje constrói o seu resultado de amanhã. Vamos com tudo!";
    }
};

export const getMealRecommendations = async (userProfile: UserProfile, consumed: any): Promise<MealSuggestion[]> => {
    try {
        const prompt = `Com base no perfil do usuário (Meta: ${userProfile.goal}) e no que ele já consumiu hoje (${consumed.calories}kcal, P:${consumed.protein}g, C:${consumed.carbs}g, G:${consumed.fat}g), sugira 3 opções de refeições saudáveis (Café da Manhã, Almoço ou Jantar) para ajudá-lo a atingir suas metas diárias. Retorne um array JSON.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
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
                }
            }
        });

        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const getRecipes = async (goal: string, preferences: string, userProfile: UserProfile): Promise<Recipe[]> => {
    try {
        const prompt = `Crie 3 receitas saudáveis e detalhadas para o objetivo: ${goal}. Preferências do usuário: ${preferences}. Nível de atividade: ${userProfile.activityLevel}. Retorne um array JSON seguindo o esquema.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: recipeSchema
                }
            }
        });

        const recipes = JSON.parse(response.text.trim());
        return recipes.map((r: any) => ({ ...r, id: crypto.randomUUID() }));
    } catch (error) {
        console.error(error);
        return [];
    }
};

// --- Funções de Treino ---

export const generateWorkout = async (userProfile: UserProfile, equipment: string[], duration: number, level: string): Promise<Workout | null> => {
    try {
        const prompt = `Crie uma rotina de treino personalizada para um usuário com objetivo de ${userProfile.goal}. Equipamentos disponíveis: ${equipment.join(', ')}. Duração: ${duration} minutos. Nível: ${level}. Retorne um objeto JSON seguindo o esquema de treino.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Pro para raciocínio de treino complexo
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: workoutSchema
            }
        });

        const workout = JSON.parse(response.text.trim());
        return { ...workout, id: crypto.randomUUID(), date: new Date().toISOString() };
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const parseWorkoutFromImage = async (base64Image: string, mimeType: string): Promise<Workout | null> => {
    try {
        const imagePart = {
            inlineData: { mimeType, data: base64Image }
        };
        const prompt = `Esta é uma foto de uma ficha de academia ou plano de exercícios. Extraia todos os exercícios, séries, repetições e tempo de descanso. Se houver nomes de exercícios, mantenha-os. Estime as calorias totais queimadas para esse treino completo. Retorne JSON seguindo o esquema de workout.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: workoutSchema
            }
        });

        const workout = JSON.parse(response.text.trim());
        return { ...workout, id: crypto.randomUUID(), date: new Date().toISOString() };
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const getExercisesFromImage = async (base64Image: string, mimeType: string): Promise<string[]> => {
    try {
        const imagePart = {
            inlineData: { mimeType, data: base64Image }
        };
        const prompt = `Liste apenas os nomes dos exercícios físicos identificados nesta imagem, separados por vírgula.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [imagePart, { text: prompt }] }
        });

        return response.text?.split(',').map(s => s.trim()) || [];
    } catch (error) {
        return [];
    }
};

// --- Geração de Imagens ---

export const generateAiImage = async (prompt: string, type: 'food' | 'fitness' = 'food'): Promise<string | null> => {
    try {
        const style = type === 'food' 
            ? "Professional food photography, appetizing, high resolution, soft studio lighting" 
            : "Fitness lifestyle photography, energetic, high quality, realistic cinematic lighting";
        
        const fullPrompt = `${prompt}. ${style}. White background or natural environment.`;

        // FIX: Updated contents to accept string directly as per guidelines for Gemini text generation tasks.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: fullPrompt,
            config: {
                imageConfig: {
                    aspectRatio: "1:1"
                }
            }
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Image generation failed:", error);
        return null;
    }
};

export const generateExerciseImage = (prompt: string) => generateAiImage(prompt, 'fitness');
