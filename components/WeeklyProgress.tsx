import React, { useState } from 'react';
import { UserProfile, DailyLog } from '../types';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { Card, CardHeader, CardTitle, CardContent } from './CalorieRing';

interface PerformanceChartProps {
  dailyLogs: Record<string, Omit<DailyLog, 'micronutrientIntake'>>;
  userProfile: UserProfile;
  selectedDate: Date;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ dailyLogs, userProfile, selectedDate }) => {
    const [timeRange, setTimeRange] = useState<7 | 15 | 30>(7);

    const chartData = Array.from({ length: timeRange }).map((_, i) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - (timeRange - 1 - i));
        const dateString = d.toISOString().split('T')[0];
        const dayLog = dailyLogs[dateString];

        const totalCalories = dayLog
            ? dayLog.meals.reduce((sum, meal) => sum + meal.items.reduce((s, item) => s + item.calories, 0), 0)
            : 0;

        const dayLabel = timeRange === 7 
            ? d.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)
            : d.getDate().toString();

        return {
            date: d,
            day: dayLabel,
            calories: totalCalories,
        };
    });

    const calorieGoal = userProfile.goals.calories;
    const maxCalorie = Math.max(calorieGoal, ...chartData.map(d => d.calories)) * 1.1;

    const getBarColor = (calories: number, goal: number): string => {
        if (calories === 0) return 'bg-gray-200 dark:bg-gray-700';
        const percentageOfGoal = goal > 0 ? (calories / goal) * 100 : 0;
        if (percentageOfGoal >= 90 && percentageOfGoal <= 110) return 'bg-accent-green';
        if (percentageOfGoal > 110) return 'bg-orange-500';
        return 'bg-accent-blue';
    };

    const TimeRangeButton: React.FC<{ range: 7 | 15 | 30 }> = ({ range }) => (
        <button
            onClick={() => setTimeRange(range)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition ${timeRange === range ? 'bg-accent-green text-white' : 'bg-gray-200 dark:bg-gray-700 text-light-text dark:text-dark-text hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
            {range} dias
        </button>
    );

    return (
        <Card>
            <CardHeader className="flex-col sm:flex-row justify-between sm:items-center gap-4">
                 <CardTitle className="flex items-center">
                    <ChartBarIcon className="w-5 h-5 text-accent-green mr-3" />
                    Desempenho Calórico
                </CardTitle>
                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-dark-bg p-1 rounded-full">
                    <TimeRangeButton range={7} />
                    <TimeRangeButton range={15} />
                    <TimeRangeButton range={30} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-end h-64 space-x-1 relative border-l border-b border-gray-200 dark:border-gray-600 pl-4 pb-1">
                    <div 
                        className="absolute w-[calc(100%-1rem)] left-4 border-t-2 border-dashed border-gray-300 dark:border-gray-500"
                        style={{ bottom: `${calorieGoal > maxCalorie ? 99 : (calorieGoal / maxCalorie) * 100}%` }}
                    >
                        <span className="absolute -right-1 -top-3 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-light-card dark:bg-dark-card px-1">{calorieGoal} kcal</span>
                    </div>

                    {chartData.map(dayData => {
                        const barHeightPercent = maxCalorie > 0 ? (dayData.calories / maxCalorie) * 100 : 0;
                        const barColor = getBarColor(dayData.calories, calorieGoal);
                        const difference = dayData.calories - calorieGoal;
                        const differenceText = difference > 0 ? `+${Math.round(difference)}` : `${Math.round(difference)}`;
                        
                        return (
                            <div key={dayData.date.toISOString()} className="flex flex-col items-center flex-1 h-full justify-end group pt-6">
                                <div className="absolute -top-0 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                    <p className="font-bold">{dayData.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                                    <p>{Math.round(dayData.calories)} kcal</p>
                                    <p className={`${difference > 10 ? 'text-orange-300' : difference < -10 ? 'text-blue-300' : 'text-green-300'}`}>({differenceText} da meta)</p>
                                </div>
                                <div className={`w-full rounded-t ${barColor} transition-all duration-500 ease-out`} style={{ height: `${barHeightPercent}%` }}></div>
                                <span className="text-xs mt-2 font-semibold text-gray-500 dark:text-gray-400">{dayData.day}</span>
                            </div>
                        );
                    })}
                </div>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-accent-blue mr-2"></div><span>Abaixo da meta</span></div>
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-accent-green mr-2"></div><span>Meta atingida</span></div>
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div><span>Acima da meta</span></div>
                </div>
            </CardContent>
        </Card>
    );
};

export default PerformanceChart;
