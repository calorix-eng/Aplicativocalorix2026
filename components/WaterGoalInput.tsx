import React from 'react';
import { InfoIcon } from './icons/InfoIcon';

interface WaterGoalInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    suggestion: number;
    name?: string;
}

const WaterGoalInput: React.FC<WaterGoalInputProps> = ({ value, onChange, onBlur, suggestion, name = "customWaterGoal" }) => {
    return (
        <div className="space-y-4">
            <div className="bg-accent-blue/10 dark:bg-accent-blue/20 p-4 rounded-lg">
                <div className="flex items-center">
                    <InfoIcon className="w-5 h-5 text-accent-blue mr-2 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-accent-blue">Sugestão da IA: {suggestion} ml</p>
                        <p className="text-xs text-accent-blue/80">Calculado com base no seu peso (aprox. 35ml por kg).</p>
                    </div>
                </div>
            </div>

            <div>
                <label htmlFor={name} className="block text-md font-semibold text-gray-700 dark:text-gray-300">
                    Minha Meta Personalizada (ml)
                </label>
                <input
                    type="number"
                    name={name}
                    id={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    required
                    className="w-full mt-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none transition"
                />
            </div>
        </div>
    );
};

export default WaterGoalInput;