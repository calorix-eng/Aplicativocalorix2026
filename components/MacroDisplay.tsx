
import React from 'react';

interface MacroDisplayProps {
  label: string;
  consumed: number;
  goal: number;
  color: string;
}

const MacroDisplay: React.FC<MacroDisplayProps> = ({ label, consumed, goal, color }) => {
  const percentage = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="font-semibold">{label}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(consumed)}g / {goal}g</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
        <div
          className={`${color} h-4 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default MacroDisplay;
