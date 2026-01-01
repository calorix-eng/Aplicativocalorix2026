import React, { useState, useEffect } from 'react';
import { FastingState } from '../types';
import { ClockIcon } from './icons/ClockIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { XIcon } from './icons/XIcon';
import { StopIcon } from './icons/StopIcon';
import { PencilIcon } from './icons/PencilIcon';
import { Card, CardHeader, CardTitle, CardContent } from './CalorieRing';

const formatTime = (ms: number): string => {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const CompletionModal: React.FC<{ onClose: () => void, duration: number }> = ({ onClose, duration }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-sm text-center p-8 relative" onClick={e => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                <XIcon />
            </button>
            <TrophyIcon className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold font-display text-gray-800 dark:text-white">Parabéns!</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Você completou seu jejum de {Math.round(duration)} horas com sucesso!</p>
        </div>
    </div>
);

interface IntermittentFastingProps {
  fastingState: FastingState;
  onStartFasting: (duration: number) => void;
  onStopFasting: () => void;
  onUpdateFastingTimes: (newTimes: { startTime?: number; endTime?: number }) => void;
  onCompletionNotified: () => void;
}

const getFastingAnimal = (duration: number) => {
    if (duration <= 12) return { emoji: '🐇', label: 'rabbit' };
    if (duration <= 14) return { emoji: '🦊', label: 'fox' };
    return { emoji: '🦁', label: 'lion' };
};

const toDateTimeLocalString = (timestamp: number | null): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
};

const IntermittentFasting: React.FC<IntermittentFastingProps> = ({
  fastingState,
  onStartFasting,
  onStopFasting,
  onUpdateFastingTimes,
  onCompletionNotified,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [editingField, setEditingField] = useState<'start' | 'end' | null>(null);
  const fastingAnimal = getFastingAnimal(fastingState.durationHours);

  useEffect(() => {
    if (!fastingState.isFasting || !fastingState.endTime) {
      setTimeRemaining(0);
      setProgress(0);
      return;
    }

    const intervalId = setInterval(() => {
      const now = Date.now();
      const remaining = fastingState.endTime! - now;
      setTimeRemaining(remaining);
      
      const totalDuration = fastingState.durationHours * 60 * 60 * 1000;
      const elapsed = totalDuration - remaining;
      const currentProgress = totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0;
      setProgress(currentProgress);

      if (remaining <= 0) {
        clearInterval(intervalId);
        if (!fastingState.completionNotified) {
            setShowCompletionModal(true);
            onCompletionNotified();
        }
      }
    }, 1000);

    // Initial calculations
    const now = Date.now();
    const initialRemaining = fastingState.endTime! - now;
    setTimeRemaining(initialRemaining);
    
    const totalDuration = fastingState.durationHours * 60 * 60 * 1000;
    const elapsed = totalDuration - initialRemaining;
    const currentProgress = totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0;
    setProgress(currentProgress);

    if (initialRemaining <= 0 && !fastingState.completionNotified) {
        setShowCompletionModal(true);
        onCompletionNotified();
    }

    return () => clearInterval(intervalId);
  }, [fastingState.isFasting, fastingState.endTime, fastingState.durationHours, fastingState.completionNotified, onCompletionNotified]);

  const handleStopFastingClick = () => {
    onStopFasting();
    setTimeRemaining(0);
    setProgress(0);
  };
  
  const handleTimeChange = (field: 'start' | 'end', value: string) => {
    const newTimestamp = new Date(value).getTime();
    if (!isNaN(newTimestamp)) {
        if (field === 'start') {
            if (fastingState.endTime && newTimestamp >= fastingState.endTime) return;
            onUpdateFastingTimes({ startTime: newTimestamp });
        } else {
            if (fastingState.startTime && newTimestamp <= fastingState.startTime) return;
            onUpdateFastingTimes({ endTime: newTimestamp });
        }
    }
  };

  const formatDateWithDay = (timestamp: number | null): { day: string; time: string } => {
    if (!timestamp) return { day: '', time: '' };
    const date = new Date(timestamp);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    let day = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

    if (date.toDateString() === today.toDateString()) {
        day = 'Hoje,';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        day = 'Amanhã,';
    }

    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');

    return { day, time };
  };

  const radius = 90;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  const startInfo = formatDateWithDay(fastingState.startTime);
  const endInfo = formatDateWithDay(fastingState.endTime);

  const dots = Array.from({ length: 12 }).map((_, i) => {
      const angle = (i * 30 * Math.PI) / 180;
      const cx = radius + (normalizedRadius - stroke / 2 - 2) * Math.cos(angle);
      const cy = radius + (normalizedRadius - stroke / 2 - 2) * Math.sin(angle);
      return { cx, cy };
  });

  return (
    <>
    {showCompletionModal && (
        <CompletionModal 
            onClose={() => setShowCompletionModal(false)}
            duration={fastingState.durationHours}
        />
    )}
    <Card className="bg-rose-50/50 dark:bg-gray-800/50">
        <CardHeader>
            <CardTitle className="flex items-center">
                <ClockIcon className="w-5 h-5 text-rose-700 dark:text-rose-400 mr-3" />
                Jejum Intermitente
            </CardTitle>
        </CardHeader>
        <CardContent>
            {fastingState.isFasting && fastingState.endTime ? (
                <div className="text-center">
                {timeRemaining > 0 ? (
                    <>
                    <p className="font-semibold text-lg text-gray-700 dark:text-gray-300">Você está em jejum!</p>
                    <div className="relative my-6 w-48 h-48 mx-auto">
                            <svg
                                height={radius * 2}
                                width={radius * 2}
                                viewBox={`0 0 ${radius*2} ${radius*2}`}
                                className="-rotate-90"
                            >
                                <circle
                                    stroke="currentColor"
                                    className="text-gray-200 dark:text-gray-700"
                                    fill="transparent"
                                    strokeWidth={stroke}
                                    r={normalizedRadius}
                                    cx={radius}
                                    cy={radius}
                                />
                                {dots.map((dot, i) => (
                                    <circle key={i} cx={dot.cx} cy={dot.cy} r="2" className="text-gray-300 dark:text-gray-600" fill="currentColor" />
                                ))}
                                <circle
                                    stroke="currentColor"
                                    className="text-rose-700 dark:text-rose-500"
                                    fill="transparent"
                                    strokeWidth={stroke}
                                    strokeDasharray={circumference + ' ' + circumference}
                                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s linear' }}
                                    strokeLinecap="round"
                                    r={normalizedRadius}
                                    cx={radius}
                                    cy={radius}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-6xl" role="img" aria-label={fastingAnimal.label}>{fastingAnimal.emoji}</span>
                            </div>
                            <div className="absolute bottom-1 right-1 bg-white dark:bg-gray-800 p-1 rounded-full shadow-md border dark:border-gray-700">
                                <span className="text-2xl" role="img" aria-label="sprout">🌱</span>
                            </div>
                        </div>
                    <p className="text-5xl font-mono font-bold my-2 text-rose-900 dark:text-rose-200 tracking-wider">
                        {formatTime(timeRemaining).replace(/:/g, ' : ')}
                    </p>
                    </>
                ) : (
                    <>
                    <p className="text-3xl font-bold my-2 text-green-500">Jejum Concluído!</p>
                    <p className="text-gray-500 dark:text-gray-400">Você completou seu jejum de {Math.round(fastingState.durationHours)} horas.</p>
                    </>
                )}

                <button
                    onClick={handleStopFastingClick}
                    className="mt-4 mb-6 w-full max-w-xs mx-auto flex items-center justify-center space-x-3 bg-rose-800 text-white p-3 rounded-full font-semibold hover:bg-rose-900 transition shadow-lg"
                >
                    <StopIcon className="w-5 h-5" />
                    <span>Finalizar jejum</span>
                </button>
                
                <div className="flex justify-between mt-6 text-sm max-w-md mx-auto pt-4 border-t border-rose-100 dark:border-gray-700">
                        <div className="text-left">
                            <p className="text-gray-500 dark:text-gray-400">Início do jejum</p>
                            {editingField === 'start' ? (
                                <input
                                    type="datetime-local"
                                    value={toDateTimeLocalString(fastingState.startTime)}
                                    onChange={(e) => handleTimeChange('start', e.target.value)}
                                    onBlur={() => setEditingField(null)}
                                    autoFocus
                                    className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-1 text-sm font-semibold w-full"
                                />
                            ) : (
                                <p className="font-semibold text-gray-700 dark:text-gray-300 h-8 flex items-center">{startInfo.day} {startInfo.time}</p>
                            )}
                            <button onClick={() => setEditingField('start')} className="flex items-center space-x-1 text-rose-600 dark:text-rose-400 hover:underline mt-1 p-1 px-2 bg-rose-100 dark:bg-rose-800/30 rounded-md">
                                <PencilIcon className="w-3 h-3"/>
                                <span>Editar</span>
                            </button>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-500 dark:text-gray-400">Fim do jejum</p>
                            {editingField === 'end' ? (
                                <input
                                    type="datetime-local"
                                    value={toDateTimeLocalString(fastingState.endTime)}
                                    onChange={(e) => handleTimeChange('end', e.target.value)}
                                    onBlur={() => setEditingField(null)}
                                    autoFocus
                                    className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-1 text-sm font-semibold w-full"
                                />
                            ) : (
                                <p className="font-semibold text-gray-700 dark:text-gray-300 h-8 flex items-center">{endInfo.day} {endInfo.time}</p>
                            )}
                            <button onClick={() => setEditingField('end')} className="flex items-center space-x-1 text-rose-600 dark:text-rose-400 hover:underline mt-1 p-1 px-2 bg-rose-100 dark:bg-rose-800/30 rounded-md float-right">
                                <PencilIcon className="w-3 h-3"/>
                                <span>Editar</span>
                            </button>
                        </div>
                    </div>

                </div>
            ) : (
                <div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Selecione uma duração para começar seu jejum:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button onClick={() => onStartFasting(12)} className="bg-green-500 p-4 rounded-lg text-white font-bold transition hover:bg-green-600 flex flex-col items-center">
                        <span className="text-5xl mb-2" role="img" aria-label="rabbit">🐇</span>
                        <span className="text-2xl">12 horas</span>
                        <span className="text-sm font-semibold px-2 py-0.5 rounded-full mt-1 bg-white bg-opacity-30">Fácil</span>
                    </button>
                    <button onClick={() => onStartFasting(14)} className="bg-orange-500 p-4 rounded-lg text-white font-bold transition hover:bg-orange-600 flex flex-col items-center">
                        <span className="text-5xl mb-2" role="img" aria-label="fox">🦊</span>
                        <span className="text-2xl">14 horas</span>
                        <span className="text-sm font-semibold px-2 py-0.5 rounded-full mt-1 bg-white bg-opacity-30">Moderado</span>
                    </button>
                    <button onClick={() => onStartFasting(16)} className="bg-red-500 p-4 rounded-lg text-white font-bold transition hover:bg-red-600 flex flex-col items-center">
                        <span className="text-5xl mb-2" role="img" aria-label="lion">🦁</span>
                        <span className="text-2xl">16 horas</span>
                        <span className="text-sm font-semibold px-2 py-0.5 rounded-full mt-1 bg-white bg-opacity-30">Desafiador</span>
                    </button>
                </div>
                </div>
            )}
        </CardContent>
    </Card>
    </>
  );
};

export default IntermittentFasting;
