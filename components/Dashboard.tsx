
import React, { useMemo, useCallback } from 'react';
import { UserProfile, DailyLog, MealCategory, Food, FastingState } from '../types';
import { CalorieRing, Card, CardHeader, CardTitle, CardContent } from './CalorieRing';
import MacroDisplay from './MacroDisplay';
import MealCard from './MealCard';
import ProfileSummary from './ProfileSummary';
import IntermittentFasting from './IntermittentFasting';
import WaterTracker from './WaterTracker';
import { exportLogToCSV } from '../utils/exportUtils';
import { DownloadIcon } from './icons/DownloadIcon';
import MicronutrientTracker from './MicronutrientTracker';
import PerformanceChart from './WeeklyProgress';
import MealRecommendations from './MealRecommendations';
import Calendar from './Calendar';
import GoalsSummary from './GoalsSummary';
import NutrientGoalsSummary from './NutrientGoalsSummary';
import WeeklyChallenge from './WeeklyChallenge';
import { availableChallenges } from '../utils/challengeUtils';
import AppleHealthCard from './AppleHealthCard';
import MotivationalCoach from './MotivationalCoach';
import { FireIcon } from './icons/FireIcon';
import { StepsIcon } from './icons/StepsIcon';

interface DashboardProps {
  userProfile: UserProfile;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  selectedDateLog: DailyLog;
  dailyLogs: Record<string, Omit<DailyLog, 'micronutrientIntake'>>;
  onAddFoodClick: (meal: MealCategory) => void;
  onAddFoodToMeal: (foods: Food[], mealName: string) => void;
  onDeleteFood: (mealName: string, foodId: string) => void;
  onEditFood: (food: Food, mealName: string) => void;
  onUpdateGoal: (newGoal: 'lose' | 'maintain' | 'gain') => void;
  onSetWater: (amount: number) => void;
  onEditGoals: () => void;
  fastingState: FastingState;
  onStartFasting: (duration: number) => void;
  onStopFasting: () => void;
  onUpdateFastingTimes: (newTimes: { startTime?: number; endTime?: number }) => void;
  onFastingCompletionNotified: () => void;
  showCoach: boolean;
  onDismissCoach: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  userProfile, 
  selectedDate, 
  onDateChange, 
  selectedDateLog, 
  dailyLogs, 
  onAddFoodClick, 
  onAddFoodToMeal,
  onDeleteFood,
  onEditFood,
  onUpdateGoal, 
  onSetWater, 
  onEditGoals,
  fastingState,
  onStartFasting,
  onStopFasting,
  onUpdateFastingTimes,
  onFastingCompletionNotified,
  showCoach,
  onDismissCoach
}) => {
  
  const totals = useMemo(() => {
    return selectedDateLog.meals.reduce(
      (acc, meal) => {
        meal.items.forEach(item => {
          acc.calories += item.calories;
          acc.protein += item.protein;
          acc.carbs += item.carbs;
          acc.fat += item.fat;
        });
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [selectedDateLog.meals]);

  const caloriesBurned = useMemo(() => {
      const workoutCalories = selectedDateLog.workouts?.reduce((sum, workout) => sum + workout.calories_estimated, 0) || 0;
      const syncedCalories = (userProfile.integrations?.connectedServices.length > 0) ? 420 : 0; 
      return workoutCalories + syncedCalories;
  }, [selectedDateLog.workouts, userProfile.integrations]);

  const handleExport = useCallback(() => {
    const dateString = selectedDate.toISOString().split('T')[0];
    exportLogToCSV(selectedDateLog, dateString, userProfile);
  }, [selectedDate, selectedDateLog, userProfile]);
  
  const dynamicTitle = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    if (today.getTime() === selected.getTime()) {
      return "Resumo de Hoje";
    }
    return `Resumo de ${selected.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}`;
  }, [selectedDate]);
  
  return (
    <div className="space-y-6 pb-20 sm:pb-0">
       {userProfile.coach && (
            <MotivationalCoach
                userProfile={userProfile}
                onDismiss={onDismissCoach}
                isInitialView={true}
            />
        )}

       <div className="-mx-4 sm:mx-0">
           <Calendar 
                selectedDate={selectedDate}
                onDateChange={onDateChange}
                dailyLogs={dailyLogs}
                userProfile={userProfile}
            />
       </div>

      <div className="flex justify-between items-center px-1 sm:px-0">
        <h2 className="text-2xl sm:text-3xl font-black font-display text-gray-900 dark:text-white leading-tight">{dynamicTitle}</h2>
        <button 
          onClick={handleExport}
          className="p-2.5 bg-white dark:bg-dark-card rounded-2xl shadow-sm border dark:border-gray-800 text-gray-500"
          aria-label="Exportar CSV"
        >
          <DownloadIcon />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
              <ProfileSummary userProfile={userProfile} onUpdateGoal={onUpdateGoal} onEditGoals={onEditGoals} />
              
              {userProfile.integrations?.connectedServices.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-dark-card p-5 rounded-[2rem] shadow-sm border dark:border-gray-800 flex items-center justify-between">
                          <div className="flex items-center">
                              <div className="bg-accent-blue/10 p-3 rounded-2xl mr-4"><StepsIcon className="w-6 h-6 text-accent-blue" /></div>
                              <div>
                                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Passos</p>
                                  <p className="text-2xl font-black">{userProfile.integrations.metrics?.steps || 0}</p>
                              </div>
                          </div>
                      </div>
                      <div className="bg-white dark:bg-dark-card p-5 rounded-[2rem] shadow-sm border dark:border-gray-800 flex items-center justify-between">
                           <div className="flex items-center">
                              <div className="bg-orange-500/10 p-3 rounded-2xl mr-4"><FireIcon className="w-6 h-6 text-orange-500" /></div>
                              <div>
                                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Ativas</p>
                                  <p className="text-2xl font-black">{caloriesBurned} <span className="text-xs">kcal</span></p>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              <NutrientGoalsSummary userProfile={userProfile} onEdit={onEditGoals} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userProfile.mealCategories && userProfile.mealCategories.length > 0 && userProfile.mealCategories.map((category, index) => {
                    const mealData = selectedDateLog.meals.find(m => m.name === category.name);
                    return (
                        <MealCard
                            key={category.id}
                            mealCategory={category}
                            mealItems={mealData?.items || []}
                            onAddClick={() => onAddFoodClick(category)}
                            onDeleteFood={(foodId) => onDeleteFood(category.name, foodId)}
                            onEditFood={(food) => onEditFood(food, category.name)}
                            addFoodButtonId={index === 0 ? 'tutorial-add-food-button' : undefined}
                        />
                    );
                })}
              </div>
              
              <WaterTracker 
                consumed={selectedDateLog.waterIntake}
                goal={userProfile.goals.water}
                onSetWater={onSetWater}
              />
              
              <MealRecommendations 
                userProfile={userProfile}
                consumedTotals={totals}
                onAddFood={onAddFoodToMeal}
              />
          </div>

          <div className="space-y-6">
              <Card id="tutorial-calorie-ring" className="rounded-[2.5rem] border-none shadow-xl sm:border-solid sm:shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-black uppercase tracking-widest text-gray-400 text-center">Balanço Energético</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-8">
                      <CalorieRing
                          consumed={totals.calories}
                          goal={userProfile.goals.calories}
                      />
                      <div className="w-full space-y-5">
                          <MacroDisplay
                              label="Proteína"
                              consumed={totals.protein}
                              goal={userProfile.goals.protein}
                              color="bg-rose-400"
                          />
                          <MacroDisplay
                              label="Carboidratos"
                              consumed={totals.carbs}
                              goal={userProfile.goals.carbs}
                              color="bg-amber-300"
                          />
                          <MacroDisplay
                              label="Gordura"
                              consumed={totals.fat}
                              goal={userProfile.goals.fat}
                              color="bg-accent-blue/40"
                          />
                      </div>
                  </CardContent>
              </Card>

              {userProfile.challengeProgress && (() => {
                  const allChallenges = [...availableChallenges, ...(userProfile.customChallenges || [])];
                  const currentChallenge = allChallenges.find(c => c.id === userProfile.challengeProgress?.challengeId);
                  if (!currentChallenge) return null;
                  return (
                      <div id="tutorial-weekly-challenge">
                          <WeeklyChallenge challenge={currentChallenge} progress={userProfile.challengeProgress} />
                      </div>
                  );
              })()}

              <div id="tutorial-fasting-tracker">
                <IntermittentFasting 
                  fastingState={fastingState}
                  onStartFasting={onStartFasting}
                  onStopFasting={onStopFasting}
                  onUpdateFastingTimes={onUpdateFastingTimes}
                  onCompletionNotified={onFastingCompletionNotified}
                />
              </div>

              <div className="-mx-4 sm:mx-0">
                  <MicronutrientTracker
                    userProfile={userProfile}
                    dailyLog={selectedDateLog}
                  />
              </div>

              <GoalsSummary userProfile={userProfile} />
          </div>
      </div>
      
      <div className="-mx-4 sm:mx-0">
        <PerformanceChart dailyLogs={dailyLogs} userProfile={userProfile} selectedDate={selectedDate} />
      </div>
    </div>
  );
};

export default Dashboard;
