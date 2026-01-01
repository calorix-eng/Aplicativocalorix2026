
import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, Workout, Exercise, DailyLog } from '../types';
import { DumbbellIcon } from './icons/DumbbellIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ClockIcon } from './icons/ClockIcon';
import { FireIcon } from './icons/FireIcon';
import { PlusIcon } from './icons/PlusIcon';
import { CameraIcon } from './icons/CameraIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { generateWorkout, parseWorkoutFromImage, generateExerciseImage } from '../services/geminiService';
import { Card, CardHeader, CardTitle, CardContent } from './CalorieRing';
import { fileToBase64 } from '../utils/fileUtils';
import CameraCapture from './CameraCapture';

interface WorkoutDashboardProps {
    userProfile: UserProfile;
    onLogWorkout: (workout: Workout) => void;
    dailyLogs: Record<string, Omit<DailyLog, 'micronutrientIntake'>>;
}

type WorkoutTab = 'explore' | 'create' | 'history';

/**
 * Componente que carrega e exibe a imagem de um exercício gerada pela IA.
 */
const WorkoutExerciseImage: React.FC<{ exercise: Exercise }> = ({ exercise }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(exercise.imageUrl || null);
    const [isLoading, setIsLoading] = useState(!exercise.imageUrl);

    useEffect(() => {
        const fetchImage = async () => {
            if (exercise.imageUrl) return;
            setIsLoading(true);
            try {
                const prompt = exercise.image_prompt || `${exercise.name} exercise demonstration illustration`;
                const url = await generateExerciseImage(prompt);
                if (url) {
                    setImageUrl(url);
                    exercise.imageUrl = url; // Cache local no objeto do exercício
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchImage();
    }, [exercise]);

    return (
        <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden border flex items-center justify-center">
            {isLoading ? (
                <div className="animate-pulse w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                   <DumbbellIcon className="w-6 h-6 text-gray-400 opacity-50" />
                </div>
            ) : imageUrl ? (
                <img src={imageUrl} className="w-full h-full object-cover" alt={exercise.name} />
            ) : (
                <DumbbellIcon className="w-8 h-8 text-gray-300" />
            )}
        </div>
    );
};

const WorkoutDashboard: React.FC<WorkoutDashboardProps> = ({ userProfile, onLogWorkout, dailyLogs }) => {
    const [activeTab, setActiveTab] = useState<WorkoutTab>('explore');
    const [equipment, setEquipment] = useState<string[]>(['Peso Corporal']);
    const [duration, setDuration] = useState(30);
    const [level, setLevel] = useState('Iniciante');
    const [generatedWorkout, setGeneratedWorkout] = useState<Workout | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    // Manual Creation State
    const [manualWorkout, setManualWorkout] = useState<Partial<Workout>>({
        name: '',
        duration_min: 30,
        intensity: 'Iniciante',
        exercises: [],
        calories_estimated: 0
    });

    const availableEquipment = ['Peso Corporal', 'Halteres', 'Elásticos', 'Academia Completa', 'Kettlebell'];
    const levels = ['Iniciante', 'Intermediário', 'Avançado'];

    // --- LOGIC ---

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedWorkout(null);
        try {
            const workout = await generateWorkout(userProfile, equipment, duration, level);
            if (workout) setGeneratedWorkout(workout);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhotoTaken = async ({ mimeType, data }: { mimeType: string; data: string }) => {
        setIsCameraOpen(false);
        setIsLoading(true);
        try {
            const workout = await parseWorkoutFromImage(data, mimeType);
            if (workout) setGeneratedWorkout(workout);
        } catch (error) {
            alert("Erro ao ler ficha. Tente uma foto mais clara.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteWorkout = (workout: Workout) => {
        onLogWorkout({
            ...workout,
            completed: true
        });
        setGeneratedWorkout(null);
        alert("Treino registrado com sucesso! 💪");
    };

    const allWorkouts = useMemo(() => {
        const list: Workout[] = [];
        Object.values(dailyLogs).forEach((log: Omit<DailyLog, 'micronutrientIntake'>) => {
            if (log.workouts) list.push(...log.workouts);
        });
        return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [dailyLogs]);

    const weeklyCaloriesData = useMemo(() => {
        const today = new Date();
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const log = dailyLogs[dateStr];
            const calories = log?.workouts?.reduce((acc, w) => acc + w.calories_estimated, 0) || 0;
            data.push({ day: d.toLocaleDateString('pt-BR', { weekday: 'short' }), calories });
        }
        return data;
    }, [dailyLogs]);

    // --- RENDER HELPERS ---

    const TabButton = ({ tab, label, icon }: { tab: WorkoutTab, label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center p-3 text-sm font-bold border-b-2 transition ${
                activeTab === tab ? 'border-accent-green text-accent-green' : 'border-transparent text-gray-500'
            }`}
        >
            {icon}
            <span className="ml-2">{label}</span>
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <DumbbellIcon className="w-8 h-8 text-accent-green mr-3" />
                    <h2 className="text-3xl font-bold font-display text-gray-800 dark:text-white">Treinos</h2>
                </div>
            </div>

            <div className="flex border-b dark:border-gray-700">
                <TabButton tab="explore" label="Explorar" icon={<SparklesIcon className="w-4 h-4"/>} />
                <TabButton tab="create" label="Adicionar" icon={<PlusIcon />} />
                <TabButton tab="history" label="Histórico" icon={<ClockIcon className="w-4 h-4"/>} />
            </div>

            {activeTab === 'explore' && (
                <div className="space-y-6 animate-fade-in-up">
                    <Card>
                        <CardHeader><CardTitle>Treinos Sugeridos pela IA</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Seu Nível</label>
                                    <div className="flex gap-2">
                                        {levels.map(l => (
                                            <button 
                                                key={l} 
                                                onClick={() => setLevel(l)}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${level === l ? 'bg-accent-green text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                                            >
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Equipamentos</label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableEquipment.map(item => (
                                            <button
                                                key={item}
                                                onClick={() => setEquipment(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])}
                                                className={`px-3 py-1 rounded-full text-xs font-medium transition ${equipment.includes(item) ? 'bg-accent-blue text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading}
                                className="w-full bg-accent-green text-white p-4 rounded-xl font-bold hover:bg-green-600 transition flex items-center justify-center space-x-2"
                            >
                                {isLoading ? <span className="animate-pulse">Gerando sua rotina...</span> : <><SparklesIcon className="w-5 h-5" /><span>Gerar Treino Personalizado</span></>}
                            </button>
                        </CardContent>
                    </Card>

                    {generatedWorkout && (
                         <WorkoutCard workout={generatedWorkout} onComplete={handleCompleteWorkout} onCancel={() => setGeneratedWorkout(null)} />
                    )}
                </div>
            )}

            {activeTab === 'create' && (
                <div className="space-y-6 animate-fade-in-up">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button 
                            onClick={() => setIsCameraOpen(true)}
                            className="bg-accent-blue text-white p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center space-y-4 hover:bg-blue-600 transition"
                        >
                            <CameraIcon className="w-12 h-12" />
                            <div className="text-center">
                                <h3 className="text-xl font-bold">Ler Ficha da Academia</h3>
                                <p className="text-sm opacity-80">Tire uma foto e a IA extrai os exercícios</p>
                            </div>
                        </button>

                        <button 
                            onClick={() => alert("Funcionalidade de criação manual completa em breve. Use a foto por enquanto!")}
                            className="bg-light-card dark:bg-dark-card border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 rounded-2xl flex flex-col items-center justify-center space-y-4 hover:border-accent-green transition"
                        >
                            <PlusIcon className="w-12 h-12 text-gray-400" />
                            <div className="text-center">
                                <h3 className="text-xl font-bold">Criar Manualmente</h3>
                                <p className="text-sm text-gray-500">Adicione exercício por exercício</p>
                            </div>
                        </button>
                    </div>

                    {isCameraOpen && (
                        <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center">
                            <CameraCapture onCapture={handlePhotoTaken} onClose={() => setIsCameraOpen(false)} />
                        </div>
                    )}

                    {isLoading && <div className="text-center p-8 bg-gray-50 rounded-xl">Lendo ficha... Aguarde.</div>}

                    {generatedWorkout && (
                         <WorkoutCard workout={generatedWorkout} onComplete={handleCompleteWorkout} onCancel={() => setGeneratedWorkout(null)} title="Treino Identificado" />
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="space-y-6 animate-fade-in-up">
                    <Card>
                        <CardHeader><CardTitle>Consistência Semanal (Calorias Queimadas)</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between h-40 space-x-2">
                                {weeklyCaloriesData.map((d, i) => {
                                    const max = Math.max(...weeklyCaloriesData.map(v => v.calories)) || 1;
                                    const height = (d.calories / max) * 100;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center group">
                                            <div className="relative w-full flex items-end h-32">
                                                <div 
                                                    className="w-full bg-accent-blue rounded-t-md transition-all duration-500" 
                                                    style={{ height: `${height}%` }}
                                                >
                                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">{d.calories}</div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] mt-2 font-bold text-gray-500">{d.day}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold">Últimos Treinos</h3>
                        {allWorkouts.length === 0 ? (
                            <p className="text-center text-gray-500 py-10">Nenhum treino registrado ainda.</p>
                        ) : (
                            allWorkouts.map(w => (
                                <div key={w.id} className="bg-light-card dark:bg-dark-card p-4 rounded-xl shadow-sm border dark:border-gray-700 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-accent-green/10 p-3 rounded-full"><DumbbellIcon className="w-6 h-6 text-accent-green" /></div>
                                        <div>
                                            <h4 className="font-bold text-lg">{w.name || `Treino ${w.intensity}`}</h4>
                                            <p className="text-xs text-gray-500">{new Date(w.date).toLocaleDateString('pt-BR')} • {w.duration_min} min • {w.calories_estimated} kcal</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button className="p-2 text-gray-400 hover:text-blue-500"><PencilIcon className="w-5 h-5"/></button>
                                        <button className="p-2 text-gray-400 hover:text-red-500"><TrashIcon/></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- SUB-COMPONENTS ---

const WorkoutCard = ({ workout, onComplete, onCancel, title = "Seu Treino Personalizado" }: { workout: Workout, onComplete: (w: Workout) => void, onCancel: () => void, title?: string }) => {
    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-xl border-2 border-accent-green animate-fade-in-up">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-2xl font-bold">{title}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center"><ClockIcon className="w-4 h-4 mr-1" /> {workout.duration_min} min</span>
                        <span className="flex items-center"><FireIcon className="w-4 h-4 mr-1 text-orange-500" /> ~{workout.calories_estimated} kcal</span>
                        <span className="px-2 py-0.5 rounded text-xs uppercase font-bold bg-gray-100 dark:bg-gray-800">{workout.intensity}</span>
                    </div>
                </div>
                <button onClick={onCancel} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
            </div>

            <div className="space-y-4">
                {workout.exercises.map((exercise, index) => (
                    <div key={exercise.id} className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl flex items-center gap-4">
                        <WorkoutExerciseImage exercise={exercise} />
                        <div className="flex-grow">
                            <h4 className="font-bold text-sm">{exercise.name}</h4>
                            <div className="flex gap-3 mt-1 text-[10px] font-bold text-gray-500">
                                <span className="text-accent-green">{exercise.sets} Séries</span>
                                <span className="text-accent-blue">{exercise.reps} Reps</span>
                                <span className="text-orange-500">{exercise.rest_s}s Descanso</span>
                            </div>
                            {exercise.muscle_group && <span className="text-[9px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded mt-1 inline-block">{exercise.muscle_group}</span>}
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => onComplete(workout)}
                className="w-full mt-8 bg-accent-blue text-white p-4 rounded-xl font-bold hover:bg-blue-600 transition shadow-lg"
            >
                Concluir e Registrar Treino
            </button>
        </div>
    );
};

export default WorkoutDashboard;
