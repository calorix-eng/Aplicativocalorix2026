
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
                    className="text-gray-200 dark:text-gray-700"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke="currentColor"
                    className="text-accent-blue"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{`${Math.round(percentage)}%`}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Meta</span>
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
        <Card>
            <CardHeader>
                <CardTitle>Vitaminas & Minerais</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                        <h3 className="text-lg font-semibold mb-2">Progresso Geral</h3>
                        <DonutChart percentage={averagePercentage} />
                    </div>
                    <div className="md:col-span-2 space-y-3 max-h-72 overflow-y-auto pr-2">
                        {(Object.keys(goals) as Micronutrient[]).map((micronutrientKey) => {
                            const goal = goals[micronutrientKey];
                            if (!goal) return null;

                            const intakeAmount = intake[micronutrientKey] || 0;
                            const percentage = goal.amount > 0 ? (intakeAmount / goal.amount) * 100 : 0;
                            const status = getStatus(percentage);
                            const progressBarColor = status === 'good' ? 'bg-green-500' : status === 'high' ? 'bg-orange-500' : 'bg-red-500';

                            return (
                                <div key={micronutrientKey}>
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center">
                                            <AlertIcon status={status} />
                                            <span className="font-semibold text-sm ml-2">{micronutrientKey}</span>
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {Math.round(intakeAmount)} / {goal.amount} {goal.unit}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className={`${progressBarColor} h-2 rounded-full transition-all duration-500`}
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
