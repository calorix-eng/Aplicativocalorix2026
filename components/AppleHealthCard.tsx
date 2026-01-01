import React from 'react';
import { AppleHealthIcon } from './icons/AppleHealthIcon';
import { StepsIcon } from './icons/StepsIcon';
import { DumbbellIcon } from './icons/DumbbellIcon';
import { Card, CardHeader, CardTitle, CardContent } from './CalorieRing';

const AppleHealthCard: React.FC = () => {
    // Mock data for demonstration
    const steps = 7543;
    const stepGoal = 10000;
    const stepPercentage = Math.min(100, (steps / stepGoal) * 100);

    const workouts = [
        { name: 'Corrida', duration: '32 min' },
        { name: 'Musculação', duration: '55 min' },
    ];

    return (
        <Card className="animate-fade-in-up">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <AppleHealthIcon className="w-5 h-5 mr-3" />
                    Resumo do Apple Health
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold flex items-center text-sm">
                                <StepsIcon className="w-5 h-5 mr-2 text-gray-500" /> 
                                Passos
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{steps.toLocaleString('pt-BR')} / {stepGoal.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                            <div
                                className="bg-red-500 h-4 rounded-full transition-all duration-500"
                                style={{ width: `${stepPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold flex items-center mb-2 text-sm">
                            <DumbbellIcon className="w-5 h-5 mr-2 text-gray-500"/>
                            Treinos Sincronizados
                        </h3>
                        {workouts.length > 0 ? (
                            <ul className="space-y-2">
                                {workouts.map((workout, index) => (
                                    <li key={index} className="flex justify-between items-center text-sm p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                                        <span>{workout.name}</span>
                                        <span className="font-semibold">{workout.duration}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-center text-gray-400 p-4">Nenhum treino sincronizado hoje.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AppleHealthCard;
