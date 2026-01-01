import React from 'react';
import { UserProfile, DailyLog, Reminder } from '../types';
import { XIcon } from './icons/XIcon';
// FIX: Changed to a named import as CalorieRing is a named export.
import { CalorieRing } from './CalorieRing';
import MacroDisplay from './MacroDisplay';
import { WaterDropIcon } from './icons/WaterDropIcon';
import { BellIcon } from './icons/BellIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface DataSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile: UserProfile;
    dailyLog: DailyLog;
}

const DataSidebar: React.FC<DataSidebarProps> = ({ isOpen, onClose, userProfile, dailyLog }) => {
    const totals = dailyLog.meals.reduce(
        (acc, meal) => {
            meal.items.forEach(item => {
                acc.calories += item.calories;
                acc.protein += item.protein;
                acc.carbs += item.carbs;
                acc.fat += item.fat;
            });
            return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return (
        <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>

            {/* Sidebar Panel */}
            <aside className={`absolute top-0 right-0 bottom-0 w-full max-w-sm bg-light-card dark:bg-dark-card shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold">Resumo Rápido</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <XIcon />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow p-6 overflow-y-auto space-y-6">
                    {/* Calories */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg flex flex-col items-center">
                        <h3 className="text-md font-semibold mb-2">Calorias de Hoje</h3>
                        <CalorieRing consumed={totals.calories} goal={userProfile.goals.calories} />
                    </div>

                    {/* Macros */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                        <h3 className="text-md font-semibold mb-3">Macronutrientes</h3>
                        <div className="space-y-3">
                            <MacroDisplay label="Proteína" consumed={totals.protein} goal={userProfile.goals.protein} color="bg-red-500" />
                            <MacroDisplay label="Carboidratos" consumed={totals.carbs} goal={userProfile.goals.carbs} color="bg-orange-500" />
                            <MacroDisplay label="Gordura" consumed={totals.fat} goal={userProfile.goals.fat} color="bg-yellow-500" />
                        </div>
                    </div>

                    {/* Water */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                         <div className="flex items-center mb-2">
                             <WaterDropIcon className="w-5 h-5 text-accent-blue mr-2" />
                             <h3 className="text-md font-semibold">Hidratação</h3>
                         </div>
                         <p className="text-2xl font-bold text-center">{dailyLog.waterIntake} <span className="text-lg text-gray-500">/ {userProfile.goals.water} ml</span></p>
                    </div>

                    {/* Reminders */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                        <div className="flex items-center mb-3">
                             <BellIcon className="w-5 h-5 text-accent-green mr-2" />
                             <h3 className="text-md font-semibold">Status dos Lembretes</h3>
                         </div>
                         <div className="space-y-2">
                            {userProfile.reminders?.map((reminder: Reminder) => (
                                <div key={reminder.id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                        {reminder.enabled ? (
                                            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                                        ) : (
                                            <XCircleIcon className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                                        )}
                                        <span>{reminder.label}</span>
                                    </div>
                                    <span className="font-mono text-gray-500 dark:text-gray-400">
                                        {reminder.time || `a cada ${reminder.interval}h`}
                                    </span>
                                </div>
                            ))}
                         </div>
                    </div>

                </div>
            </aside>
        </div>
    );
};

export default DataSidebar;