import React from 'react';
import { UserProfile } from '../types';
import { TargetIcon } from './icons/TargetIcon';
import { Card, CardHeader, CardTitle, CardContent } from './CalorieRing';

const GoalsSummary: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => {
    const { weight, height } = userProfile;

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

    const minBmiScale = 15;
    const maxBmiScale = 40;
    const markerPositionPercent = Math.max(0, Math.min(100, ((bmi - minBmiScale) / (maxBmiScale - minBmiScale)) * 100));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <TargetIcon className="w-5 h-5 text-accent-blue mr-3" />
                    Metas de Peso
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Visual BMI Chart */}
                    <div className="relative pt-8">
                        {/* The colored scale bar */}
                        <div className="flex h-3 rounded-full overflow-hidden w-full">
                            <div className="bg-yellow-500" style={{ width: '14%' }} title="Abaixo do peso (< 18.5)"></div>
                            <div className="bg-green-500" style={{ width: '26%' }} title="Peso normal (18.5 - 24.9)"></div>
                            <div className="bg-orange-500" style={{ width: '20%' }} title="Acima do peso (25 - 29.9)"></div>
                            <div className="bg-red-500" style={{ width: '40%' }} title="Obesidade (>= 30)"></div>
                        </div>
                        {/* Scale labels */}
                        <div className="flex w-full text-xs text-gray-400 mt-1">
                            <span style={{ width: '14%' }}>18.5</span>
                            <span style={{ width: '26%' }}>25</span>
                            <span style={{ width: '20%' }}>30</span>
                        </div>

                        {/* Marker for user's BMI */}
                        <div className="absolute top-0 h-full w-full" style={{ left: `calc(${markerPositionPercent}% - 16px)` /* Offset to center the marker */ }}>
                            <div className="relative flex flex-col items-center w-8">
                                <div className={`px-2 py-1 text-xs font-bold text-white rounded-md ${bmiInfo.bgColor} whitespace-nowrap`}>
                                    {bmi.toFixed(1)}
                                </div>
                                <div className={`w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-[6px] ${bmiInfo.bgColor}`}></div>
                            </div>
                        </div>
                    </div>

                    {/* Text summary below the chart */}
                    <div className="flex justify-around items-center text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Seu Status</p>
                            <p className={`font-bold text-lg ${bmiInfo.textColor}`}>{bmiInfo.status}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Peso Ideal Estimado</p>
                            <p className="font-bold text-lg text-accent-blue">
                                {minIdealWeight.toFixed(1)} - {maxIdealWeight.toFixed(1)} kg
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default GoalsSummary;
