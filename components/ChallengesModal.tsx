import React, { useState, useMemo } from 'react';
import { UserProfile, Challenge } from '../types';
import { XIcon } from './icons/XIcon';
import { availableChallenges } from '../utils/challengeUtils';
import WeeklyChallenge from './WeeklyChallenge';
import { MedalIcon } from './icons/MedalIcon';
import { PlusIcon } from './icons/PlusIcon';

interface ChallengesModalProps {
    userProfile: UserProfile;
    onClose: () => void;
    onSelectChallenge: (challengeId: string) => void;
    onDisableChallenge: () => void;
    onCreateAndSelectCustomChallenge: (challenge: Omit<Challenge, 'id' | 'isCustom'>, startDate: string, endDate: string) => void;
}

const CreateChallengeForm: React.FC<{
    onSave: (challengeData: Omit<Challenge, 'id' | 'isCustom'>, startDate: string, endDate: string) => void;
    onCancel: () => void;
}> = ({ onSave, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<Challenge['type']>('log_streak');
    const [goalValue, setGoalValue] = useState('5');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [dailyTarget, setDailyTarget] = useState('');

    const typeRequiresTarget = useMemo(() => ['water', 'low_carb'].includes(type), [type]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (!title || !endDate || start > end) {
            alert("Por favor, preencha todos os campos corretamente. A data de início não pode ser posterior à data de término.");
            return;
        }

        const durationInMs = end.getTime() - start.getTime();
        const durationInDays = Math.ceil(durationInMs / (1000 * 60 * 60 * 24)) + 1;
        const goalDays = parseInt(goalValue);

        if (goalDays <= 0 || goalDays > durationInDays) {
            alert(`O número de dias para a meta deve ser entre 1 e ${durationInDays} (a duração total do desafio).`);
            return;
        }

        const challengeData: Omit<Challenge, 'id' | 'isCustom'> = {
            title,
            description: description || `Complete a meta por ${goalValue} dia(s).`,
            type,
            goalValue: goalDays,
            durationDays: goalDays, // For custom challenges, the progress bar matches the goal
            dailyTarget: typeRequiresTarget && dailyTarget ? parseInt(dailyTarget) : undefined,
        };
        onSave(challengeData, startDate, endDate);
    };

    const inputClasses = "w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none transition";
    const labelClasses = "block text-sm font-semibold text-gray-600 dark:text-gray-300";

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h3 className="text-lg font-bold">Criar Desafio Personalizado</h3>
            <div>
                <label htmlFor="title" className={labelClasses}>Nome do Desafio</label>
                <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className={inputClasses} placeholder="Ex: Caminhada Diária" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="startDate" className={labelClasses}>Data de Início</label>
                    <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClasses} required />
                </div>
                <div>
                    <label htmlFor="endDate" className={labelClasses}>Data de Término</label>
                    <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} className={inputClasses} required />
                </div>
            </div>
            <div>
                <label htmlFor="type" className={labelClasses}>Tipo de Meta</label>
                <select id="type" value={type} onChange={e => setType(e.target.value as Challenge['type'])} className={inputClasses}>
                    <option value="log_streak">Registrar Refeições</option>
                    <option value="deficit">Déficit Calórico</option>
                    <option value="protein_goal">Meta de Proteína</option>
                    <option value="water">Meta de Água</option>
                    <option value="low_carb">Baixo Carboidrato</option>
                </select>
            </div>
            {typeRequiresTarget && (
                <div>
                    <label htmlFor="dailyTarget" className={labelClasses}>Meta Diária ({type === 'water' ? 'ml' : 'g'})</label>
                    <input type="number" id="dailyTarget" value={dailyTarget} onChange={e => setDailyTarget(e.target.value)} className={inputClasses} placeholder={type === 'water' ? 'Ex: 2000' : 'Ex: 50'} required />
                </div>
            )}
             <div>
                <label htmlFor="goalValue" className={labelClasses}>Dias para Concluir</label>
                <input type="number" id="goalValue" value={goalValue} onChange={e => setGoalValue(e.target.value)} className={inputClasses} placeholder="Ex: 5" required />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold bg-accent-green text-white rounded-md hover:bg-green-600 transition">Salvar Desafio</button>
            </div>
        </form>
    );
}

const ChallengesModal: React.FC<ChallengesModalProps> = ({ userProfile, onClose, onSelectChallenge, onDisableChallenge, onCreateAndSelectCustomChallenge }) => {
    
    const [isCreating, setIsCreating] = useState(false);
    
    const allChallenges = [...availableChallenges, ...(userProfile.customChallenges || [])];

    const currentChallenge = userProfile.challengeProgress 
        ? allChallenges.find(c => c.id === userProfile.challengeProgress?.challengeId)
        : undefined;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold font-display">Central de Desafios</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <XIcon />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-8">
                    {isCreating ? (
                        <CreateChallengeForm 
                            onSave={onCreateAndSelectCustomChallenge} 
                            onCancel={() => setIsCreating(false)} 
                        />
                    ) : (
                        <>
                            <div>
                                <h3 className="text-lg font-bold mb-4">Seu Desafio Ativo</h3>
                                {currentChallenge && userProfile.challengeProgress ? (
                                    <>
                                        <WeeklyChallenge 
                                            challenge={currentChallenge} 
                                            progress={userProfile.challengeProgress}
                                        />
                                        <button
                                            onClick={onDisableChallenge}
                                            className="w-full mt-4 text-center text-sm font-semibold text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition"
                                        >
                                            Desativar desafio atual
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center p-8 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                        <p className="text-gray-500 dark:text-gray-400">Selecione um desafio abaixo ou crie o seu!</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold">Escolha seu Próximo Desafio</h3>
                                    <button
                                        onClick={() => setIsCreating(true)}
                                        className="flex items-center space-x-2 bg-accent-green text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition"
                                    >
                                        <PlusIcon />
                                        <span>Criar Desafio</span>
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {allChallenges.map(challenge => {
                                        if (challenge.isCustom) return null; // Only show predefined challenges for selection
                                        const isCompleted = userProfile.completedChallenges?.some(c => c.challengeId === challenge.id);
                                        const isActive = userProfile.challengeProgress?.challengeId === challenge.id;

                                        return (
                                            <div key={challenge.id} className={`p-4 rounded-lg flex items-center justify-between ${isActive ? 'ring-2 ring-accent-green' : ''} ${isCompleted ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
                                                <div>
                                                    <p className="font-bold text-gray-800 dark:text-white">{challenge.title}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{challenge.description}</p>
                                                </div>
                                                <div className="flex-shrink-0 ml-4 flex items-center space-x-2">
                                                    {isCompleted && (
                                                        <div className="flex items-center text-xs font-semibold text-yellow-600">
                                                            <MedalIcon className="w-6 h-6 mr-1" />
                                                            Concluído
                                                        </div>
                                                    )}
                                                    {isActive && (
                                                        <span className="px-3 py-1 text-xs font-bold text-white bg-accent-green rounded-full">Ativo</span>
                                                    )}
                                                    {!isActive && (
                                                        <button 
                                                            onClick={() => onSelectChallenge(challenge.id)}
                                                            className="px-4 py-2 text-sm font-semibold text-white bg-accent-blue rounded-lg hover:bg-blue-600 transition"
                                                        >
                                                            Selecionar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChallengesModal;