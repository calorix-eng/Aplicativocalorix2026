import React from 'react';
import { UserProfile } from '../types';
import { XIcon } from './icons/XIcon';
import { availableChallenges } from '../utils/challengeUtils';
import { MedalIcon } from './icons/MedalIcon';
import { BadgeCheckIcon } from './icons/BadgeCheckIcon';
import { TrophyIcon } from './icons/TrophyIcon';

interface AchievementsModalProps {
    userProfile: UserProfile;
    onClose: () => void;
}

const AchievementsModal: React.FC<AchievementsModalProps> = ({ userProfile, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center">
                        <BadgeCheckIcon className="w-6 h-6 text-accent-green mr-3" />
                        <h2 className="text-xl font-bold font-display">Suas Conquistas</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <XIcon />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {userProfile.completedChallenges && userProfile.completedChallenges.length > 0 ? (
                        <div className="space-y-3">
                            {userProfile.completedChallenges.map((medal, index) => {
                                const challenge = availableChallenges.find(c => c.id === medal.challengeId);
                                if (!challenge) return null;
                                return (
                                    <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                        <MedalIcon className="w-10 h-10 text-yellow-400 mr-4 flex-shrink-0" />
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-white">{challenge.title}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Concluído em: {new Date(medal.dateCompleted).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                            <TrophyIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <p className="font-semibold">Nenhuma medalha ainda.</p>
                            <p className="text-sm mt-1">Continue completando desafios semanais para ganhar conquistas!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AchievementsModal;