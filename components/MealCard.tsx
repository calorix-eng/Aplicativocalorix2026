
import React, { useState } from 'react';
import { Food, MealCategory } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';

interface MealCardProps {
  mealCategory: MealCategory;
  mealItems: Food[];
  onAddClick: () => void;
  onDeleteFood: (foodId: string) => void;
  onEditFood: (food: Food) => void;
  addFoodButtonId?: string;
}

const MealCard: React.FC<MealCardProps> = ({ mealCategory, mealItems, onAddClick, onDeleteFood, onEditFood, addFoodButtonId }) => {
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const totalCalories = mealItems.reduce((sum, item) => sum + item.calories, 0);

  const sortedItems = [...mealItems].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  
  const handleConfirmDelete = () => {
    if (deletingItemId) {
      onDeleteFood(deletingItemId);
      setDeletingItemId(null);
    }
  };

  return (
    <div className="bg-light-card dark:bg-dark-card p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-black text-gray-900 dark:text-white">{mealCategory.name}</h3>
        <div className="text-right">
            <span className="text-accent-green font-black text-lg">{totalCalories}</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase block -mt-1">kcal</span>
        </div>
      </div>
      
      <div className="flex-grow space-y-3">
        {sortedItems.length > 0 ? (
          sortedItems.map(item => {
            const isDeleting = item.id === deletingItemId;
            return (
              <div key={item.id} className={`group flex justify-between items-center p-3 rounded-2xl transition-all duration-200 ${isDeleting ? 'bg-red-50 dark:bg-red-900/10 ring-2 ring-red-100' : 'bg-gray-50/50 dark:bg-gray-900/30 hover:bg-gray-100 dark:hover:bg-gray-800/60'}`}>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-bold text-gray-800 dark:text-gray-200 truncate pr-2 text-sm sm:text-base" title={item.name}>{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.calories} kcal</span>
                    {item.timestamp && (
                        <span className="text-[10px] text-gray-300 dark:text-gray-600 font-black uppercase">
                        • {new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1 ml-2">
                  {isDeleting ? (
                    <div className="flex items-center space-x-2 animate-fade-in">
                      <button onClick={handleConfirmDelete} className="bg-red-500 text-white p-2 rounded-xl text-[10px] font-black uppercase tracking-tighter">Excluir</button>
                      <button onClick={() => setDeletingItemId(null)} className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-2 rounded-xl text-[10px] font-black uppercase tracking-tighter">Não</button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => onEditFood(item)}
                        className="p-2.5 text-gray-400 hover:text-accent-blue transition-colors rounded-xl hover:bg-white dark:hover:bg-gray-800"
                        aria-label={`Editar ${item.name}`}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingItemId(item.id)}
                        className="p-2.5 text-gray-400 hover:text-red-500 transition-colors rounded-xl hover:bg-white dark:hover:bg-gray-800"
                        aria-label={`Remover ${item.name}`}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-8 opacity-40">
             <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center mb-2">
                <PlusIcon className="w-6 h-6 text-gray-400" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest">Nada registrado</p>
          </div>
        )}
      </div>
      
      <button 
        id={addFoodButtonId}
        onClick={onAddClick}
        className="mt-6 w-full bg-accent-green text-white p-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center hover:bg-green-600 transition shadow-lg shadow-green-500/10 active:scale-[0.98]"
      >
        <PlusIcon className="w-4 h-4 mr-2" />
        <span>Adicionar</span>
      </button>
    </div>
  );
};

export default MealCard;
