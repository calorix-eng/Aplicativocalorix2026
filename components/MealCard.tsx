import React, { useState } from 'react';
import { Food, MealCategory } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface MealCardProps {
  mealCategory: MealCategory;
  mealItems: Food[];
  onAddClick: () => void;
  onDeleteFood: (foodId: string) => void;
  addFoodButtonId?: string;
}

const MealCard: React.FC<MealCardProps> = ({ mealCategory, mealItems, onAddClick, onDeleteFood, addFoodButtonId }) => {
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const totalCalories = mealItems.reduce((sum, item) => sum + item.calories, 0);

  // Sort items by timestamp, earliest first
  const sortedItems = [...mealItems].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  
  const handleConfirmDelete = () => {
    if (deletingItemId) {
      onDeleteFood(deletingItemId);
      setDeletingItemId(null);
    }
  };


  return (
    <div className="bg-light-card dark:bg-dark-card p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold">{mealCategory.name}</h3>
        <span className="text-gray-600 dark:text-gray-400 font-semibold">{totalCalories} kcal</span>
      </div>
      <div className="flex-grow space-y-2">
        {sortedItems.length > 0 ? (
          sortedItems.map(item => {
            const isDeleting = item.id === deletingItemId;
            return (
              <div key={item.id} className={`group flex justify-between items-center text-sm py-1 transition-colors duration-200 rounded-md ${isDeleting ? 'bg-red-500/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                <div className="flex items-center flex-1 min-w-0 pl-1">
                  {item.timestamp && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 mr-2 font-mono flex-shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  <span className="truncate" title={item.name}>{item.name}</span>
                </div>

                <div className="flex items-center flex-shrink-0 ml-2 pr-1">
                  {isDeleting ? (
                    <div className="flex items-center space-x-3 animate-fade-in-up">
                      <button onClick={handleConfirmDelete} className="font-semibold text-red-500 hover:underline text-xs">Remover</button>
                      <button onClick={() => setDeletingItemId(null)} className="font-semibold text-gray-500 hover:underline text-xs">Cancelar</button>
                    </div>
                  ) : (
                    <>
                      <span className="text-gray-500 dark:text-gray-400">{item.calories} kcal</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingItemId(item.id);
                        }}
                        className="ml-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        aria-label={`Remover ${item.name}`}
                      >
                        <TrashIcon />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">Nenhum item adicionado ainda.</p>
        )}
      </div>
      <button 
        id={addFoodButtonId}
        onClick={onAddClick}
        className="mt-4 w-full bg-accent-green bg-opacity-10 text-accent-green dark:bg-opacity-20 p-2 rounded-md font-semibold flex items-center justify-center hover:bg-opacity-20 dark:hover:bg-opacity-30 transition"
      >
        <PlusIcon />
        <span className="ml-2">Adicionar Alimento</span>
      </button>
    </div>
  );
};

export default MealCard;
