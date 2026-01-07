
import React, { useState } from 'react';
import { Food, Micronutrient } from '../types';
import { LibraryFood } from '../utils/brazilianFoodData';
import { XIcon } from './icons/XIcon';
import { FireIcon } from './icons/FireIcon';
import { BoltIcon } from './icons/BoltIcon';
import { LeafIcon } from './icons/LeafIcon';
import { OilIcon } from './icons/OilIcon';
import { motion } from 'framer-motion';

interface EditLibraryFoodModalProps {
    food?: LibraryFood;
    categories: string[];
    onClose: () => void;
    onSave: (food: LibraryFood) => void;
}

const EditLibraryFoodModal: React.FC<EditLibraryFoodModalProps> = ({ food, categories, onClose, onSave }) => {
    const isEditing = !!food;
    
    const [formData, setFormData] = useState({
        name: food?.name || '',
        category: food?.category || categories[0] || 'Geral',
        calories: food?.calories.toString() || '',
        protein: food?.protein.toString() || '',
        carbs: food?.carbs.toString() || '',
        fat: food?.fat.toString() || '',
        servingSize: food?.servingSize || '100g',
    });

    const [micros, setMicros] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        if (food?.micronutrients) {
            Object.entries(food.micronutrients).forEach(([key, val]) => {
                initial[key] = val?.toString() || '';
            });
        }
        return initial;
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMicroChange = (name: string, val: string) => {
        setMicros({ ...micros, [name]: val });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const micronutrients: any = {};
        Object.entries(micros).forEach(([key, val]) => {
            if (val) micronutrients[key] = Number(val);
        });

        const newFood: LibraryFood = {
            id: food?.id || crypto.randomUUID(),
            name: formData.name,
            category: formData.category,
            calories: Number(formData.calories),
            protein: Number(formData.protein),
            carbs: Number(formData.carbs),
            fat: Number(formData.fat),
            servingSize: formData.servingSize,
            micronutrients: Object.keys(micronutrients).length > 0 ? micronutrients : undefined,
        };
        onSave(newFood);
    };

    const InputField = ({ label, name, value, type = "text", icon, placeholder }: any) => (
        <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                {icon}
                {label}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                placeholder={placeholder}
                onChange={handleChange}
                required
                className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-accent-blue rounded-2xl outline-none transition-all font-bold text-gray-800 dark:text-white"
            />
        </div>
    );

    const availableMicros: Micronutrient[] = ['Vitamina C', 'Cálcio', 'Ferro', 'Vitamina D', 'Vitamina A', 'Potássio', 'Magnésio'];

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                className="bg-white dark:bg-dark-card w-full max-w-lg rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95dvh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">{isEditing ? 'Editar Alimento' : 'Novo Alimento'}</h2>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Definições da Biblioteca</p>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-400">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto scrollbar-hide">
                    <InputField label="Nome do Alimento" name="name" value={formData.name} placeholder="Ex: Tapioca com Queijo" />
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Categoria</label>
                        <select 
                            name="category" 
                            value={formData.category} 
                            onChange={handleChange}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-accent-blue rounded-2xl outline-none font-bold"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            <option value="Outros">Outros</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Calorias (kcal)" name="calories" value={formData.calories} type="number" icon={<FireIcon className="w-3 h-3 text-orange-500"/>} />
                        <InputField label="Porção Padrão" name="servingSize" value={formData.servingSize} placeholder="Ex: 100g" />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <InputField label="Proteína (g)" name="protein" value={formData.protein} type="number" icon={<BoltIcon className="w-3 h-3 text-rose-500"/>} />
                        <InputField label="Carbs (g)" name="carbs" value={formData.carbs} type="number" icon={<LeafIcon className="w-3 h-3 text-amber-500"/>} />
                        <InputField label="Gordura (g)" name="fat" value={formData.fat} type="number" icon={<OilIcon className="w-3 h-3 text-blue-500"/>} />
                    </div>

                    <div className="pt-4 border-t dark:border-gray-800">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Vitaminas e Minerais (Opcional)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {availableMicros.map(m => (
                                <div key={m} className="space-y-1">
                                    <label className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">{m}</label>
                                    <input
                                        type="number"
                                        value={micros[m] || ''}
                                        onChange={(e) => handleMicroChange(m, e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl font-bold text-sm"
                                        placeholder="Valor"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 pb-8">
                        <button
                            type="submit"
                            className="w-full bg-accent-blue text-white p-6 rounded-[2rem] font-black text-lg hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                        >
                            {isEditing ? 'SALVAR ALTERAÇÕES' : 'ADICIONAR AO LIVRO'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default EditLibraryFoodModal;
