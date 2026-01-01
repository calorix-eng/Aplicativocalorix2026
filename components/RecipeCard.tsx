import React from 'react';
import { Recipe } from '../types';
import { PlusIcon } from './icons/PlusIcon';

interface RecipeCardProps {
  recipe: Recipe;
  onAdd: (recipe: Recipe) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onAdd }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex flex-col justify-between h-full shadow-md hover:shadow-xl transition-shadow duration-300 relative">
      <div>
        <h3 className="font-bold text-lg font-display text-gray-800 dark:text-white pr-4">{recipe.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3">{recipe.description}</p>

        <div className="text-xs grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600 dark:text-gray-300 border-t pt-2 border-gray-200 dark:border-gray-600">
            <span><strong>Calorias:</strong> {recipe.totalCalories} kcal</span>
            <span><strong>Proteína:</strong> {recipe.totalProtein} g</span>
            <span><strong>Carbs:</strong> {recipe.totalCarbs} g</span>
            <span><strong>Gordura:</strong> {recipe.totalFat} g</span>
        </div>
      </div>
      <button 
        onClick={() => onAdd(recipe)}
        className="w-full mt-4 bg-accent-green bg-opacity-10 text-accent-green dark:bg-opacity-20 p-2 rounded-md text-sm font-semibold flex items-center justify-center hover:bg-opacity-20 dark:hover:bg-opacity-30 transition"
      >
        <PlusIcon />
        <span className="ml-2">Adicionar à Refeição</span>
      </button>
    </div>
  );
};

export default RecipeCard;