import React, { useState } from 'react';
import { UserProfile } from '../types';
import { XIcon } from './icons/XIcon';
import { PencilIcon } from './icons/PencilIcon';
import { Card, CardContent, CardHeader, CardTitle } from './CalorieRing';

type Goal = 'lose' | 'maintain' | 'gain';

interface ProfileSummaryProps {
  userProfile: UserProfile;
  onUpdateGoal: (newGoal: Goal) => void;
  onEditGoals: () => void;
}

interface GoalModalProps {
  onClose: () => void;
  onSelect: (goal: Goal) => void;
  currentGoal: Goal;
}

const goalMap: Record<Goal, string> = {
  lose: 'Perder Peso',
  maintain: 'Manter Peso',
  gain: 'Ganhar Peso',
};

const GoalModal: React.FC<GoalModalProps> = ({ onClose, onSelect }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold">Alterar Objetivo</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                    <XIcon />
                </button>
            </div>
            <div className="p-6 space-y-3">
                {(Object.keys(goalMap) as Goal[]).map(goalKey => (
                    <button
                        key={goalKey}
                        onClick={() => onSelect(goalKey)}
                        className="w-full text-left p-3 rounded-lg font-semibold transition bg-gray-100 dark:bg-gray-700 hover:bg-accent-green hover:text-white dark:hover:bg-accent-green"
                    >
                        {goalMap[goalKey]}
                    </button>
                ))}
            </div>
        </div>
    </div>
  )
}


const ProfileSummary: React.FC<ProfileSummaryProps> = ({ userProfile, onUpdateGoal, onEditGoals }) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const handleGoalSelect = (goal: Goal) => {
    onUpdateGoal(goal);
    setIsEditingGoal(false);
  };
  
  const sexMap: Record<UserProfile['sex'], string> = {
    male: 'Masculino',
    female: 'Feminino',
    prefer_not_to_say: 'Não informado',
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Olá, {userProfile.name}!</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-stretch">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Idade</p>
                <p className="font-bold text-lg">{userProfile.age}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Sexo</p>
                <p className="font-bold text-lg">{sexMap[userProfile.sex]}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Peso</p>
                <p className="font-bold text-lg">{userProfile.weight} {userProfile.units === 'metric' ? 'kg' : 'lbs'}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Altura</p>
                <p className="font-bold text-lg">{userProfile.height} {userProfile.units === 'metric' ? 'cm' : 'in'}</p>
              </div>
              <button
                onClick={() => setIsEditingGoal(true)}
                className="col-span-1 bg-accent-green bg-opacity-10 dark:bg-opacity-20 p-2 rounded-lg text-center hover:bg-opacity-20 dark:hover:bg-opacity-30 transition focus:outline-none focus:ring-2 focus:ring-accent-green flex flex-col justify-center"
              >
                <p className="text-sm text-accent-green font-semibold">Objetivo</p>
                <p className="font-bold text-lg text-accent-green">{goalMap[userProfile.goal]}</p>
              </button>
              <button
                onClick={onEditGoals}
                className="col-span-1 bg-accent-blue bg-opacity-10 dark:bg-opacity-20 p-2 rounded-lg text-center hover:bg-opacity-20 dark:hover:bg-opacity-30 transition focus:outline-none focus:ring-2 focus:ring-accent-blue flex flex-col items-center justify-center"
              >
                <PencilIcon className="h-5 w-5 text-accent-blue" />
                <p className="text-xs text-accent-blue font-semibold mt-1">Editar Metas</p>
              </button>
            </div>
        </CardContent>
      </Card>

      {isEditingGoal && (
        <GoalModal 
          onClose={() => setIsEditingGoal(false)}
          onSelect={handleGoalSelect}
          currentGoal={userProfile.goal}
        />
      )}
    </>
  );
};

export default ProfileSummary;
