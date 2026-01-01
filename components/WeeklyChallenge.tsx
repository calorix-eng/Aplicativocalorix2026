import React from 'react';
import { Challenge, UserChallengeProgress } from '../types';
import { TrophyIcon } from './icons/TrophyIcon';
import { MedalIcon } from './icons/MedalIcon';
import { Card, CardHeader, CardTitle, CardContent } from './CalorieRing';

interface WeeklyChallengeProps {
    challenge: Challenge;
    progress: UserChallengeProgress;
}

const WeeklyChallenge: React.FC<WeeklyChallengeProps> = ({ challenge, progress }) => {
    const progressCount = progress.progress.filter(p => p).length;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <TrophyIcon className="w-5 h-5 text-yellow-500 mr-3" />
                    Desafio da Semana
                </CardTitle>
            </CardHeader>
            <CardContent>
                {progress.completed ? (
                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-100 via-white to-yellow-100 dark:from-gray-900 dark:via-dark-card dark:to-gray-800 transition-all duration-500">
                        <MedalIcon className="w-24 h-24 text-yellow-400 mx-auto mb-4 drop-shadow-xl" />
                        <h3 className="text-2xl font-bold font-display text-green-600 dark:text-green-400">Parabéns!</h3>
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-2">Você concluiu o desafio "{challenge.title}"!</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Uma nova medalha brilha na sua galeria de Conquistas.</p>
                    </div>
                ) : (
                    <div>
                        <h3 className="font-bold text-md text-gray-800 dark:text-white">{challenge.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">{challenge.description}</p>
                        
                        <div className="flex justify-between items-center">
                            <div className="flex space-x-2">
                                {progress.progress.map((isDayComplete, index) => (
                                    <div
                                        key={index}
                                        className={`w-6 h-6 rounded-full transition-colors duration-300 ${isDayComplete ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}`}
                                        title={`Dia ${index + 1}: ${isDayComplete ? 'Completo' : 'Pendente'}`}
                                    ></div>
                                ))}
                            </div>
                            <div className="font-semibold text-gray-700 dark:text-gray-300">
                                {progressCount} / {challenge.durationDays} dias
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default WeeklyChallenge;
