
import React, { useState } from 'react';
import { UserProfile, Food, MealSuggestion } from '../types';
import { getMealRecommendations } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { PlusIcon } from './icons/PlusIcon';
import { Card, CardHeader, CardTitle, CardContent } from './CalorieRing';

interface MealRecommendationsProps {
  userProfile: UserProfile;
  consumedTotals: { calories: number; protein: number; carbs: number; fat: number };
  // FIX: Updated to expect an array of Food to be compatible with App.tsx's handler.
  onAddFood: (foods: Food[], mealName: string) => void;
}

const MealRecommendations: React.FC<MealRecommendationsProps> = ({ userProfile, consumedTotals, onAddFood }) => {
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const results = await getMealRecommendations(userProfile, consumedTotals);
      if (results.length === 0) {
        setError('Não foi possível gerar sugestões. Tente novamente mais tarde.');
      } else {
        setSuggestions(results);
      }
    } catch (e) {
      setError('Ocorreu um erro ao buscar sugestões.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <SparklesIcon className="w-5 h-5 text-accent-green mr-3" />
          Recomendações da IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 && !isLoading && !error && (
            <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
                Precisa de inspiração? Deixe a IA sugerir refeições para você atingir suas metas.
            </p>
            <button
                onClick={handleGenerate}
                className="bg-accent-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition inline-flex items-center justify-center"
            >
                Gerar Sugestões
            </button>
            </div>
        )}

        {isLoading && <div className="text-center py-4">Gerando sugestões...</div>}
        {error && <div className="text-center py-4 text-red-500">{error}</div>}

        {suggestions.length > 0 && (
            <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestions.map((suggestion, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex flex-col justify-between">
                    <div>
                    <p className="font-bold text-accent-green">{suggestion.mealCategory}</p>
                    <h4 className="font-semibold text-lg">{suggestion.food.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {suggestion.food.calories} kcal • {suggestion.food.servingSize}
                    </p>
                    <p className="text-xs italic text-gray-600 dark:text-gray-300 mb-3">"{suggestion.reasoning}"</p>
                    </div>
                    <button 
                    // FIX: Wrapped suggestion.food in an array to match updated prop type.
                    onClick={() => onAddFood([suggestion.food], suggestion.mealCategory)}
                    className="w-full mt-2 bg-accent-green bg-opacity-10 text-accent-green dark:bg-opacity-20 p-2 rounded-md text-sm font-semibold flex items-center justify-center hover:bg-opacity-20 dark:hover:bg-opacity-30 transition"
                    >
                    <PlusIcon />
                    <span className="ml-2">Adicionar</span>
                    </button>
                </div>
                ))}
            </div>
            <button 
                onClick={handleGenerate}
                className="w-full text-center text-sm font-semibold text-accent-blue hover:underline mt-4"
                disabled={isLoading}
            >
                {isLoading ? 'Gerando...' : 'Gerar novas sugestões'}
            </button>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MealRecommendations;