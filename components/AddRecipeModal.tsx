import React from 'react';
import { MealCategory } from '../types';
import { XIcon } from './icons/XIcon';

interface AddRecipeModalProps {
  onClose: () => void;
  onAdd: (mealName: string) => void;
  mealCategories: MealCategory[];
}

const AddRecipeModal: React.FC<AddRecipeModalProps> = ({ onClose, onAdd, mealCategories }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold">Adicionar em...</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                    <XIcon />
                </button>
            </div>
            <div className="p-6 space-y-3 max-h-80 overflow-y-auto">
                {mealCategories.map(category => (
                    <button
                        key={category.id}
                        onClick={() => onAdd(category.name)}
                        className="w-full text-left p-3 rounded-lg font-semibold transition bg-gray-100 dark:bg-gray-700 hover:bg-accent-green hover:text-white dark:hover:bg-accent-green"
                    >
                        {category.name}
                    </button>
                ))}
            </div>
        </div>
    </div>
  )
}

export default AddRecipeModal;
