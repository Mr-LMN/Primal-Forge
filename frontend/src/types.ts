import type { Sex, Goal, BfMode, ActivityTier, RiskLevel } from "./data";

export type Profile = {
  sex: Sex;
  weight: number;
  height: number;
  bodyFat: number;
  bfMode: BfMode;
  goal: Goal;
  tier: ActivityTier;
  lbm: number;
  bmr: number;
  tdee: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
  dietPreferences?: string[];   // e.g. ["dairy-free","carnivore"]
  allergens?: string[];         // e.g. ["gluten","shellfish"]
};

export type LogEntry = {
  id: string;
  foodId: string;
  name: string;
  amount: number;
  unit: string;
  grams: number;
  kcal: number;
  p: number;
  f: number;
  c: number;
  time: string;
  dateKey: string;
};

export type WeightEntry = { date: string; weight: number };

export type WorkoutLogged = { id: string; name: string; date: string };

export type BankHistoryEntry = { date: string; deficit: number };

export type XPDaily = {
  intelRead?: boolean;
  mealsXP?: number;
  workoutsXP?: number;
  macrosHit?: boolean;
  weighIn?: boolean;
};

export type XPState = {
  total: number;
  spent: number;
  streak: number;
  lastActiveDate: string;
  lastStreakBonusAt: number;
  daily: Record<string, XPDaily>;
};

export type ScanHistEntry = {
  id: string;
  label: string;
  score: number;
  verdict: RiskLevel;
  date: string;
  reds: number;
  ambers: number;
};

export type Tab = "hud" | "fuel" | "forge" | "scan" | "vault" | "trends";

export type Totals = { kcal: number; p: number; f: number; c: number };

/* ---------- AI Coach types ---------- */
export type CoachMessage = {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
};

export type CoachMode = "chat" | "workout" | "meal" | "supplement";

export type DietPreference = "carnivore" | "animal-based" | "keto" | "no-preference";

export type SupplementVerdict = {
  name: string;
  verdict: "keep" | "bin" | "conditional";
  score: number;
  summary: string;
  benefits: string[];
  risks: string[];
  evidence: { claim: string; source: string; strength: "strong" | "moderate" | "weak" }[];
  dosage?: string;
};

export type SupplementLogEntry = {
  id: string;
  name: string;
  verdict: "keep" | "bin" | "conditional";
  score: number;
  summary: string;
  date: string;
};

export type GeneratedWorkout = {
  name: string;
  focus: string;
  duration: number;
  intensity: string;
  warmup: string[];
  exercises: { name: string; setsReps: string; cue?: string }[];
  cooldown: string[];
  scienceNote?: string;
};

export type MealSuggestion = {
  name: string;
  description: string;
  kcal: number;
  p: number;
  f: number;
  c: number;
  ingredients: string[];
  prepTime: number;
};
