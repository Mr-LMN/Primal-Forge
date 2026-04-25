import { Alert, Linking, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { GOALS, round, type Sex, type Goal, type BfMode, type ActivityTier } from "./data";
import type { Profile, XPState } from "./types";

export const haptic = (
  style: "light" | "medium" | "heavy" | "success" | "warn" | "error" = "light"
) => {
  if (Platform.OS === "web") return;
  try {
    if (style === "success") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (style === "warn") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else if (style === "error") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else if (style === "medium") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else if (style === "heavy") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
};

export const confirmAction = (title: string, msg: string, onConfirm: () => void) => {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm(`${title}\n\n${msg}`)) onConfirm();
    return;
  }
  Alert.alert(title, msg, [
    { text: "Cancel", style: "cancel" },
    { text: "CONFIRM", style: "destructive", onPress: onConfirm },
  ]);
};

export const openYouTube = (q: string) => {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
  Linking.openURL(url).catch(() => {});
};

export const buildProfile = (p: {
  sex: Sex;
  weight: number;
  height: number;
  bodyFat: number;
  bfMode: BfMode;
  goal: Goal;
  tier: ActivityTier;
}): Profile => {
  const lbm = p.weight * (1 - p.bodyFat / 100);
  const bmr = 370 + 21.6 * lbm;
  const tdee = bmr * p.tier.multiplier;
  const goalCfg = GOALS.find((g) => g.id === p.goal)!;
  const calories = tdee * goalCfg.kcalAdj;
  const protein = p.weight * goalCfg.proPerKg;
  const carbs =
    p.tier.carbTarget * (p.goal === "fatloss" ? 0.7 : p.goal === "muscle" ? 1.2 : 1);
  const fat = Math.max(0, (calories - protein * 4 - carbs * 4) / 9);
  return {
    sex: p.sex,
    weight: p.weight,
    height: p.height,
    bodyFat: round(p.bodyFat, 1),
    bfMode: p.bfMode,
    goal: p.goal,
    tier: p.tier,
    lbm: round(lbm, 1),
    bmr: round(bmr),
    tdee: round(tdee),
    calories: round(calories),
    protein: round(protein),
    carbs: round(carbs),
    fat: round(fat),
    createdAt: new Date().toISOString(),
  };
};

export type MacroRem = { kcal: number; p: number; f: number; c: number };

// Fit-score for a recipe vs remaining daily macros. Pure maths, 0–100.
// Higher = better fit. Overshooting kcal penalised harder than undershooting.
export const fitScore = (
  r: { kcal: number; p: number; f: number; c: number },
  rem: MacroRem
): number => {
  if (rem.kcal <= 0) return 0;
  const dKcal = Math.abs(r.kcal - rem.kcal) / Math.max(rem.kcal, 200);
  const dP = Math.abs(r.p - rem.p) / Math.max(rem.p, 20);
  const dF = Math.abs(r.f - rem.f) / Math.max(rem.f, 15);
  const dC = Math.abs(r.c - rem.c) / Math.max(rem.c, 20);
  const overshoot = Math.max(0, r.kcal - rem.kcal) / Math.max(rem.kcal, 200);
  const dist = dKcal * 1.5 + dP * 1.2 + dF * 0.6 + dC * 0.6 + overshoot * 1.0;
  return Math.max(0, Math.min(100, Math.round(100 - dist * 30)));
};

type RecipeMacros = { id: string; kcal: number; p: number; f: number; c: number };

// Plain-English explainer of how a (possibly scaled) recipe fits remaining macros.
// Prioritises the largest signal so the line stays short.
export const fitReason = (
  r: { kcal: number; p: number; f: number; c: number },
  rem: MacroRem
): string => {
  if (rem.kcal <= 0) return "Goal hit — leftover-friendly pick.";
  const kcalDelta = r.kcal - rem.kcal;
  const pDelta = r.p - rem.p;
  const cDelta = r.c - rem.c;
  const fDelta = r.f - rem.f;
  const parts: string[] = [];
  if (Math.abs(kcalDelta) <= rem.kcal * 0.1)
    parts.push(`matches your remaining ${Math.round(rem.kcal)} kcal`);
  else if (kcalDelta > 0) parts.push(`over by ${Math.round(kcalDelta)} kcal`);
  else parts.push(`under by ${Math.round(-kcalDelta)} kcal`);
  // Pick the most distorted macro to surface
  const mags: [string, number][] = [
    ["protein", pDelta],
    ["carbs", cDelta],
    ["fat", fDelta],
  ];
  mags.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  const [name, delta] = mags[0];
  if (Math.abs(delta) >= 3) {
    const sign = delta > 0 ? "+" : "−";
    parts.push(`${sign}${Math.round(Math.abs(delta))}g ${name}`);
  }
  return parts.join(" · ");
};

// Greedy day-builder: pick best-fitting recipe per slot, then fill remaining
// kcal with snacks. Does not exceed the day's kcal budget by more than 10%.
export type PlannedSlot = "BREAKFAST" | "LUNCH" | "DINNER";
export type PlannedMeal<R extends RecipeMacros & { meal: string; name: string }> = {
  slot: PlannedSlot | "SNACK";
  recipe: R;
};

export const buildDayPlan = <R extends RecipeMacros & { meal: string; name: string }>(
  recipes: R[],
  rem: MacroRem
): PlannedMeal<R>[] => {
  if (rem.kcal <= 100 || recipes.length === 0) return [];
  const used = new Set<string>();
  const plan: PlannedMeal<R>[] = [];
  let budget: MacroRem = { ...rem };

  const ceiling = rem.kcal * 1.1; // allow up to 10% over total
  let spent = 0;

  const pickForSlot = (slot: PlannedSlot, mealTag: string) => {
    const candidates = recipes.filter(
      (r) =>
        !used.has(r.id) &&
        r.meal === mealTag &&
        spent + r.kcal <= ceiling
    );
    if (candidates.length === 0) return;
    const best = [...candidates]
      .map((r) => ({ r, score: fitScore(r, budget) }))
      .sort((a, b) => b.score - a.score)[0];
    if (!best || best.score <= 0) return;
    plan.push({ slot, recipe: best.r });
    used.add(best.r.id);
    spent += best.r.kcal;
    budget = {
      kcal: Math.max(0, budget.kcal - best.r.kcal),
      p: Math.max(0, budget.p - best.r.p),
      f: Math.max(0, budget.f - best.r.f),
      c: Math.max(0, budget.c - best.r.c),
    };
  };

  pickForSlot("BREAKFAST", "BREAKFAST");
  pickForSlot("LUNCH", "LUNCH");
  pickForSlot("DINNER", "DINNER");

  // Fill remaining kcal with snacks (smallest-first to avoid overshoot)
  const snackPool = [...recipes]
    .filter((r) => !used.has(r.id) && (r.meal === "SNACK" || r.meal === "POST-WO"))
    .sort((a, b) => a.kcal - b.kcal);
  for (const s of snackPool) {
    if (spent + s.kcal > ceiling) continue;
    if (budget.kcal < 80) break;
    plan.push({ slot: "SNACK", recipe: s });
    used.add(s.id);
    spent += s.kcal;
    budget = {
      kcal: Math.max(0, budget.kcal - s.kcal),
      p: Math.max(0, budget.p - s.p),
      f: Math.max(0, budget.f - s.f),
      c: Math.max(0, budget.c - s.c),
    };
  }

  return plan;
};

export const initialXP = (): XPState => ({
  total: 0,
  spent: 0,
  streak: 0,
  lastActiveDate: "",
  lastStreakBonusAt: 0,
  daily: {},
});
