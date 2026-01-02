
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { UserProfile, DailyLog, Food, MealCategory, AuthUser, Post, AppNotification, FastingState, ReactionType, PostCategory, Reminder, Meal, Workout, Comment, Micronutrient, MicronutrientIntake } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import AddFoodModal from './components/AddFoodModal';
import Header from './components/Header';
import { calculateNutritionalGoals } from './utils/nutritionUtils';
import ProfileModal, { ProfileTab } from './components/ProfileModal';
import Auth from './components/Auth';
import CommunityFeed from './components/CommunityFeed';
import RecipesDashboard from './components/RecipesDashboard';
import WorkoutDashboard from './components/WorkoutDashboard';
import { getDefaultReminders } from './utils/reminderUtils';
import Toast from './components/Toast';
import ChangePasswordModal from './components/ChangePasswordModal';
import InteractiveTutorial from './components/InteractiveTutorial';
import { availableChallenges, getStartOfWeek, updateChallengeProgress } from './utils/challengeUtils';
import ReportsDashboard from './ReportsDashboard';
import Sidebar from './components/Sidebar';
import QuickViewSidebar from './components/QuickViewSidebar';
import RemindersModal from './components/RemindersModal';
import ChallengesModal from './components/ChallengesModal';
import AchievementsModal from './components/AchievementsModal';
import NotificationsModal from './components/NotificationsModal';
import GoPremiumModal from './GoPremiumModal';
import { defaultBrazilianFoods, LibraryFood } from './utils/brazilianFoodData';
import IntegrationsDashboard from './components/IntegrationsDashboard';
import FriendsDashboard from './components/FriendsDashboard';

type View = 'dashboard' | 'community' | 'recipes' | 'reports' | 'workouts' | 'integrations' | 'friends';
const initialFasting: FastingState = { isFasting: false, startTime: null, durationHours: 0, endTime: null, completionNotified: false };

const App: React.FC = () => {
  const [authUser, setAuthUser] = useLocalStorage<AuthUser | null>('calorix_authUser', null);
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>(authUser ? `userProfile_${authUser.uid}` : null, null);
  const [dailyLogs, setDailyLogs] = useLocalStorage<Record<string, Omit<DailyLog, 'micronutrientIntake'>>>(authUser ? `dailyLogs_${authUser.uid}` : null, {});
  const [notifications, setNotifications] = useLocalStorage<AppNotification[]>(authUser ? `notifications_${authUser.uid}` : null, []);
  const [foodLibrary, setFoodLibrary] = useLocalStorage<LibraryFood[]>('calorix_foodLibrary', defaultBrazilianFoods);
  const [fastingState, setFastingState] = useLocalStorage<FastingState>(authUser ? `fastingState_${authUser.email}` : null, initialFasting);
  
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('darkMode', false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [toast, setToast] = useState<{ message: string; id: number } | null>(null);
  const [mealToAdd, setMealToAdd] = useState<MealCategory | null>(null);
  const [initialProfileTab, setInitialProfileTab] = useState<ProfileTab>('profile');
  const [showCoach, setShowCoach] = useState(false);
  const [modals, setModals] = useState({ profile: false, addFood: false, sidebar: false, quickView: false, reminders: false, challenges: false, achievements: false, notifications: false, password: false, premium: false });

  const dateStr = selectedDate.toISOString().split('T')[0];
  const showToast = useCallback((msg: string) => setToast({ message: msg, id: Date.now() }), []);
  const updateModal = (key: keyof typeof modals, val: boolean) => setModals(p => ({ ...p, [key]: val }));

  // Dynamic Calculation of Micronutrients for the selected date
  const selectedDateLog = useMemo((): DailyLog => {
    const rawLog = dailyLogs[dateStr] || { meals: [], waterIntake: 0, workouts: [] };
    const micronutrientIntake: MicronutrientIntake = {};

    rawLog.meals.forEach(meal => {
      meal.items.forEach(item => {
        if (item.micronutrients) {
          (Object.keys(item.micronutrients) as Micronutrient[]).forEach(key => {
            const val = item.micronutrients![key] || 0;
            micronutrientIntake[key] = (micronutrientIntake[key] || 0) + val;
          });
        }
      });
    });

    return {
      ...rawLog,
      micronutrientIntake
    };
  }, [dailyLogs, dateStr]);

  useEffect(() => {
    if (userProfile && authUser && (!userProfile.reminders || !userProfile.coach?.avatar)) {
      setUserProfile({ ...userProfile, 
        reminders: userProfile.reminders || getDefaultReminders(),
        following: userProfile.following || [],
        savedPosts: userProfile.savedPosts || [],
        completedChallenges: userProfile.completedChallenges || [],
        units: userProfile.units || 'metric',
        integrations: userProfile.integrations || { connectedServices: [], syncHistory: [] },
        coach: { id: 'leo', name: 'Leo', avatar: 'https://images.pexels.com/photos/2220337/pexels-photo-2220337.jpeg?auto=compress&cs=tinysrgb&w=400' }
      });
    }
  }, [userProfile, authUser, setUserProfile]);

  const handleFollowUser = useCallback((email: string) => {
    if (!userProfile) return;
    const isFollowing = userProfile.following?.includes(email);
    setUserProfile({
        ...userProfile,
        following: isFollowing 
            ? userProfile.following?.filter(e => e !== email)
            : [...(userProfile.following || []), email]
    });
    showToast(isFollowing ? "Deixou de seguir." : "Agora você está seguindo!");
  }, [userProfile, setUserProfile, showToast]);

  const handleSavePost = useCallback((postId: string) => {
    if (!userProfile) return;
    const isSaved = userProfile.savedPosts?.includes(postId);
    setUserProfile({
        ...userProfile,
        savedPosts: isSaved
            ? userProfile.savedPosts?.filter(id => id !== postId)
            : [...(userProfile.savedPosts || []), postId]
    });
    showToast(isSaved ? "Removido dos salvos." : "Publicação salva!");
  }, [userProfile, setUserProfile, showToast]);

  const handleAddFoodsToLog = useCallback((foods: Food[], mealName: string) => {
    setDailyLogs(prev => {
      const currentLog = prev[dateStr] || { meals: [], waterIntake: 0 };
      const updatedMeals = [...currentLog.meals];
      const mealIndex = updatedMeals.findIndex(m => m.name === mealName);
      const foodsWithTimestamp = foods.map(f => ({ ...f, timestamp: Date.now() }));
      if (mealIndex > -1) {
        updatedMeals[mealIndex] = { ...updatedMeals[mealIndex], items: [...updatedMeals[mealIndex].items, ...foodsWithTimestamp] };
      } else {
        updatedMeals.push({ name: mealName, items: foodsWithTimestamp });
      }
      return { ...prev, [dateStr]: { ...currentLog, meals: updatedMeals } };
    });
    updateModal('addFood', false);
    showToast(`${foods.length} itens adicionados!`);
  }, [dateStr, showToast]);

  const handleDeleteFood = useCallback((mealName: string, foodId: string) => {
    setDailyLogs(prev => {
      const currentLog = prev[dateStr];
      if (!currentLog) return prev;
      const updatedMeals = currentLog.meals.map(m => {
        if (m.name === mealName) { return { ...m, items: m.items.filter(i => i.id !== foodId) }; }
        return m;
      });
      return { ...prev, [dateStr]: { ...currentLog, meals: updatedMeals } };
    });
    showToast("Item removido.");
  }, [dateStr, showToast]);

  const handleLogWorkout = useCallback((workout: Workout) => {
    setDailyLogs(prev => {
      const currentLog = prev[dateStr] || { meals: [], waterIntake: 0 };
      const updatedWorkouts = [...(currentLog.workouts || []), workout];
      return { ...prev, [dateStr]: { ...currentLog, workouts: updatedWorkouts } };
    });
    showToast("Treino registrado! 💪");
  }, [dateStr, showToast]);

  const handleSharePost = useCallback(async (text: string) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'calorix Community', text, url: 'https://calorix.app' });
      } else {
        await navigator.clipboard.writeText(text);
        showToast("Texto copiado!");
      }
    } catch (e) {}
  }, [showToast]);

  if (!authUser) return <Auth onLogin={setAuthUser} onRegister={setAuthUser} />;
  if (!userProfile) return <Onboarding onProfileCreate={setUserProfile} defaultName={authUser.name} />;
  if (!userProfile.hasCompletedTutorial) return <InteractiveTutorial onComplete={() => setUserProfile({ ...userProfile, hasCompletedTutorial: true })} />;

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen font-sans bg-light-bg-main dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors">
        <Header userProfile={userProfile} darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} onProfileClick={() => { setInitialProfileTab('profile'); updateModal('profile', true); }} currentView={currentView as any} onNavigate={setCurrentView as any} toggleSidebar={() => updateModal('sidebar', true)} toggleDataSidebar={() => updateModal('quickView', true)} unreadNotificationsCount={notifications.filter(n => !n.read).length} onNotificationsClick={() => updateModal('notifications', true)} onPremiumClick={() => updateModal('premium', true)} />
        <main className="max-w-7xl mx-auto p-4 sm:p-8">
          {currentView === 'dashboard' && <Dashboard userProfile={userProfile} selectedDate={selectedDate} onDateChange={setSelectedDate} selectedDateLog={selectedDateLog} dailyLogs={dailyLogs} onAddFoodClick={m => { setMealToAdd(m); updateModal('addFood', true); }} onAddFoodToMeal={handleAddFoodsToLog} onDeleteFood={handleDeleteFood} onUpdateGoal={(g) => setUserProfile({...userProfile, goal: g})} onSetWater={v => { const n = { ...dailyLogs }; n[dateStr] = { ...(n[dateStr] || { meals: [], waterIntake: 0 }), waterIntake: v }; setDailyLogs(n); }} onEditGoals={() => { setInitialProfileTab('goals'); updateModal('profile', true); }} fastingState={fastingState} onStartFasting={d => setFastingState({ isFasting: true, startTime: Date.now(), durationHours: d, endTime: Date.now() + d * 3600000, completionNotified: false })} onStopFasting={() => setFastingState(initialFasting)} onUpdateFastingTimes={(t) => setFastingState(p => ({...p, ...t}))} onFastingCompletionNotified={() => setFastingState(p => ({ ...p, completionNotified: true }))} showCoach={showCoach} onDismissCoach={() => setShowCoach(false)} />}
          {currentView === 'community' && <CommunityFeed currentUserProfile={userProfile} currentUserAuth={authUser} onFollowUser={handleFollowUser} onSavePost={handleSavePost} onSharePost={handleSharePost} />}
          {currentView === 'recipes' && <RecipesDashboard userProfile={userProfile} onAddRecipeToLog={handleAddFoodsToLog} />}
          {currentView === 'reports' && <ReportsDashboard userProfile={userProfile} dailyLogs={dailyLogs} onUpgradeClick={() => updateModal('premium', true)} />}
          {currentView === 'workouts' && <WorkoutDashboard userProfile={userProfile} dailyLogs={dailyLogs} onLogWorkout={handleLogWorkout} />}
          {currentView === 'integrations' && <IntegrationsDashboard userProfile={userProfile} onUpdateIntegrations={(d) => setUserProfile({...userProfile, integrations: {...userProfile.integrations, ...d}})} showToast={showToast} />}
          {currentView === 'friends' && <FriendsDashboard userProfile={userProfile} authUser={authUser} showToast={showToast} />}
        </main>
        <Sidebar isOpen={modals.sidebar} onClose={() => updateModal('sidebar', false)} userProfile={userProfile} currentView={currentView} onNavigate={v => { setCurrentView(v); updateModal('sidebar', false); }} onLogout={() => setAuthUser(null)} onRemindersClick={() => updateModal('reminders', true)} onChallengesClick={() => updateModal('challenges', true)} onAchievementsClick={() => updateModal('achievements', true)} />
        <QuickViewSidebar isOpen={modals.quickView} onClose={() => updateModal('quickView', false)} userProfile={userProfile} dailyLog={selectedDateLog} />
        {modals.addFood && mealToAdd && <AddFoodModal mealName={mealToAdd.name} onClose={() => updateModal('addFood', false)} onAddFoods={(f) => handleAddFoodsToLog(f, mealToAdd.name)} foodLibrary={foodLibrary} onUpdateFoodLibrary={setFoodLibrary} />}
        {modals.profile && <ProfileModal userProfile={userProfile} dailyLogs={dailyLogs} onClose={() => updateModal('profile', false)} onSave={d => setUserProfile({ ...userProfile, ...d })} onLogout={() => setAuthUser(null)} onUpdateWaterGoal={(g) => setUserProfile({...userProfile, goals: {...userProfile.goals, water: g}})} onChangePasswordClick={() => updateModal('password', true)} onUpgradeClick={() => updateModal('premium', true)} initialTab={initialProfileTab} darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />}
        {modals.reminders && <RemindersModal reminders={userProfile.reminders || []} onClose={() => updateModal('reminders', false)} onSave={r => setUserProfile({ ...userProfile, reminders: r })} />}
        {modals.challenges && <ChallengesModal userProfile={userProfile} onClose={() => updateModal('challenges', false)} onSelectChallenge={() => {}} onDisableChallenge={() => {}} onCreateAndSelectCustomChallenge={() => {}} />}
        {modals.achievements && <AchievementsModal userProfile={userProfile} onClose={() => updateModal('achievements', false)} />}
        {modals.notifications && <NotificationsModal notifications={notifications} onClose={() => updateModal('notifications', false)} onMarkAllAsRead={() => setNotifications(notifications.map(n => ({ ...n, read: true })))} />}
        {modals.password && <ChangePasswordModal onClose={() => updateModal('password', false)} onChangePassword={async () => ({ success: true, message: 'Sucesso' })} />}
        {modals.premium && <GoPremiumModal onClose={() => updateModal('premium', false)} onUpgrade={() => { setUserProfile({ ...userProfile, isPremium: true }); updateModal('premium', false); }} />}
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </div>
  );
};
export default App;
