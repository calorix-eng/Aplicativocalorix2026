import React, { useEffect, useMemo, useRef, useState } from 'react';
import { UserProfile, DailyLog } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { FireIcon } from './icons/FireIcon';
import { BoltIcon } from './icons/BoltIcon';
import { LeafIcon } from './icons/LeafIcon';
import { OilIcon } from './icons/OilIcon';
import { CalendarIcon } from './icons/CalendarIcon';


interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  dailyLogs: Record<string, Omit<DailyLog, 'micronutrientIntake'>>;
  userProfile: UserProfile;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange, dailyLogs, userProfile }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const selectedDateRef = useRef<HTMLButtonElement>(null);
    const [viewDate, setViewDate] = useState(new Date(selectedDate)); // Manages the month being displayed
    const [summaryRange, setSummaryRange] = useState<7 | 15 | 30>(7);

    // Sync viewDate with external selectedDate changes
    useEffect(() => {
        const newViewDate = new Date(selectedDate);
        if (newViewDate.getMonth() !== viewDate.getMonth() || newViewDate.getFullYear() !== viewDate.getFullYear()) {
            setViewDate(newViewDate);
        }
    }, [selectedDate]);

    // Automatically scroll to the selected date when the component updates
    useEffect(() => {
        // A short delay allows the DOM to update before scrolling
        const timer = setTimeout(() => {
            if (selectedDateRef.current) {
                selectedDateRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [selectedDate, viewDate]);
    
    const periodSummary = useMemo(() => {
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;
        let daysLogged = 0;

        for (let i = 0; i < summaryRange; i++) {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() - i);
            const dateString = d.toISOString().split('T')[0];
            const log = dailyLogs[dateString];

            if (log && log.meals.length > 0) {
                daysLogged++;
                log.meals.forEach(meal => {
                    meal.items.forEach(item => {
                        totalCalories += item.calories;
                        totalProtein += item.protein;
                        totalCarbs += item.carbs;
                        totalFat += item.fat;
                    });
                });
            }
        }
        
        const divisor = daysLogged || 1;
        return {
            avgCalories: Math.round(totalCalories / divisor),
            avgProtein: Math.round(totalProtein / divisor),
            avgCarbs: Math.round(totalCarbs / divisor),
            avgFat: Math.round(totalFat / divisor),
            daysLogged: daysLogged,
        };
    }, [dailyLogs, selectedDate, summaryRange]);


    const handlePrevMonth = () => {
        setViewDate(current => {
            const newDate = new Date(current);
            newDate.setDate(1); // Avoids issues with different month lengths
            newDate.setMonth(newDate.getMonth() - 1);
            return newDate;
        });
    };

    const handleNextMonth = () => {
        setViewDate(current => {
            const newDate = new Date(current);
            newDate.setDate(1); // Avoids issues with different month lengths
            newDate.setMonth(newDate.getMonth() + 1);
            return newDate;
        });
    };
    
    const handleGoToToday = () => {
        const today = new Date();
        setViewDate(today);
        onDateChange(today);
    }

    const daysInMonth = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const date = new Date(year, month, 1);
        const days = [];
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }, [viewDate]);


    const dailyTotals = useMemo(() => {
        const totals: Record<string, { calories: number }> = {};
        Object.keys(dailyLogs).forEach(dateStr => {
            const log = dailyLogs[dateStr];
            if (log) {
                const totalCalories = log.meals.reduce((sum, meal) => sum + meal.items.reduce((s, item) => s + item.calories, 0), 0);
                if (totalCalories > 0 || log.waterIntake > 0) {
                    totals[dateStr] = { calories: totalCalories };
                }
            }
        });
        return totals;
    }, [dailyLogs]);

    const getStatusColor = (calories: number, goal: number): string => {
        if (calories <= 0) return 'bg-gray-300 dark:bg-gray-600';
        const percentage = (calories / goal) * 100;
        if (percentage >= 90 && percentage <= 110) return 'bg-green-500';
        if (percentage > 110) return 'bg-orange-500';
        return 'bg-blue-500';
    };
    
    const SummaryButton: React.FC<{ range: 7 | 15 | 30 }> = ({ range }) => (
        <button
            onClick={() => setSummaryRange(range)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition ${summaryRange === range ? 'bg-accent-green text-white' : 'bg-gray-200 dark:bg-gray-700 text-light-text dark:text-dark-text hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
            {range} dias
        </button>
    );

    return (
        <div className="bg-light-card dark:bg-dark-card p-4 rounded-xl shadow-lg w-full space-y-4">
           <div>
                <div className="flex items-center justify-between mb-3">
                     <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Mês anterior">
                         <ChevronLeftIcon />
                     </button>
                     <div className="flex items-center space-x-4">
                        <h2 className="text-lg font-bold capitalize text-center">
                            {viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </h2>
                         <button onClick={handleGoToToday} className="px-3 py-1 text-xs font-semibold bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition">
                            Hoje
                        </button>
                     </div>
                     <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Próximo mês">
                         <ChevronRightIcon />
                     </button>
                </div>
                <div className="relative">
                    <div ref={scrollContainerRef} className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                        {daysInMonth.map((date, index) => {
                            const dateString = date.toISOString().split('T')[0];
                            const selectedDateString = selectedDate.toISOString().split('T')[0];
                            const isSelected = dateString === selectedDateString;
                            const logData = dailyTotals[dateString];

                            return (
                                <button
                                    key={index}
                                    ref={isSelected ? selectedDateRef : null}
                                    onClick={() => onDateChange(date)}
                                    className={`flex flex-col items-center justify-center w-14 h-20 rounded-lg flex-shrink-0 transition-colors duration-200 border-2 ${isSelected ? 'bg-accent-green/10 border-accent-green' : 'bg-gray-50 dark:bg-gray-700/50 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    <span className={`text-xs font-semibold ${isSelected ? 'text-accent-green' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)}
                                    </span>
                                    <span className={`text-lg font-bold mt-1 ${isSelected ? 'text-accent-green' : 'text-light-text dark:text-dark-text'}`}>
                                        {date.getDate()}
                                    </span>
                                    {logData && (
                                        <div className={`w-2 h-2 rounded-full mt-1 ${getStatusColor(logData.calories, userProfile.goals.calories)}`}></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
           </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                    <h3 className="text-lg font-bold">Resumo do Período</h3>
                    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-dark-bg p-1 rounded-full self-start sm:self-center">
                        <SummaryButton range={7} />
                        <SummaryButton range={15} />
                        <SummaryButton range={30} />
                    </div>
                </div>
                
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="md:col-span-1 text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <CalendarIcon className="h-6 w-6 text-gray-500 mx-auto mb-1" />
                      <p className="font-bold text-lg">{periodSummary.daysLogged} <span className="text-sm font-normal">dias</span></p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Registrados</p>
                    </div>
                     <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <FireIcon className="h-6 w-6 text-orange-500 mx-auto mb-1" />
                      <p className="font-bold text-lg">{periodSummary.avgCalories} <span className="text-sm font-normal">kcal</span></p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Média Diária</p>
                    </div>
                     <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <BoltIcon className="h-6 w-6 text-red-500 mx-auto mb-1" />
                      <p className="font-bold text-lg">{periodSummary.avgProtein} <span className="text-sm font-normal">g</span></p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Proteína</p>
                    </div>
                     <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <LeafIcon className="h-6 w-6 text-green-500 mx-auto mb-1" />
                      <p className="font-bold text-lg">{periodSummary.avgCarbs} <span className="text-sm font-normal">g</span></p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Carbs</p>
                    </div>
                     <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <OilIcon className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
                      <p className="font-bold text-lg">{periodSummary.avgFat} <span className="text-sm font-normal">g</span></p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Gordura</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Calendar;