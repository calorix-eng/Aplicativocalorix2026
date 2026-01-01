



import React, { useState, useEffect } from 'react';
import { getMotivationalMessage } from '../services/geminiService';
import { XIcon } from './icons/XIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { UserProfile } from '../types';

interface MotivationalCoachProps {
    userProfile: UserProfile;
    onDismiss: () => void;
}

const MotivationalCoach: React.FC<MotivationalCoachProps> = ({ userProfile, onDismiss }) => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const coach = userProfile.coach || { id: 'leo', name: 'Leo', avatar: 'https://images.pexels.com/photos/2220337/pexels-photo-2220337.jpeg?auto=compress&cs=tinysrgb&w=400' };

    const fetchMessage = async () => {
        setIsLoading(true);
        try {
            const msg = await getMotivationalMessage(userProfile.name, coach);
            setMessage(msg);
        } catch (error) {
            setMessage('Lembre-se: cada passo, por menor que seja, é um progresso. Você consegue!');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessage();
    }, [userProfile.name, coach.id, coach.name]);

    return (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-lg animate-fade-in-up mb-6 border border-blue-100 dark:border-gray-700 relative">
            <button
                onClick={onDismiss}
                className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full transition-colors"
                aria-label="Dispensar coach"
            >
                <XIcon />
            </button>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <img
                    src={coach.avatar}
                    alt={`Avatar do coach ${coach.name}`}
                    className="w-24 h-24 rounded-full flex-shrink-0 border-4 border-white dark:border-gray-700 shadow-md object-cover"
                />
                <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Uma mensagem de {coach.name} para você!</h3>
                    {isLoading ? (
                         <p className="mt-2 text-gray-500 dark:text-gray-400 italic">Digitando...</p>
                    ) : (
                        <p className="mt-2 text-gray-600 dark:text-gray-300">"{message}"</p>
                    )}
                    <button
                        onClick={fetchMessage}
                        disabled={isLoading}
                        className="mt-4 inline-flex items-center space-x-2 bg-accent-blue/10 text-accent-blue font-semibold px-4 py-2 rounded-lg hover:bg-accent-blue/20 transition text-sm disabled:opacity-50"
                    >
                        <SparklesIcon className="w-4 h-4" />
                        <span>Nova Mensagem</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MotivationalCoach;