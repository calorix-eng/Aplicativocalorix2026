
import React, { useState, useEffect } from 'react';
import { UserProfile, Food, MealCategory, Recipe as AiRecipe } from '../types';
import { XIcon } from './icons/XIcon';
import { FireIcon } from './icons/FireIcon';
import { ClockIcon } from './icons/ClockIcon';
import AddRecipeModal from './AddRecipeModal';
import { PlusIcon } from './icons/PlusIcon';
import { BoltIcon } from './icons/BoltIcon';
import { LeafIcon } from './icons/LeafIcon';
import { OilIcon } from './icons/OilIcon';
import { generateAiImage } from '../services/geminiService';
import { BookOpenIcon } from './icons/BookOpenIcon';

export interface DisplayRecipe extends AiRecipe {
    imageUrl?: string;
}

interface RecipeDetailModalProps {
    recipe: AiRecipe;
    onClose: () => void;
    onAddRecipeToLog: (foods: Food[], mealName: string) => void;
    userProfile: UserProfile;
}

const RecipeDetailImage: React.FC<{ recipe: AiRecipe }> = ({ recipe }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchImage = async () => {
            setIsLoading(true);
            try {
                // Chama a função de serviço que agora usa o backend proxy
                const url = await generateAiImage(recipe.imagePrompt || recipe.name, 'food');
                setImageUrl(url);
            } catch (err) {
                console.error("Erro ao gerar imagem detalhe da receita:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchImage();
    }, [recipe.imagePrompt, recipe.name]);

    return (
        <div className="w-full h-56 relative overflow-hidden bg-gray-100 dark:bg-gray-800">
            {isLoading ? (
                <div className="w-full h-full flex items-center justify-center animate-pulse">
                    <BookOpenIcon className="w-12 h-12 text-gray-300" />
                </div>
            ) : imageUrl ? (
                <img src={imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <BookOpenIcon className="w-12 h-12 text-gray-400" />
                </div>
            )}
        </div>
    );
};

const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ recipe, onClose, onAddRecipeToLog, userProfile }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    const handleAdd = (mealName: string) => {
        onAddRecipeToLog(recipe.ingredients, mealName);
        setIsAddModalOpen(false);
        onClose(); // Close the detail modal after adding
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="relative">
                        <RecipeDetailImage recipe={recipe} />
                        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/75 transition-colors">
                            <XIcon />
                        </button>
                    </div>

                    <div className="p-6 flex-grow overflow-y-auto">
                        <span className="px-2 py-1 text-xs font-semibold text-white bg-accent-green rounded-full">{recipe.category}</span>
                        <h2 className="text-2xl font-bold font-display text-gray-800 dark:text-white mt-2">{recipe.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{recipe.description}</p>
                        
                        <div className="flex items-center text-md text-gray-500 dark:text-gray-400 mt-4 space-x-6">
                            <div className="flex items-center">
                                <ClockIcon className="w-5 h-5 mr-1.5 text-blue-500" />
                                <span>{recipe.timeInMinutes} min</span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-center">
                            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <FireIcon className="h-5 w-5 text-orange-500 mx-auto" />
                                <p className="font-bold text-sm">{recipe.totalCalories} kcal</p>
                            </div>
                            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <BoltIcon className="h-5 w-5 text-red-500 mx-auto" />
                                <p className="font-bold text-sm">{recipe.totalProtein}g P</p>
                            </div>
                            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <LeafIcon className="h-5 w-5 text-green-500 mx-auto" />
                                <p className="font-bold text-sm">{recipe.totalCarbs}g C</p>
                            </div>
                            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <OilIcon className="h-5 w-5 text-yellow-500 mx-auto" />
                                <p className="font-bold text-sm">{recipe.totalFat}g F</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-6">
                            <div>
                                <h3 className="font-bold text-lg mb-2">Ingredientes</h3>
                                <ul className="space-y-2 text-sm">
                                    {recipe.ingredients.map(ing => (
                                        <li key={ing.id} className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                            <span>{ing.name} <span className="text-gray-500">({ing.servingSize})</span></span>
                                            <span className="font-semibold text-gray-600 dark:text-gray-300">{ing.calories} kcal</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2">Modo de Preparo</h3>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    {recipe.instructions.map((step, index) => (
                                        <li key={index}>{step}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </div>
                     <div className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="w-full bg-accent-green text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center space-x-2"
                        >
                            <PlusIcon />
                            <span>Adicionar à Refeição</span>
                        </button>
                    </div>
                </div>
            </div>
            {isAddModalOpen && (
                <AddRecipeModal 
                    onClose={() => setIsAddModalOpen(false)}
                    onAdd={handleAdd}
                    mealCategories={userProfile.mealCategories}
                />
            )}
        </>
    );
};

export default RecipeDetailModal;
