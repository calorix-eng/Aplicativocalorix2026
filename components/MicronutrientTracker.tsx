
import React from 'react';
import { UserProfile, DailyLog, Micronutrient } from '../types';
import { AlertIcon } from './icons/AlertIcon';
import { Card, CardHeader, CardTitle, CardContent } from './CalorieRing';

interface MicronutrientTrackerProps {
    userProfile: UserProfile;
    dailyLog: DailyLog;
}

const DonutChart: React.FC<{ percentage: number }> = ({ percentage }) => {
    const radius = 50;
    const stroke = 10;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="-rotate-90"
            >
                <circle
                    stroke="currentColor"
                    className="text-gray-100 dark:text-gray-800"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke="currentColor"
                    className="text-accent-blue/70"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-gray-800 dark:text-white">{`${Math.round(percentage)}%`}</span>
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Meta</span>
            </div>
        </div>
    );
};

const MicronutrientTracker: React.FC<MicronutrientTrackerProps> = ({ userProfile, dailyLog }) => {
    
    const goals = userProfile.goals.micronutrients || {};
    const intake = dailyLog.micronutrientIntake || {};

    const overallProgress = (Object.keys(goals) as Micronutrient[]).reduce((acc, microKey) => {
        const goalAmount = goals[microKey]?.amount ?? 0;
        const intakeAmount = intake[microKey] ?? 0;
        if (goalAmount > 0) {
            acc.totalPercentage += Math.min((intakeAmount / goalAmount) * 100, 100);
            acc.count++;
        }
        return acc;
    }, { totalPercentage: 0, count: 0 });

    const averagePercentage = overallProgress.count > 0 ? overallProgress.totalPercentage / overallProgress.count : 0;
    
    const getStatus = (percentage: number): 'low' | 'good' | 'high' => {
        if (percentage < 50) return 'low';
        if (percentage > 120) return 'high';
        return 'good';
    }

    return (
        <Card className="border-none shadow-none sm:border-solid sm:shadow-sm">
            <CardHeader className="px-0 sm:px-6">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                    <div className="w-2 h-6 bg-accent-blue rounded-full"></div>
                    Vitaminas & Minerais
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 flex flex-col items-center justify-center p-6 rounded-[2rem] bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Média de Ingestão</h3>
                        <DonutChart percentage={averagePercentage} />
                    </div>
                    
                    <div className="md:col-span-2 space-y-5">
                        {(Object.keys(goals) as Micronutrient[]).map((micronutrientKey) => {
                            const goal = goals[micronutrientKey];
                            if (!goal) return null;

                            const intakeAmount = intake[micronutrientKey] || 0;
                            const percentage = goal.amount > 0 ? (intakeAmount / goal.amount) * 100 : 0;
                            const status = getStatus(percentage);
                            
                            // Cores Suaves mas com destaque
                            const progressBarColor = status === 'good' 
                                ? 'bg-emerald-400' // Verde suave
                                : status === 'high' 
                                    ? 'bg-amber-300' // Amarelo suave
                                    : 'bg-rose-400'; // Vermelho suave/coral

                            return (
                                <div key={micronutrientKey} className="group">
                                    <div className="flex justify-between items-end mb-1.5 px-1">
                                        <div className="flex items-center">
                                            <div className={`w-2 h-2 rounded-full ${progressBarColor} mr-2 shadow-sm`}></div>
                                            <span className="font-bold text-sm text-gray-700 dark:text-gray-200">{micronutrientKey}</span>
                                        </div>
                                        <span className="text-[11px] font-black text-gray-400 uppercase">
                                            {Math.round(intakeAmount)} <span className="font-normal">/ {goal.amount}{goal.unit}</span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden border border-gray-200/20 dark:border-white/5">
                                        <div
                                            className={`${progressBarColor} h-full rounded-full transition-all duration-1000 ease-out shadow-inner`}
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default MicronutrientTracker;
