import React from 'react';
import { WaterDropIcon } from './icons/WaterDropIcon';
import { GlassIcon } from './icons/GlassIcon';
import { Card, CardHeader, CardTitle, CardContent } from './CalorieRing';

interface WaterTrackerProps {
    consumed: number;
    goal: number;
    onSetWater: (amount: number) => void;
}

const WaterTracker: React.FC<WaterTrackerProps> = ({ consumed, goal, onSetWater }) => {
    const waterGlassSize = 250; // ml
    const totalGlasses = Math.ceil(goal / waterGlassSize) || 1;
    const filledGlasses = Math.floor(consumed / waterGlassSize);

    const handleGlassClick = (glassIndex: number) => {
        const clickedAmount = (glassIndex + 1) * waterGlassSize;
        // If clicking the last filled glass, "empty" it. Otherwise, fill up to the clicked glass.
        if (filledGlasses === glassIndex + 1 && consumed >= clickedAmount) {
             onSetWater(glassIndex * waterGlassSize);
        } else {
            onSetWater(clickedAmount);
        }
    };
    
    const handleAddWater = (amount: number) => {
        onSetWater(Math.max(0, consumed + amount));
    };

    const cupSizes = [
        { amount: 250, label: 'Copo' },
        { amount: 350, label: 'Xícara' },
        { amount: 500, label: 'Garrafa P' },
    ];

    return (
        <Card id="tutorial-water-tracker">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                    <WaterDropIcon className="w-5 h-5 text-accent-blue mr-3" />
                    Água
                </CardTitle>
                <span className="font-semibold text-gray-700 dark:text-gray-300">{consumed} / {goal} ml</span>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-4 justify-center">
                    {Array.from({ length: totalGlasses }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleGlassClick(index)}
                            className="p-1 focus:outline-none focus:ring-2 focus:ring-accent-blue rounded-full transition"
                            aria-label={`Registrar ${index + 1} copos de água`}
                        >
                            <GlassIcon isFilled={index < filledGlasses} />
                        </button>
                    ))}
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-4">
                    <p className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Adicionar Rápido</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {cupSizes.map(cup => (
                            <button
                                key={cup.amount}
                                onClick={() => handleAddWater(cup.amount)}
                                className="bg-accent-blue/10 text-accent-blue font-bold py-2 px-4 rounded-full hover:bg-accent-blue/20 transition text-sm"
                                aria-label={`Adicionar ${cup.amount}ml`}
                            >
                                + {cup.amount} ml ({cup.label})
                            </button>
                        ))}
                        <button
                            onClick={() => handleAddWater(-waterGlassSize)}
                            className="bg-red-500/10 text-red-500 font-bold py-2 px-4 rounded-full hover:bg-red-500/20 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={consumed === 0}
                            aria-label={`Remover ${waterGlassSize}ml`}
                        >
                            - {waterGlassSize} ml
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default WaterTracker;
