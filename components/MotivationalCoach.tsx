
import React, { useState, useEffect } from 'react';
import { getMotivationalMessage } from '../services/geminiService';
import { XIcon } from './icons/XIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface MotivationalCoachProps {
    userProfile: UserProfile;
    onDismiss: () => void;
    isInitialView?: boolean;
}

const MotivationalCoach: React.FC<MotivationalCoachProps> = ({ userProfile, onDismiss, isInitialView }) => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isDismissed, setIsDismissed] = useState(false);

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

    if (isDismissed) {
        return (
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setIsDismissed(false)}
                className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-accent-green text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group"
            >
                <img src={coach.avatar} alt={coach.name} className="w-full h-full rounded-full object-cover" />
                <div className="absolute -top-2 -right-2 bg-accent-blue text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md group-hover:animate-bounce">
                    Leo
                </div>
            </motion.button>
        );
    }

    const handleInternalDismiss = () => {
        if (isInitialView) {
            setIsDismissed(true);
        }
        onDismiss();
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-xl mb-8 border border-gray-100 dark:border-gray-800 relative overflow-hidden group"
        >
            <div className="absolute top-0 left-0 w-2 h-full bg-accent-green"></div>
            <button
                onClick={handleInternalDismiss}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full transition-colors bg-gray-50 dark:bg-gray-800"
                aria-label="Dispensar coach"
            >
                <XIcon className="w-4 h-4" />
            </button>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-gray-700">
                        <img
                            src={coach.avatar}
                            alt={`Avatar do coach ${coach.name}`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-accent-green text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                        ONLINE
                    </div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Coach Leo</h3>
                        <SparklesIcon className="w-4 h-4 text-accent-blue animate-pulse" />
                    </div>
                    
                    <div className="relative bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl rounded-tl-none border dark:border-gray-800 mt-2">
                        {isLoading ? (
                            <div className="flex space-x-1 py-2">
                                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            </div>
                        ) : (
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">"{message}"</p>
                        )}
                    </div>

                    <div className="mt-4 flex items-center justify-center sm:justify-start gap-3">
                        <button
                            onClick={fetchMessage}
                            disabled={isLoading}
                            className="inline-flex items-center space-x-2 bg-accent-green text-white font-bold px-5 py-2 rounded-xl hover:bg-green-600 transition text-xs shadow-md active:scale-95 disabled:opacity-50"
                        >
                            <SparklesIcon className="w-4 h-4" />
                            <span>Nova Dica</span>
                        </button>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">IA Personalizada</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MotivationalCoach;
