import React from 'react';
import { UserProfile } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { FireIcon } from './icons/FireIcon';
import { BoltIcon } from './icons/BoltIcon';
import { LeafIcon } from './icons/LeafIcon';
import { OilIcon } from './icons/OilIcon';
import { Card, CardHeader, CardTitle, CardContent } from './CalorieRing';


interface NutrientGoalsSummaryProps {
  userProfile: UserProfile;
  onEdit: () => void;
}

const NutrientGoalsSummary: React.FC<NutrientGoalsSummaryProps> = ({ userProfile, onEdit }) => {
  const { calories, protein, carbs, fat } = userProfile.goals;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Metas Diárias</CardTitle>
        <button onClick={onEdit} className="flex items-center text-sm font-semibold text-accent-blue hover:underline p-1">
          <PencilIcon className="h-4 w-4 mr-1" />
          Editar
        </button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <FireIcon className="h-6 w-6 text-orange-500 mx-auto mb-1" />
            <p className="font-bold text-lg">{calories} <span className="text-sm font-normal">kcal</span></p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Calorias</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <BoltIcon className="h-6 w-6 text-red-500 mx-auto mb-1" />
            <p className="font-bold text-lg">{protein} <span className="text-sm font-normal">g</span></p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Proteína</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <LeafIcon className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <p className="font-bold text-lg">{carbs} <span className="text-sm font-normal">g</span></p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Carbs</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <OilIcon className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
            <p className="font-bold text-lg">{fat} <span className="text-sm font-normal">g</span></p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Gordura</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutrientGoalsSummary;
