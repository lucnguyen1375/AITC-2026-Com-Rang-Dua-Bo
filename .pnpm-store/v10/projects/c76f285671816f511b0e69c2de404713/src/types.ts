export type NutritionValues = { caloriesKcal: number; proteinG: number; carbG: number; fatG: number };
export type TrainingDay = { weekday: number; isRestDay: boolean; startTime: string; durationMinutes: number };
export type UserProfile = { age: number; weightKg: number; heightCm: number; sex: 'male' | 'female' | 'unspecified'; goal: 'maintain' | 'gainMuscle' | 'loseFat'; trainingType: string; trainingIntensity: string; weekSchedule: TrainingDay[] };
export type NutritionSource = { id: string; title: string; url?: string; locator?: string; status: 'verified' | 'estimated' | 'unverified' };
export type FoodItem = { id: string; name: string; grams: number | null; preparation: string; nutrition: NutritionValues | null; sourceIds: string[]; estimated: boolean; missingInfo: string[] };
export type MealAnalysis = { items: FoodItem[]; knownTotal: NutritionValues; isComplete: boolean; assumptions: string[]; followUpQuestions: string[]; advice: string[]; sources: NutritionSource[]; mode: 'demo' | 'api'; unmatchedItems?: string[] };
export type SuggestedMeal = { name: string; items: FoodItem[]; total: NutritionValues };
export type DailyPlan = { weekday: number; targetMin: NutritionValues; targetMax: NutritionValues; suggestedMeals: SuggestedMeal[]; trainingAdvice: string[]; assumptions: string[]; sources: NutritionSource[]; mode: 'demo' | 'api' };
export type MealEntry = { id: string; dateKey: string; mealType: string; analysis: MealAnalysis; createdAt: string };
export type DailyCheckIn = { nutrition: boolean; training: boolean; nutritionNote?: string; trainingNote?: string };
export type CheckIns = Record<string, DailyCheckIn>;
export type PlanUpdate = { date: string; category: 'nutrition' | 'training'; checked?: boolean; note?: string };
export type ChatPlanContext = {
  today: string;
  selected_date: string;
  days: { date: string; label: string; is_rest_day: boolean; nutrition: boolean; training: boolean; nutrition_note?: string; training_note?: string }[];
  target?: { min: NutritionValues; max: NutritionValues };
  logged?: NutritionValues;
};
