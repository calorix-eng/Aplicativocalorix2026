
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extra';

// Micronutrients
export type Micronutrient = 'Vitamina C' | 'Cálcio' | 'Ferro' | 'Vitamina D' | 'Vitamina A' | 'Potássio' | 'Magnésio';

export type MicronutrientGoal = {
    [key in Micronutrient]?: {
        amount: number;
        unit: string;
    };
};

export type MicronutrientIntake = {
    [key in Micronutrient]?: number;
};

export interface AuthUser {
  uid: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Reminder {
  id: string;
  label: string;
  enabled: boolean;
  time?: string; // HH:MM
  interval?: number; // in hours
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'water' | 'deficit' | 'protein_goal' | 'log_streak' | 'low_carb';
  goalValue: number; // Number of days required
  durationDays: number; // How many progress slots to show in UI
  dailyTarget?: number; // e.g., for water challenge in ml or for low_carb in grams
  isCustom?: boolean;
}


export interface UserChallengeProgress {
  challengeId: string;
  startDate: string; // ISO date string para o início
  endDate?: string; // ISO date string para o fim (para desafios personalizados)
  progress: boolean[]; // Array que monitora a conclusão de cada dia
  completed: boolean;
  completionNotified?: boolean;
}

export interface CompletedChallenge {
    challengeId: string;
    dateCompleted: string; // ISO date string
}

export interface Exercise {
  id: string;
  name: string;
  type: string; // 'forca', 'cardio', 'core', etc.
  sets: number | string;
  reps: string;
  rest_s: number;
  muscle_group?: string;
  image_prompt?: string; 
  imageUrl?: string; 
}

export interface Workout {
  id: string;
  name?: string;
  date: string;
  duration_min: number;
  intensity: 'Iniciante' | 'Intermediário' | 'Avançado' | string;
  exercises: Exercise[];
  calories_estimated: number;
  completed?: boolean;
  is_manual?: boolean;
}

export interface HealthIntegration {
  id: string;
  name: string;
  description: string;
  iconType: 'google-fit' | 'apple-health' | 'samsung-health' | 'fitbit' | 'strava' | 'nike' | 'mfp' | 'garmin' | 'xiaomi' | 'amazfit' | 'huawei';
  connected: boolean;
  lastSync?: string;
  type: 'app' | 'device';
}

export interface SyncLog {
  id: string;
  timestamp: number;
  serviceName: string;
  dataType: string; // "Passos", "Calorias", "Sono", etc.
  value: string;
}

export interface HealthMetrics {
  steps: number;
  sleepMinutes: number;
  heartRateAvg: number;
  spo2: number;
  stressLevel: number;
  weight: number;
}

export interface UserProfile {
  name: string;
  avatar?: string;
  age: number;
  sex: 'male' | 'female' | 'prefer_not_to_say';
  weight: number; // in kg
  targetWeight?: number; // in kg
  height: number; // in cm
  goal: 'lose' | 'maintain' | 'gain';
  activityLevel: ActivityLevel;
  practicesSports?: boolean;
  activityType?: 'none' | 'weightlifting' | 'crossfit' | 'running' | 'swimming' | 'other';
  exercises?: string;
  hasAllergies?: boolean;
  allergies?: string[];
  units: 'metric' | 'imperial';
  isPremium?: boolean;
  hasCompletedTutorial?: boolean;
  coach?: {
    id: 'leo';
    name: string;
    avatar?: string;
  };
  customWaterGoal?: number; // in ml
  customGoals?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number; // in ml
    micronutrients: MicronutrientGoal;
  };
  mealCategories: MealCategory[];
  reminders?: Reminder[];
  following?: string[]; // Array of user emails
  savedPosts?: string[]; // Array of post IDs
  customChallenges?: Challenge[];
  challengeProgress?: UserChallengeProgress;
  completedChallenges?: CompletedChallenge[];
  integrations: {
    connectedServices: string[]; // List of IDs from HealthIntegration
    metrics?: HealthMetrics;
    syncHistory: SyncLog[];
  };
}

export interface MealCategory {
  id: string;
  name: string;
}

export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  micronutrients?: MicronutrientIntake;
  timestamp?: number;
}

export interface Meal {
  name: string;
  items: Food[];
}

export interface DailyLog {
  meals: Meal[];
  waterIntake: number; // in ml
  micronutrientIntake: MicronutrientIntake;
  workouts?: Workout[];
}

export interface FastingState {
  isFasting: boolean;
  startTime: number | null;
  durationHours: number;
  endTime: number | null;
  completionNotified: boolean;
}

export interface MealSuggestion {
  mealCategory: string; // ex: 'Almoço'
  food: Food;
  reasoning: string; // ex: 'Rico em proteínas para te ajudar a atingir sua meta.'
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: Food[];
  instructions: string[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  timeInMinutes: number;
  category: string;
  imagePrompt: string;
}

export interface Comment {
    id: string;
    author: {
        name: string;
        email: string;
        avatar?: string;
    };
    text: string;
    timestamp: number;
    reactions: {
        [key in ReactionType]?: string[];
    };
    replies: Comment[];
}

export type ReactionType = 'like' | 'love' | 'dislike';
export type PostCategory = 'motivation' | 'recipe' | 'tip';

export interface Post {
    id: string;
    author: {
        uid: string;
        name: string;
        email: string;
        avatar?: string;
    };
    text: string;
    imageUrl?: string;
    videoUrl?: string;
    timestamp: number;
    category: PostCategory;
    reactions: {
        [key in ReactionType]?: string[]; // Array of user emails for each reaction
    };
    comments: Comment[];
}

export interface AppNotification {
  id: string;
  recipientEmail: string;
  fromUser: {
      name: string;
      email: string;
      avatar?: string;
  };
  type: 'reaction' | 'comment' | 'follow';
  reactionType?: ReactionType;
  postId?: string;
  postTextSnippet?: string;
  read: boolean;
  timestamp: number;
}

export interface Action {
  id: number;
  type: 'ADD_FOODS' | 'SET_WATER' | 'SET_FASTING' | 'DELETE_FOOD' | 'ADD_WORKOUT';
  payload: any;
  timestamp: number;
}
