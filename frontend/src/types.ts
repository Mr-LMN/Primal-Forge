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

export type Tab = "hud" | "fuel" | "forge" | "scan" | "vault";

export type Totals = { kcal: number; p: number; f: number; c: number };
