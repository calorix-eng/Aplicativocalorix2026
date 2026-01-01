import React, { useState } from 'react';
import { UserProfile, Food, Recipe as AiRecipe } from '../types';
import RecipeDetailModal, { DisplayRecipe } from './RecipeDetailModal';
import { getRecipes } from '../services/geminiService';
import { FireIcon } from './icons/FireIcon';
import { ClockIcon } from './icons/ClockIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface RecipesDashboardProps {
  userProfile: UserProfile;
  onAddRecipeToLog: (foods: Food[], mealName: string) => void;
}

const RecipesDashboard: React.FC<RecipesDashboardProps> = ({ userProfile, onAddRecipeToLog }) => {
  const [selectedRecipe, setSelectedRecipe] = useState<DisplayRecipe | null>(null);
  const [generatedRecipes, setGeneratedRecipes] = useState<DisplayRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState('');
  const [activeGoal, setActiveGoal] = useState<'lose' | 'maintain' | 'gain'>(userProfile.goal);
  
  const goalMap = {
    lose: 'Perder Peso',
    maintain: 'Manter Peso',
    gain: 'Ganhar Peso',
  };

  const handleGenerateRecipes = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedRecipes([]);

    try {
        const aiRecipes: AiRecipe[] = await getRecipes(activeGoal, preferences, userProfile);
        if (aiRecipes.length === 0) {
            setError('Não foi possível gerar receitas. Tente ajustar suas preferências ou tente novamente mais tarde.');
        } else {
            const displayRecipes: DisplayRecipe[] = aiRecipes.map(recipe => ({
                ...recipe,
                imageUrl: `https://source.unsplash.com/400x300/?${encodeURIComponent(recipe.imagePrompt)}`
            }));
            setGeneratedRecipes(displayRecipes);
        }
    } catch (e) {
        setError('Ocorreu um erro ao buscar as receitas. Por favor, tente novamente.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const GoalButton: React.FC<{ goal: 'lose' | 'maintain' | 'gain' }> = ({ goal }) => (
    <button
        onClick={() => setActiveGoal(goal)}
        className={`px-4 py-2 text-sm font-semibold rounded-full transition ${activeGoal === goal ? 'bg-accent-green text-white' : 'bg-gray-200 dark:bg-gray-700 text-light-text dark:text-dark-text hover:bg-gray-300 dark:hover:bg-gray-600'}`}
    >
        {goalMap[goal]}
    </button>
  );

  return (
    <>
      <div className="space-y-8">
        <div>
            <div className="flex items-center">
                <SparklesIcon className="w-8 h-8 text-accent-green mr-3" />
                <h2 className="text-3xl font-bold font-display text-gray-800 dark:text-white">Receitas da IA</h2>
            </div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Gere receitas personalizadas com base no seu objetivo e preferências.</p>
        </div>

        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg space-y-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">1. Escolha seu objetivo</label>
                <div className="flex flex-wrap gap-2">
                    <GoalButton goal="lose" />
                    <GoalButton goal="maintain" />
                    <GoalButton goal="gain" />
                </div>
            </div>
             <div>
                <label htmlFor="preferences" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">2. Descreva suas preferências (opcional)</label>
                <input
                    type="text"
                    id="preferences"
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    placeholder="Ex: vegetariano, com frango, sem glúten..."
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-accent-green outline-none transition"
                />
            </div>
            <button
                onClick={handleGenerateRecipes}
                disabled={isLoading}
                className="w-full bg-accent-green text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-400 flex items-center justify-center space-x-2"
            >
                {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <SparklesIcon className="w-5 h-5" />
                )}
                <span>{isLoading ? 'Gerando...' : 'Gerar Receitas'}</span>
            </button>
        </div>

        {error && <p className="text-center text-red-500">{error}</p>}
        
        {generatedRecipes.length === 0 && !isLoading && !error && (
            <div className="text-center py-16">
                <p className="text-gray-500 dark:text-gray-400">Suas receitas aparecerão aqui.</p>
            </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {generatedRecipes.map((recipe) => (
            <div 
              key={recipe.id} 
              className="bg-light-card dark:bg-dark-card rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 animate-fade-in-up"
              onClick={() => setSelectedRecipe(recipe)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedRecipe(recipe)}
            >
              <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-40 object-cover" />
              <div className="p-4">
                <span className="px-2 py-0.5 text-xs font-semibold text-white bg-accent-green rounded-full">{recipe.category}</span>
                <h3 className="font-semibold text-md text-light-text dark:text-dark-text truncate mt-2" title={recipe.name}>{recipe.name}</h3>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2 space-x-4">
                  <div className="flex items-center">
                    <FireIcon className="w-4 h-4 mr-1 text-orange-500" />
                    <span>{recipe.totalCalories} kcal</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1 text-blue-500" />
                    <span>{recipe.timeInMinutes} min</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedRecipe && (
        <RecipeDetailModal 
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          userProfile={userProfile}
          onAddRecipeToLog={onAddRecipeToLog}
        />
      )}
    </>
  );
};

export default RecipesDashboard;
