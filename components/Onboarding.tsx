
import React, { useState, useEffect } from 'react';
import { UserProfile, ActivityLevel } from '../types';
import { LogoIcon } from './icons/LogoIcon';
import { calculateNutritionalGoals } from '../utils/nutritionUtils';
import WaterGoalInput from './WaterGoalInput';
import { getDefaultReminders } from '../utils/reminderUtils';
import { MaleIcon } from './icons/MaleIcon';
import { FemaleIcon } from './icons/FemaleIcon';
import { QuestionMarkIcon } from './icons/QuestionMarkIcon';

interface OnboardingProps {
  onProfileCreate: (profile: UserProfile) => void;
  defaultName?: string;
}

const stepLabels = ["Básico", "Medidas", "Atividade", "Alergias", "Objetivos"];
const totalSteps = stepLabels.length;

const OnboardingProgress: React.FC<{ current: number; total: number }> = ({ current, total }) => (
    <div className="flex items-start justify-center w-full px-4 md:px-0 mb-10">
        {stepLabels.map((label, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < current;
            const isActive = stepNum === current;
            return (
                <React.Fragment key={stepNum}>
                    <div className="flex flex-col items-center text-center px-1">
                        <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-base transition-all duration-300 flex-shrink-0 ${
                                isActive ? 'bg-accent-green text-white ring-4 ring-green-200 dark:ring-green-800' : isCompleted ? 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                            }`}
                        >
                            {isCompleted ? '✓' : stepNum}
                        </div>
                        <span className={`mt-2 text-xs font-semibold transition-colors duration-300 ${isActive ? 'text-accent-green' : 'text-gray-500'}`}>{label}</span>
                    </div>
                    {stepNum < total && <div className={`flex-1 h-0.5 mt-4 mx-1 rounded ${isCompleted ? 'bg-accent-green' : 'bg-gray-200 dark:bg-gray-700'}`}></div>}
                </React.Fragment>
            )
        })}
    </div>
);

const SelectableCard: React.FC<{
    label: string;
    value: string;
    icon?: React.ReactNode;
    selectedValue: string;
    onClick: (value: string) => void;
    children?: React.ReactNode;
}> = ({ label, value, icon, selectedValue, onClick, children }) => (
    <button
        type="button"
        role="radio"
        aria-checked={selectedValue === value}
        onClick={() => onClick(value)}
        className={`flex-1 p-4 border-2 rounded-lg flex flex-col items-center justify-center space-y-2 transition-all duration-200 ${
            selectedValue === value
                ? 'border-accent-green bg-accent-green/10 ring-2 ring-accent-green'
                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-accent-green/50'
        }`}
    >
        {icon || children}
        <span className="font-semibold text-light-text dark:text-dark-text">{label}</span>
    </button>
);


const Onboarding: React.FC<OnboardingProps> = ({ onProfileCreate, defaultName }) => {
  const [step, setStep] = useState(1);
  const [animationDirection, setAnimationDirection] = useState<'right' | 'left'>('right');
  const [formData, setFormData] = useState({
    name: defaultName || '',
    age: '',
    sex: '' as 'male' | 'female' | 'prefer_not_to_say' | '',
    weight: '',
    targetWeight: '',
    height: '',
    coachId: 'leo' as 'leo',
    goal: 'maintain' as 'lose' | 'maintain' | 'gain',
    activityLevel: 'light' as ActivityLevel,
    practicesSports: '' as 'yes' | 'no' | '',
    activityType: 'none' as NonNullable<UserProfile['activityType']>,
    exercises: '',
    hasAllergies: '' as 'yes' | 'no' | '',
    allergies: '',
  });
  const [customWaterGoal, setCustomWaterGoal] = useState('');
  
  const suggestedWaterGoal = formData.weight ? Math.round(parseFloat(formData.weight) * 35) : 2000;

  useEffect(() => {
      if (formData.weight) {
          setCustomWaterGoal(suggestedWaterGoal.toString());
      }
  }, [formData.weight, suggestedWaterGoal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'age' || name === 'height') {
      if (value === '' || /^\d+$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === 'weight' || name === 'targetWeight') {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCardSelection = (name: keyof typeof formData, value: string) => {
    setFormData(prev => {
        const next = { ...prev, [name]: value };
        // Pre-fill target weight based on goal
        if (name === 'goal' && prev.weight) {
            if (value === 'lose') next.targetWeight = (parseFloat(prev.weight) - 5).toString();
            else if (value === 'gain') next.targetWeight = (parseFloat(prev.weight) + 5).toString();
            else next.targetWeight = prev.weight;
        }
        return next;
    });
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.age || !formData.weight || !formData.height || !formData.name || !customWaterGoal || !formData.coachId) return;
    
    const profileDataForCalc = {
      age: parseInt(formData.age),
      sex: formData.sex as 'male' | 'female' | 'prefer_not_to_say',
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
      activityLevel: formData.activityLevel,
      goal: formData.goal,
      activityType: formData.practicesSports === 'yes' ? (formData.activityType || 'other') : 'none',
      units: 'metric' as const,
    };
    
    const goals = calculateNutritionalGoals(profileDataForCalc);
    const finalWaterGoal = parseInt(customWaterGoal);
    goals.water = finalWaterGoal;

    const newProfile: UserProfile = {
      name: formData.name,
      age: parseInt(formData.age),
      sex: formData.sex as 'male' | 'female' | 'prefer_not_to_say',
      weight: parseFloat(formData.weight),
      targetWeight: formData.targetWeight ? parseFloat(formData.targetWeight) : parseFloat(formData.weight),
      height: parseFloat(formData.height),
      activityLevel: formData.activityLevel,
      goal: formData.goal,
      hasCompletedTutorial: false,
      coach: {
        id: 'leo',
        name: 'Leo',
        avatar: 'https://images.pexels.com/photos/2220337/pexels-photo-2220337.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      practicesSports: formData.practicesSports === 'yes',
      activityType: formData.practicesSports === 'yes' ? (formData.activityType || 'other') : 'none',
      exercises: formData.practicesSports === 'yes' ? formData.exercises : undefined,
      hasAllergies: formData.hasAllergies === 'yes',
      allergies: formData.hasAllergies === 'yes' ? formData.allergies.split(',').map(a => a.trim()).filter(Boolean) : [],
      units: 'metric',
      isPremium: false,
      goals: goals,
      customWaterGoal: finalWaterGoal,
      customGoals: {},
      reminders: getDefaultReminders(),
      following: [],
      savedPosts: [],
      challengeProgress: undefined,
      completedChallenges: [],
      integrations: { connectedServices: [], syncHistory: [] },
      mealCategories: [
        { id: '1', name: 'Café da Manhã' },
        { id: '2', name: 'Almoço' },
        { id: '3', name: 'Jantar' },
        { id: '4', name: 'Lanches' },
      ],
    };
    onProfileCreate(newProfile);
  };
  
  const nextStep = () => {
    setAnimationDirection('right');
    setStep(s => s < totalSteps ? s + 1 : s);
  };
  const prevStep = () => {
    setAnimationDirection('left');
    setStep(s => s > 1 ? s - 1 : s);
  };

  const inputClasses = "w-full mt-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none transition";
  const labelClasses = "block text-md font-semibold text-gray-700 dark:text-gray-300";

  const renderStepContent = () => {
    const animationClass = animationDirection === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left';
    
    switch(step) {
      case 1:
        return (
          <div key={step} className={`${animationClass} space-y-6`}>
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">Bem-vindo(a) ao calorix</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Vamos começar com algumas informações básicas.</p>
            </div>
            <div>
              <label htmlFor="name" className={labelClasses}>Como podemos te chamar?</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputClasses} placeholder="Digite seu nome"/>
            </div>
            <button type="button" onClick={nextStep} disabled={!formData.name.trim()} className="w-full bg-accent-green text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">Próximo</button>
          </div>
        );
      case 2:
        return (
           <div key={step} className={`${animationClass} space-y-6`}>
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Conte-nos sobre você</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Essas informações nos ajudam a calcular suas metas.</p>
            </div>
            <div className="space-y-2">
                <label className={labelClasses}>Sexo</label>
                <div className="flex gap-4">
                    <SelectableCard label="Masculino" value="male" icon={<MaleIcon className="w-8 h-8 text-blue-500"/>} selectedValue={formData.sex} onClick={(val) => handleCardSelection('sex', val)} />
                    <SelectableCard label="Feminino" value="female" icon={<FemaleIcon className="w-8 h-8 text-pink-500"/>} selectedValue={formData.sex} onClick={(val) => handleCardSelection('sex', val)} />
                    <SelectableCard label="Prefiro não dizer" value="prefer_not_to_say" icon={<QuestionMarkIcon className="w-8 h-8 text-gray-500"/>} selectedValue={formData.sex} onClick={(val) => handleCardSelection('sex', val)} />
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="age" className={labelClasses}>Idade</label>
                    <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} required className={inputClasses} placeholder="Ex: 25" />
                </div>
                <div>
                    <label htmlFor="weight" className={labelClasses}>Peso Atual (kg)</label>
                    <input type="number" name="weight" id="weight" step="0.1" value={formData.weight} onChange={handleChange} required className={inputClasses} placeholder="Ex: 70.5"/>
                </div>
            </div>
             <div>
                <label htmlFor="height" className={labelClasses}>Altura (cm)</label>
                <input type="number" name="height" id="height" value={formData.height} onChange={handleChange} required className={inputClasses} placeholder="Ex: 175"/>
            </div>
            <div className="flex justify-between space-x-4">
              <button type="button" onClick={prevStep} className="w-full bg-gray-200 dark:bg-gray-600 text-light-text dark:text-dark-text p-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition">Voltar</button>
              <button type="button" onClick={nextStep} disabled={!formData.age || !formData.weight || !formData.height || !formData.sex} className="w-full bg-accent-green text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">Próximo</button>
            </div>
          </div>
        );
      case 3:
        return (
             <div key={step} className={`${animationClass} space-y-6`}>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Atividade Física</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Isso nos ajuda a refinar suas metas nutricionais.</p>
                </div>
                
                <div className="space-y-2">
                    <label className={labelClasses}>Você pratica alguma atividade física regularmente?</label>
                     <div className="flex space-x-4">
                        <SelectableCard label="Sim" value="yes" selectedValue={formData.practicesSports} onClick={(val) => handleCardSelection('practicesSports', val)} />
                        <SelectableCard label="Não" value="no" selectedValue={formData.practicesSports} onClick={(val) => handleCardSelection('practicesSports', val)} />
                    </div>
                </div>

                {formData.practicesSports === 'yes' && (
                    <div className="space-y-4 animate-slide-in-right">
                        <div>
                            <label htmlFor="activityType" className={labelClasses}>Qual atividade?</label>
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
                                <textarea
                                    name="exercises"
                                    id="exercises"
                                    value={formData.exercises}
                                    onChange={handleChange}
                                    placeholder="Ex: Agachamento, Supino, Levantamento Terra..."
                                    className={inputClasses + " h-24"}
                                />
                                 <p className="text-xs text-gray-500 mt-1">Liste os principais para um cálculo mais preciso.</p>
                            </div>
                        )}
                    </div>
                )}
                
                <div className="flex justify-between space-x-4">
                  <button type="button" onClick={prevStep} className="w-full bg-gray-200 dark:bg-gray-600 text-light-text dark:text-dark-text p-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition">Voltar</button>
                  <button type="button" onClick={nextStep} disabled={!formData.practicesSports} className="w-full bg-accent-green text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">Próximo</button>
                </div>
            </div>
        );
      case 4:
        return (
          <div key={step} className={`${animationClass} space-y-6`}>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Alergias Alimentares</h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Isso nos ajuda a sugerir refeições mais seguras e adequadas para você.</p>
            </div>
            
            <div className="space-y-2">
              <label className={labelClasses}>Você possui alguma alergia alimentar?</label>
              <div className="flex space-x-4">
                    <SelectableCard label="Sim" value="yes" selectedValue={formData.hasAllergies} onClick={(val) => handleCardSelection('hasAllergies', val)} />
                    <SelectableCard label="Não" value="no" selectedValue={formData.hasAllergies} onClick={(val) => handleCardSelection('hasAllergies', val)} />
              </div>
            </div>

            {formData.hasAllergies === 'yes' && (
              <div className="space-y-4 animate-slide-in-right">
                <div>
                  <label htmlFor="allergies" className={labelClasses}>Quais alimentos?</label>
                  <textarea
                    name="allergies"
                    id="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    placeholder="Ex: Glúten, Amendoim, Frutos do mar..."
                    className={inputClasses + " h-24"}
                  />
                  <p className="text-xs text-gray-500 mt-1">Liste os alimentos separados por vírgula.</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-between space-x-4">
              <button type="button" onClick={prevStep} className="w-full bg-gray-200 dark:bg-gray-600 text-light-text dark:text-dark-text p-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition">Voltar</button>
              <button type="button" onClick={nextStep} disabled={!formData.hasAllergies} className="w-full bg-accent-green text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">Próximo</button>
            </div>
          </div>
        );
      case 5:
        return (
            <div key={step} className={`${animationClass} space-y-6`}>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Quais são seus objetivos?</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Personalize sua jornada para o sucesso.</p>
                </div>
                <div>
                    <label htmlFor="activityLevel" className={labelClasses}>Nível de Atividade Geral</label>
                    <select name="activityLevel" id="activityLevel" value={formData.activityLevel} onChange={handleChange} className={inputClasses}>
                        <option value="sedentary">Sedentário (pouco ou nenhum exercício)</option>
                        <option value="light">Levemente Ativo (exercício leve 1-3 dias/semana)</option>
                        <option value="moderate">Moderadamente Ativo (exercício moderado 3-5 dias/semana)</option>
                        <option value="very">Muito Ativo (exercício pesado 6-7 dias/semana)</option>
                        <option value="extra">Extremamente Ativo (trabalho físico + exercício)</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="goal" className={labelClasses}>Objetivo Principal</label>
                        <select name="goal" id="goal" value={formData.goal} onChange={handleChange} className={inputClasses}>
                            <option value="lose">Perder Peso</option>
                            <option value="maintain">Manter Peso</option>
                            <option value="gain">Ganhar Massa Muscular</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="targetWeight" className={labelClasses}>Peso Meta (kg)</label>
                        <input
                            type="number"
                            name="targetWeight"
                            id="targetWeight"
                            step="0.1"
                            value={formData.targetWeight}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="Ex: 65.0"
                        />
                         {formData.goal === 'lose' && formData.targetWeight && parseFloat(formData.targetWeight) >= parseFloat(formData.weight) && (
                            <p className="text-[10px] text-orange-500 mt-1">Para emagrecer, sua meta deve ser menor que o peso atual.</p>
                        )}
                        {formData.goal === 'gain' && formData.targetWeight && parseFloat(formData.targetWeight) <= parseFloat(formData.weight) && (
                            <p className="text-[10px] text-orange-500 mt-1">Para ganhar massa, sua meta deve ser maior que o peso atual.</p>
                        )}
                    </div>
                </div>
                
                <WaterGoalInput 
                  value={customWaterGoal}
                  onChange={(e) => setCustomWaterGoal(e.target.value)}
                  suggestion={suggestedWaterGoal}
                />

                <div className="flex justify-between space-x-4">
                    <button type="button" onClick={prevStep} className="w-full bg-gray-200 dark:bg-gray-600 text-light-text dark:text-dark-text p-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition">Voltar</button>
                    <button type="submit" className="w-full bg-accent-green text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition">Concluir e Começar!</button>
                </div>
            </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-300 font-sans">
      <div className="w-full max-w-lg mx-auto">
        <div className="flex justify-center mb-8">
          <LogoIcon />
        </div>
        
        <OnboardingProgress current={step} total={totalSteps} />
        
        <form onSubmit={handleSubmit} className="bg-light-card dark:bg-dark-card p-8 rounded-xl shadow-lg">
            {renderStepContent()}
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
