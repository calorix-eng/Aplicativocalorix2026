
import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { UserProfile, ActivityLevel, MealCategory, DailyLog } from '../types';
import { XIcon } from './icons/XIcon';
import { CameraIcon } from './icons/CameraIcon';
import { resizeImageFile, dataURLtoFile } from '../utils/fileUtils'; 
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import WaterGoalInput from './WaterGoalInput';
import { UserIcon } from './icons/UserIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { HeartIcon } from './icons/HeartIcon';
import { getExercisesFromImage } from '../services/geminiService';
import { TargetIcon } from './icons/TargetIcon';
import { CogIcon } from './icons/CogIcon';
import { LinkIcon } from './icons/LinkIcon';
import { GoogleFitIcon } from './icons/GoogleFitIcon';
import { AppleHealthIcon } from './icons/AppleHealthIcon';
import { SmartwatchIcon } from './icons/SmartwatchIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { LinkOffIcon } from './icons/LinkOffIcon';
import { exportUserDataToJSON } from '../utils/exportUtils';
import { DownloadIcon } from './icons/DownloadIcon';
import CameraCapture from './CameraCapture';
import { ImageIcon } from './icons/ImageIcon';

export type ProfileTab = 'profile' | 'activity' | 'goals' | 'meals' | 'settings' | 'integrations';
type Tab = ProfileTab;

interface ProfileModalProps {
    userProfile: UserProfile;
    dailyLogs: Record<string, Omit<DailyLog, 'micronutrientIntake'>>;
    onClose: () => void;
    onSave: (profileData: Partial<UserProfile>, mealCategories: MealCategory[]) => void;
    onLogout: () => void;
    onUpdateWaterGoal: (waterGoal: number) => void;
    onChangePasswordClick: () => void;
    onUpgradeClick: () => void;
    initialTab?: ProfileTab;
    darkMode: boolean;
    toggleDarkMode: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ userProfile, dailyLogs, onClose, onSave, onLogout, onUpdateWaterGoal, onChangePasswordClick, onUpgradeClick, initialTab, darkMode, toggleDarkMode }) => {
    const [activeTab, setActiveTab] = useState<Tab>(initialTab || 'profile');
    
    const [formData, setFormData] = useState({
        name: userProfile.name,
        avatar: userProfile.avatar,
        age: userProfile.age.toString(),
        sex: userProfile.sex,
        weight: userProfile.weight.toString(),
        targetWeight: (userProfile.targetWeight ?? userProfile.weight).toString(),
        height: userProfile.height.toString(),
        activityLevel: userProfile.activityLevel,
        practicesSports: userProfile.practicesSports ? 'yes' : 'no',
        activityType: userProfile.activityType || 'none',
        exercises: userProfile.exercises || '',
        hasAllergies: userProfile.hasAllergies ? 'yes' : 'no',
        allergies: userProfile.allergies?.join(', ') || '',
        units: userProfile.units || 'metric',
        customWaterGoal: (userProfile.customWaterGoal ?? userProfile.goals.water).toString(),
        customCalories: userProfile.customGoals?.calories?.toString() ?? '',
        customProtein: userProfile.customGoals?.protein?.toString() ?? '',
        customCarbs: userProfile.customGoals?.carbs?.toString() ?? '',
        customFat: userProfile.customGoals?.fat?.toString() ?? '',
        connectedServices: userProfile.integrations.connectedServices || [],
        coachName: userProfile.coach?.name || 'Leo',
        coachAvatar: userProfile.coach?.avatar || '',
    });
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const exercisesInputRef = useRef<HTMLInputElement>(null);
    const coachAvatarInputRef = useRef<HTMLInputElement>(null);

    const [mealCategories, setMealCategories] = useState<MealCategory[]>(userProfile.mealCategories);
    const [newCategoryName, setNewCategoryName] = useState('');
    
    const [isIdentifyingExercises, setIsIdentifyingExercises] = useState(false);
    const [exerciseError, setExerciseError] = useState<string | null>(null);
    const [isCoachCameraOpen, setIsCoachCameraOpen] = useState(false);
    
    const suggestedWaterGoal = formData.weight ? Math.round(parseFloat(formData.weight) * 35) : 0;

    const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Redimensiona para 200px para garantir que o localStorage não estoure
            const resizedFile = await resizeImageFile(file, 200, 200, 0.6);
            const reader = new FileReader();
            reader.readAsDataURL(resizedFile);
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result as string }));
            };
        }
    };

    const handleCoachAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const resizedFile = await resizeImageFile(file, 200, 200, 0.6);
            const reader = new FileReader();
            reader.readAsDataURL(resizedFile);
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, coachAvatar: reader.result as string }));
            };
        }
    };

    const handleCoachPhotoTaken = async ({ mimeType, data }: { mimeType: string, data: string }) => {
        const file = dataURLtoFile(`data:${mimeType};base64,${data}`, 'coach_avatar.jpeg');
        const resizedFile = await resizeImageFile(file, 200, 200, 0.6);
        const reader = new FileReader();
        reader.readAsDataURL(resizedFile);
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, coachAvatar: reader.result as string }));
        };
        setIsCoachCameraOpen(false);
    };

    const handleAvatarClick = () => {
        avatarInputRef.current?.click();
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'practicesSports' && value === 'no') {
                newState.activityType = 'none';
                newState.exercises = '';
            }
            if (name === 'hasAllergies' && value === 'no') {
                newState.allergies = '';
            }
            return newState;
        });
    };
    
    const handleIdentifyExercisesFromImage = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsIdentifyingExercises(true);
        setExerciseError(null);

        try {
            // Redimensiona e comprime a imagem ANTES de enviar para o backend
            const resizedFile = await resizeImageFile(file, 1024, 1024, 0.7); // Limite de 1024px, qualidade 0.7
            const identifiedExercises = await getExercisesFromImage(resizedFile); // Passa o objeto File
            
            if (identifiedExercises && identifiedExercises.length > 0) {
                setFormData(prev => {
                    const existingExercises = prev.exercises
                        .split(',')
                        .map(ex => ex.trim())
                        .filter(ex => ex); 

                    const combined = new Set([...existingExercises, ...identifiedExercises]);

                    return {
                        ...prev,
                        exercises: Array.from(combined).join(', '),
                    };
                });
            } else {
                setExerciseError("Nenhum exercício foi identificado na imagem.");
            }
        } catch (error: any) {
            console.error("Erro ao identificar exercícios:", error);
            setExerciseError(error.message || "Falha ao analisar a imagem. Tente novamente.");
        } finally {
            setIsIdentifyingExercises(false);
            if (e.target) {
                e.target.value = ''; // Limpa o input file
            }
        }
    };
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        const customGoals = {
            calories: formData.customCalories ? parseInt(formData.customCalories) : undefined,
            protein: formData.customProtein ? parseInt(formData.customProtein) : undefined,
            carbs: formData.customCarbs ? parseInt(formData.customCarbs) : undefined,
            fat: formData.customFat ? parseInt(formData.customFat) : undefined, // Corrected from formData.fat
        };

        const finalCustomGoals = { ...userProfile.customGoals };
        
        (Object.keys(customGoals) as Array<keyof typeof customGoals>).forEach(key => {
            const value = customGoals[key];
            if (value === undefined || isNaN(value)) {
                delete finalCustomGoals[key];
            } else {
                finalCustomGoals[key] = value;
            }
        });

        const profileData: Partial<UserProfile> = {
            name: formData.name,
            avatar: formData.avatar,
            age: parseInt(formData.age),
            weight: parseFloat(formData.weight),
            targetWeight: parseFloat(formData.targetWeight),
            height: parseFloat(formData.height),
            sex: formData.sex as 'male' | 'female' | 'prefer_not_to_say',
            activityLevel: formData.activityLevel as ActivityLevel,
            coach: {
                id: 'leo',
                name: formData.coachName,
                avatar: formData.coachAvatar,
            },
            practicesSports: formData.practicesSports === 'yes',
            activityType: formData.practicesSports === 'yes' ? (formData.activityType as UserProfile['activityType']) : 'none',
            exercises: formData.practicesSports === 'yes' ? formData.exercises : undefined,
            hasAllergies: formData.hasAllergies === 'yes',
            allergies: formData.hasAllergies === 'yes' ? formData.allergies.split(',').map(a => a.trim()).filter(Boolean) : [],
            units: formData.units as 'metric' | 'imperial',
            customWaterGoal: parseInt(formData.customWaterGoal),
            customGoals: finalCustomGoals,
            integrations: {
                ...userProfile.integrations,
                connectedServices: formData.connectedServices
            }
        };
        onSave(profileData, mealCategories);
        onClose();
    };
    
    const handleCategoryNameChange = (id: string, newName: string) => {
        setMealCategories(cats => cats.map(cat => cat.id === id ? { ...cat, name: newName } : cat));
    };

    const handleAddCategory = () => {
        if (newCategoryName.trim()) {
            setMealCategories(cats => [...cats, { id: crypto.randomUUID(), name: newCategoryName.trim() }]);
            setNewCategoryName('');
        }
    };
    
    const handleDeleteCategory = (id: string) => {
        setMealCategories(cats => cats.filter(cat => cat.id !== id));
    };
    
    const handleWaterGoalBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const newGoal = parseInt(e.target.value);
        if (!isNaN(newGoal) && newGoal > 0) {
            onUpdateWaterGoal(newGoal);
        }
    };

    const activityMap: Record<ActivityLevel, string> = {
        sedentary: "Sedentário",
        light: "Levemente Ativo",
        moderate: "Moderadamente Ativo",
        very: "Muito Ativo",
        extra: "Extremamente Ativo"
    };

    const inputClasses = "w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none transition";
    const labelClasses = "block text-sm font-semibold text-gray-600 dark:text-gray-300";
    
    const TabButton: React.FC<{tab: Tab, label: string, icon: React.ReactNode}> = ({tab, label, icon}) => (
        <button
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center p-3 text-xs sm:text-sm font-medium border-b-2 transition ${activeTab === tab ? 'border-accent-green text-accent-green' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
            {icon}
            <span className="ml-2 hidden sm:inline">{label}</span>
        </button>
    )

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold font-display">Configurações</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <XIcon />
                    </button>
                </div>
                
                <div className="border-b border-gray-200 dark:border-gray-700 flex">
                    <TabButton tab="profile" label="Perfil" icon={<UserIcon />}/>
                    <TabButton tab="activity" label="Atividade" icon={<HeartIcon />}/>
                    <TabButton tab="goals" label="Metas" icon={<TargetIcon className="h-5 w-5"/>}/>
                    <TabButton tab="meals" label="Refeições" icon={<ClipboardListIcon />}/>
                    <TabButton tab="integrations" label="Integrações" icon={<LinkIcon />} />
                    <TabButton tab="settings" label="Ajustes" icon={<CogIcon />} />
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
                    <div className="p-6 overflow-y-auto space-y-4 flex-grow">
                        {activeTab === 'profile' && (
                            <>
                                 <div className="flex justify-center mb-4">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                                            {formData.avatar ? (
                                                <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-3xl text-light-text dark:text-dark-text">
                                                    {userProfile.name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAvatarClick}
                                            className="absolute inset-0 w-full h-full bg-black bg-opacity-40 rounded-full flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity focus:outline-none"
                                            aria-label="Alterar avatar"
                                        >
                                            <CameraIcon />
                                        </button>
                                    </div>
                                    <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/png, image/jpeg, image/webp" className="hidden" />
                                </div>
                                
                                <div>
                                    <label htmlFor="name" className={labelClasses}>Nome</label>
                                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputClasses} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label htmlFor="age" className={labelClasses}>Idade</label><input type="number" name="age" id="age" value={formData.age} onChange={handleChange} className={inputClasses} required /></div>
                                    <div>
                                        <label htmlFor="sex" className={labelClasses}>Sexo</label>
                                        <select name="sex" id="sex" value={formData.sex} onChange={handleChange} className={inputClasses}>
                                            <option value="male">Masculino</option>
                                            <option value="female">Feminino</option>
                                            <option value="prefer_not_to_say">Prefiro não dizer</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label htmlFor="weight" className={labelClasses}>Peso Atual ({formData.units === 'metric' ? 'kg' : 'lbs'})</label><input type="number" name="weight" id="weight" step="0.1" value={formData.weight} onChange={handleChange} className={inputClasses} required /></div>
                                    <div><label htmlFor="height" className={labelClasses}>Altura ({formData.units === 'metric' ? 'cm' : 'in'})</label><input type="number" name="height" id="height" value={formData.height} onChange={handleChange} className={inputClasses} required /></div>
                                </div>
                                
                                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                                
                                <div>
                                    <label className={labelClasses}>Seu Coach</label>
                                    <div className="mt-2 p-3 border-2 rounded-lg flex flex-col items-center space-y-2 border-accent-green bg-accent-green/10">
                                        {isCoachCameraOpen ? (
                                            <CameraCapture onCapture={handleCoachPhotoTaken} onClose={() => setIsCoachCameraOpen(false)} />
                                        ) : (
                                            <>
                                                <div className="relative">
                                                    <img src={formData.coachAvatar} alt={formData.coachName} className="w-20 h-20 rounded-full object-cover" />
                                                    <input type="file" ref={coachAvatarInputRef} onChange={handleCoachAvatarChange} accept="image/png, image/jpeg, image/webp" className="hidden" />
                                                    <div className="absolute -bottom-1 -right-1 flex">
                                                        <button type="button" title="Enviar arquivo" onClick={() => coachAvatarInputRef.current?.click()} className="p-1.5 bg-gray-200 rounded-full text-gray-600 hover:bg-gray-300 shadow-md">
                                                            <ImageIcon className="w-4 h-4" />
                                                        </button>
                                                        <button type="button" title="Tirar foto" onClick={() => setIsCoachCameraOpen(true)} className="p-1.5 ml-1 bg-gray-200 rounded-full text-gray-600 hover:bg-gray-300 shadow-md">
                                                            <CameraIcon />
                                                        </button>
                                                    </div>
                                                </div>
                                                <span className="font-semibold mt-2">{formData.coachName}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="mt-3">
                                        <label htmlFor="coachName" className={labelClasses}>Nome do Coach</label>
                                        <input type="text" name="coachName" id="coachName" value={formData.coachName} onChange={handleChange} className={inputClasses} />
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                                <div>
                                    <label className={labelClasses}>Você possui alguma alergia alimentar?</label>
                                    <div className="mt-2 flex space-x-4">
                                        <label className="flex items-center">
                                            <input type="radio" name="hasAllergies" value="yes" checked={formData.hasAllergies === 'yes'} onChange={handleChange} className="h-4 w-4 text-accent-green focus:ring-accent-green"/>
                                            <span className="ml-2 text-gray-700 dark:text-gray-300">Sim</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="radio" name="hasAllergies" value="no" checked={formData.hasAllergies === 'no'} onChange={handleChange} className="h-4 w-4 text-accent-green focus:ring-accent-green"/>
                                            <span className="ml-2 text-gray-700 dark:text-gray-300">Não</span>
                                        </label>
                                    </div>
                                </div>

                                {formData.hasAllergies === 'yes' && (
                                    <div className="animate-fade-in">
                                        <label htmlFor="allergies" className={labelClasses}>Quais alimentos? (separados por vírgula)</label>
                                        <textarea
                                            name="allergies"
                                            id="allergies"
                                            value={formData.allergies}
                                            onChange={handleChange}
                                            placeholder="Ex: Glúten, Amendoim, Frutos do mar..."
                                            className={inputClasses + " h-20"}
                                        />
                                    </div>
                                )}

                            </>
                        )}
                        
                        {activeTab === 'activity' && (
                             <div className="space-y-4">
                                <h3 className="text-lg font-bold">Atividade Física</h3>
                                <div>
                                    <label htmlFor="activityLevel" className={labelClasses}>Nível de Atividade Geral</label>
                                    <select name="activityLevel" id="activityLevel" value={formData.activityLevel} onChange={handleChange} className={inputClasses}>{Object.entries(activityMap).map(([key, value]) => (<option key={key} value={key}>{value}</option>))}</select>
                                    <p className="text-xs text-gray-500 mt-1">Sua atividade diária (trabalho, rotina) sem contar exercícios.</p>
                                </div>

                                <div>
                                    <label className={labelClasses}>Você pratica exercícios específicos?</label>
                                    <div className="mt-2 flex space-x-4">
                                        <label className="flex items-center">
                                            <input type="radio" name="practicesSports" value="yes" checked={formData.practicesSports === 'yes'} onChange={handleChange} className="h-4 w-4 text-accent-green focus:ring-accent-green"/>
                                            <span className="ml-2 text-gray-700 dark:text-gray-300">Sim</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="radio" name="practicesSports" value="no" checked={formData.practicesSports === 'no'} onChange={handleChange} className="h-4 w-4 text-accent-green focus:ring-accent-green"/>
                                            <span className="ml-2 text-gray-700 dark:text-gray-300">Não</span>
                                        </label>
                                    </div>
                                </div>

                                {formData.practicesSports === 'yes' && (
                                    <div className="space-y-4 animate-fade-in">
                                        <div>
                                            <label htmlFor="activityType" className={labelClasses}>Qual atividade principal?</label>
                                            <select name="activityType" id="activityType" value={formData.activityType} onChange={handleChange} className={inputClasses}>
                                                <option value="none" disabled>Selecione uma atividade</option>
                                                <option value="weightlifting">Musculação</option>
                                                <option value="crossfit">Crossfit</option>
                                                <option value="running">Corrida</option>
                                                <option value="swimming">Natação</option>
                                                <option value="other">Outra</option>
                                            </select>
                                        </div>

                                        {(formData.activityType === 'weightlifting' || formData.activityType === 'crossfit') && (
                                            <div>
                                                <label htmlFor="exercises" className={labelClasses}>Quais exercícios você costuma fazer?</label>
                                                <div className="relative">
                                                    <textarea
                                                        name="exercises"
                                                        id="exercises"
                                                        value={formData.exercises}
                                                        onChange={handleChange}
                                                        placeholder="Ex: Agachamento, Supino, Levantamento Terra..."
                                                        className={inputClasses + " h-24 pr-12"}
                                                    />
                                                     <input
                                                        type="file"
                                                        ref={exercisesInputRef}
                                                        onChange={handleIdentifyExercisesFromImage}
                                                        accept="image/*"
                                                        className="hidden"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => exercisesInputRef.current?.click()}
                                                        className="absolute top-2 right-2 p-2 text-gray-500 hover:text-accent-green rounded-full transition-colors disabled:opacity-50"
                                                        aria-label="Identificar exercícios por foto"
                                                        disabled={isIdentifyingExercises}
                                                    >
                                                        {isIdentifyingExercises ? (
                                                            <svg className="animate-spin h-5 w-5 text-accent-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        ) : (
                                                            <CameraIcon />
                                                        )}
                                                    </button>
                                                </div>
                                                {exerciseError && <p className="text-xs text-red-500 mt-1">{exerciseError}</p>}
                                                <p className="text-xs text-gray-500 mt-1">Liste os principais ou use a câmera para identificar a partir de uma foto.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'goals' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold">Metas Nutricionais</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="customCalories" className={labelClasses}>Calorias (kcal)</label>
                                        <input type="number" name="customCalories" id="customCalories" value={formData.customCalories} onChange={handleChange} className={inputClasses} placeholder={`Calculado: ${userProfile.goals.calories}`} />
                                    </div>
                                    <div>
                                        <label htmlFor="targetWeight" className={labelClasses}>Peso Meta (kg)</label>
                                        <input type="number" name="targetWeight" id="targetWeight" step="0.1" value={formData.targetWeight} onChange={handleChange} className={inputClasses} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="customProtein" className={labelClasses}>Proteína (g)</label>
                                        <input type="number" name="customProtein" id="customProtein" value={formData.customProtein} onChange={handleChange} className={inputClasses} placeholder={`${userProfile.goals.protein}g`} />
                                    </div>
                                    <div>
                                        <label htmlFor="customCarbs" className={labelClasses}>Carboidratos (g)</label>
                                        <input type="number" name="customCarbs" id="customCarbs" value={formData.customCarbs} onChange={handleChange} className={inputClasses} placeholder={`${userProfile.goals.carbs}g`} />
                                    </div>
                                    <div>
                                        <label htmlFor="customFat" className={labelClasses}>Gordura (g)</label>
                                        <input type="number" name="customFat" id="customFat" value={formData.customFat} onChange={handleChange} className={inputClasses} placeholder={`${userProfile.goals.fat}g`} />
                                    </div>
                                </div>
                                
                                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                                <WaterGoalInput
                                    name="customWaterGoal"
                                    value={formData.customWaterGoal}
                                    onChange={handleChange}
                                    onBlur={handleWaterGoalBlur}
                                    suggestion={suggestedWaterGoal}
                                />
                            </div>
                        )}

                        {activeTab === 'meals' && (
                            <div>
                                 <h3 className="text-lg font-bold mb-4">Gerenciar Refeições</h3>
                                 <div className="space-y-3">
                                    {mealCategories.map(cat => (
                                        <div key={cat.id} className="flex items-center space-x-2">
                                            <input type="text" value={cat.name} onChange={(e) => handleCategoryNameChange(cat.id, e.target.value)} className={inputClasses + " mt-0"}/>
                                            <button type="button" onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-gray-400 hover:text-red-500"><TrashIcon/></button>
                                        </div>
                                    ))}
                                 </div>
                                 <div className="flex items-center space-x-2 mt-4">
                                    <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Nova refeição..." className={inputClasses + " mt-0"} />
                                    <button type="button" onClick={handleAddCategory} className="p-2 bg-accent-green text-white rounded-md"><PlusIcon/></button>
                                 </div>
                                 <p className="text-xs text-gray-500 mt-4">As alterações de refeições serão salvas ao clicar em "Salvar Alterações".</p>
                            </div>
                        )}

                        {activeTab === 'integrations' && (() => {
                            const IntegrationRow: React.FC<{
                                icon: React.ReactNode;
                                title: string;
                                serviceId: string;
                            }> = ({ icon, title, serviceId }) => {
                                const isConnected = formData.connectedServices.includes(serviceId);

                                const handleToggle = () => {
                                    if (!isConnected && !userProfile.isPremium) {
                                        onUpgradeClick();
                                        return;
                                    }
                                    setFormData(prev => {
                                        const newServices = isConnected 
                                            ? prev.connectedServices.filter(id => id !== serviceId)
                                            : [...prev.connectedServices, serviceId];
                                        return { ...prev, connectedServices: newServices };
                                    });
                                };
                        
                                return (
                                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="mr-4">{icon}</div>
                                            <div>
                                                <h4 className="font-bold text-light-text dark:text-dark-text">{title}</h4>
                                                <div className={`flex items-center text-xs font-semibold ${isConnected ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                    {isConnected ? <CheckCircleIcon className="w-4 h-4 mr-1" /> : <LinkOffIcon className="w-4 h-4 mr-1" />}
                                                    {isConnected ? 'Conectado' : 'Desconectado'}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleToggle}
                                            className={`px-4 py-2 text-sm font-semibold rounded-full transition w-32 text-center ${
                                                isConnected 
                                                    ? 'bg-red-500/10 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' 
                                                    : 'bg-accent-green text-white hover:bg-green-600'
                                            }`}
                                        >
                                            {isConnected ? 'Desconectar' : (userProfile.isPremium ? 'Conectar' : 'Conectar ✨')}
                                        </button>
                                    </div>
                                );
                            };

                            return (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold">Integrações de Saúde</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Conecte suas contas para sincronizar automaticamente dados de saúde. <span className="font-bold text-yellow-500">Recurso Premium.</span>
                                    </p>
                                    <IntegrationRow
                                        icon={<GoogleFitIcon />}
                                        title="Google Fit"
                                        serviceId="gfit"
                                    />
                                    <IntegrationRow
                                        icon={<AppleHealthIcon />}
                                        title="Apple Health"
                                        serviceId="apple"
                                    />
                                    <IntegrationRow
                                        icon={<SmartwatchIcon />}
                                        title="Xiaomi Smart Band"
                                        serviceId="xiaomi"
                                    />
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                        <h3 className="text-lg font-bold">Exportar Meus Dados</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Baixe todos os seus dados de perfil e registros diários em formato JSON, compatível com outros aplicativos.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => exportUserDataToJSON(userProfile, dailyLogs)}
                                            className="w-full mt-3 flex items-center justify-center space-x-2 bg-accent-blue text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition"
                                        >
                                            <DownloadIcon />
                                            <span>Baixar Dados (JSON)</span>
                                        </button>
                                    </div>
                                </div>
                            )
                        })()}
                        
                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold">Preferências do App</h3>
                                </div>
                                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                    <div className="flex items-center justify-between">
                                        <label className="font-semibold cursor-pointer">Modo Escuro</label>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={toggleDarkMode} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-green/30 dark:peer-focus:ring-accent-green/80 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-green"></div>
                                        </label>
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                    <label className="font-semibold cursor-pointer mb-2 block">Unidades de Medida</label>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center">
                                            <input type="radio" name="units" value="metric" checked={formData.units === 'metric'} onChange={handleChange} className="h-4 w-4 text-accent-green focus:ring-accent-green"/>
                                            <span className="ml-2 text-gray-700 dark:text-gray-300">Métrico (kg, cm)</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="radio" name="units" value="imperial" checked={formData.units === 'imperial'} onChange={handleChange} className="h-4 w-4 text-accent-green focus:ring-accent-green"/>
                                            <span className="ml-2 text-gray-700 dark:text-gray-300">Imperial (lbs, in)</span>
                                        </label>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">As alterações de preferências serão salvas ao clicar em "Salvar Alterações".</p>
                                
                                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                                <div>
                                    <h3 className="text-lg font-bold">Gerenciamento da Conta</h3>
                                </div>
                                <div className="space-y-3">
                                    <button type="button" onClick={onChangePasswordClick} className="w-full text-left p-3 rounded-lg font-semibold transition bg-gray-100 dark:bg-gray-700 hover:bg-accent-blue/10 text-accent-blue dark:hover:bg-accent-blue/20">
                                        Alterar Senha
                                    </button>
                                    <button type="button" onClick={onLogout} className="w-full text-left p-3 rounded-lg font-semibold transition bg-gray-100 dark:bg-gray-700 hover:bg-red-500/10 text-red-500 dark:hover:bg-red-500/20">
                                        Sair da Conta
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                    
                    <div className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button type="submit" className="w-full bg-accent-green text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition">Salvar Alterações</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileModal;