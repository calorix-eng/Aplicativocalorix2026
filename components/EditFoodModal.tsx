
import React, { useState } from 'react';
import { Food } from '../types';
import { XIcon } from './icons/XIcon';
import { BoltIcon } from './icons/BoltIcon';
import { LeafIcon } from './icons/LeafIcon';
import { OilIcon } from './icons/OilIcon';
import { FireIcon } from './icons/FireIcon';
import { motion } from 'framer-motion';

interface EditFoodModalProps {
    food: Food;
    mealName: string;
    onClose: () => void;
    onSave: (updatedFood: Food, mealName: string) => void;
}

const EditFoodModal: React.FC<EditFoodModalProps> = ({ food, mealName, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: food.name,
        calories: food.calories.toString(),
        protein: food.protein.toString(),
        carbs: food.carbs.toString(),
        fat: food.fat.toString(),
        servingSize: food.servingSize
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedFood: Food = {
            ...food,
            name: formData.name,
            calories: Number(formData.calories),
            protein: Number(formData.protein),
            carbs: Number(formData.carbs),
            fat: Number(formData.fat),
            servingSize: formData.servingSize
        };
        onSave(updatedFood, mealName);
    };

    const InputField = ({ label, name, value, type = "text", icon }: any) => (
        <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                {icon}
                {label}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={handleChange}
                className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-accent-blue rounded-2xl outline-none transition-all font-bold text-gray-800 dark:text-white"
            />
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                className="bg-white dark:bg-dark-card w-full max-w-lg rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Editar Alimento</h2>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{mealName}</p>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-400">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto scrollbar-hide">
                    <InputField label="Nome do Alimento" name="name" value={formData.name} />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Calorias (kcal)" name="calories" value={formData.calories} type="number" icon={<FireIcon className="w-3 h-3 text-orange-500"/>} />
                        <InputField label="Porção (Ex: 100g)" name="servingSize" value={formData.servingSize} />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <InputField label="Proteína (g)" name="protein" value={formData.protein} type="number" icon={<BoltIcon className="w-3 h-3 text-rose-500"/>} />
                        <InputField label="Carbs (g)" name="carbs" value={formData.carbs} type="number" icon={<LeafIcon className="w-3 h-3 text-amber-500"/>} />
                        <InputField label="Gordura (g)" name="fat" value={formData.fat} type="number" icon={<OilIcon className="w-3 h-3 text-blue-500"/>} />
                    </div>

                    <div className="pt-4 pb-8">
                        <button
                            type="submit"
                            className="w-full bg-accent-blue text-white p-6 rounded-[2rem] font-black text-lg hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                        >
                            SALVAR ALTERAÇÕES
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default EditFoodModal;
