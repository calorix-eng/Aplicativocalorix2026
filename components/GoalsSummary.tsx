
import React from 'react';
import { UserProfile } from '../types';
import { TargetIcon } from './icons/TargetIcon';
import { Card, CardHeader, CardTitle, CardContent } from './CalorieRing';

const GoalsSummary: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => {
    const { weight, height, targetWeight, goal } = userProfile;

    if (!weight || !height || height === 0) {
        return null;
    }

    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    const getBmiInfo = (bmiValue: number) => {
        if (bmiValue < 18.5) return { status: 'Abaixo do peso', textColor: 'text-yellow-500', bgColor: 'bg-yellow-500' };
        if (bmiValue < 25) return { status: 'Peso normal', textColor: 'text-green-500', bgColor: 'bg-green-500' };
        if (bmiValue < 30) return { status: 'Acima do peso', textColor: 'text-orange-500', bgColor: 'bg-orange-500' };
        return { status: 'Obesidade', textColor: 'text-red-500', bgColor: 'bg-red-500' };
    };

    const bmiInfo = getBmiInfo(bmi);

    const minIdealWeight = 18.5 * (heightInMeters * heightInMeters);
    const maxIdealWeight = 24.9 * (heightInMeters * heightInMeters);

    // Weight Progress Logic
    const target = targetWeight || weight;
    const difference = weight - target;
    const isLosing = goal === 'lose';
    const isGaining = goal === 'gain';
    
    // Simple progress percentage (visual only for this simulation)
    // In a real app we'd need 'startingWeight' to calculate actual % completion
    const weightDiffText = difference === 0 
        ? 'Meta atingida' 
        : difference > 0 
            ? `-${difference.toFixed(1)}kg para a meta`
            : `+${Math.abs(difference).toFixed(1)}kg para a meta`;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <TargetIcon className="w-5 h-5 text-accent-blue mr-3" />
                        Jornada do Peso
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Weight Status Header */}
                        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Peso Atual</p>
                                <p className="text-3xl font-bold text-light-text dark:text-dark-text">{weight} <span className="text-sm font-normal">kg</span></p>
                            </div>
                            <div className="text-center px-4 border-l border-gray-200 dark:border-gray-700">
                                {difference !== 0 ? (
                                    <div className={`flex flex-col items-center ${difference > 0 ? 'text-green-500' : 'text-accent-blue'}`}>
                                        <span className="text-xl font-bold">
                                            {difference > 0 ? `-${difference.toFixed(1)}` : `+${Math.abs(difference).toFixed(1)}`}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase">Restante</span>
                                        <div className={`mt-1 ${difference > 0 ? 'animate-bounce' : 'animate-pulse'}`}>
                                            {difference > 0 ? (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7-7-7" /></svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7 7 7" /></svg>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-green-500 font-bold">🎯 Meta OK</span>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase font-bold">Meta</p>
                                <p className="text-2xl font-bold text-accent-green">{target} <span className="text-sm font-normal">kg</span></p>
                            </div>
                        </div>

                        {/* BMI Visualization */}
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <h4 className="text-sm font-bold text-gray-600 dark:text-gray-400">Seu IMC: {bmi.toFixed(1)}</h4>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bmiInfo.bgColor} text-white`}>{bmiInfo.status}</span>
                            </div>
                            <div className="relative pt-4">
                                <div className="flex h-2.5 rounded-full overflow-hidden w-full bg-gray-200 dark:bg-gray-700">
                                    <div className="bg-yellow-500" style={{ width: '14%' }}></div>
                                    <div className="bg-green-500" style={{ width: '26%' }}></div>
                                    <div className="bg-orange-500" style={{ width: '20%' }}></div>
                                    <div className="bg-red-500" style={{ width: '40%' }}></div>
                                </div>
                                <div className="flex w-full text-[10px] text-gray-400 mt-1">
                                    <span style={{ width: '14%' }}>18.5</span>
                                    <span style={{ width: '26%' }}>25</span>
                                    <span style={{ width: '20%' }}>30</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-around items-center text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">Saudável para sua altura</p>
                                <p className="font-bold text-sm text-accent-blue">
                                    {minIdealWeight.toFixed(1)} - {maxIdealWeight.toFixed(1)} kg
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default GoalsSummary;
