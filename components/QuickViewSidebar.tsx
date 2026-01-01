import React from 'react';
import { UserProfile, DailyLog, Reminder } from '../types';
import { XIcon } from './icons/XIcon';
// FIX: Changed to a named import as CalorieRing is a named export.
import { CalorieRing } from './CalorieRing';
import { WaterDropIcon } from './icons/WaterDropIcon';
import { BellIcon } from './icons/BellIcon';
import { FireIcon } from './icons/FireIcon';
import { BoltIcon } from './icons/BoltIcon';
import { LeafIcon } from './icons/LeafIcon';
import { OilIcon } from './icons/OilIcon';

interface QuickViewSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile: UserProfile;
    dailyLog: DailyLog;
}

const QuickViewSidebar: React.FC<QuickViewSidebarProps> = ({ isOpen, onClose, userProfile, dailyLog }) => {
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
    
    const activeReminders = userProfile.reminders?.filter(r => r.enabled);

    return (
        <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>

            {/* Sidebar Panel */}
            <aside className={`absolute top-0 right-0 bottom-0 w-full max-w-sm bg-light-card dark:bg-dark-card shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold">Painel Rápido</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <XIcon />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow p-6 overflow-y-auto space-y-6">
                    {/* Calories */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg flex flex-col items-center">
                        <div className="flex items-center self-start mb-2">
                             <FireIcon className="w-5 h-5 text-orange-500 mr-2" />
                             <h3 className="text-md font-semibold">Calorias de Hoje</h3>
                        </div>
                        <CalorieRing consumed={totals.calories} goal={userProfile.goals.calories} />
                    </div>

                    {/* Macros & Water */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                            <BoltIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-lg">{Math.round(totals.protein)}<span className="text-sm">g</span></p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Proteína</p>
                            </div>
                        </div>
                         <div className="flex items-center space-x-3">
                            <LeafIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-lg">{Math.round(totals.carbs)}<span className="text-sm">g</span></p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Carbs</p>
                            </div>
                        </div>
                         <div className="flex items-center space-x-3">
                            <OilIcon className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-lg">{Math.round(totals.fat)}<span className="text-sm">g</span></p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Gordura</p>
                            </div>
                        </div>
                         <div className="flex items-center space-x-3">
                            <WaterDropIcon className="w-6 h-6 text-accent-blue flex-shrink-0" />
                            <div>
                                <p className="font-bold text-lg">{dailyLog.waterIntake}<span className="text-sm">ml</span></p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Água</p>
                            </div>
                        </div>
                    </div>

                    {/* Reminders */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                        <div className="flex items-center mb-3">
                             <BellIcon className="w-5 h-5 text-accent-green mr-2" />
                             <h3 className="text-md font-semibold">Lembretes Ativos</h3>
                         </div>
                         <div className="space-y-2">
                            {activeReminders && activeReminders.length > 0 ? (
                                activeReminders.map((reminder: Reminder) => (
                                    <div key={reminder.id} className="flex items-center justify-between text-sm">
                                        <span>{reminder.label}</span>
                                        <span className="font-mono text-gray-500 dark:text-gray-400">
                                            {reminder.time || `a cada ${reminder.interval}h`}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-center text-gray-400 py-2">Nenhum lembrete ativo.</p>
                            )}
                         </div>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default QuickViewSidebar;