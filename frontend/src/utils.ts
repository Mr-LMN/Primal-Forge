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

export const initialXP = (): XPState => ({
  total: 0,
  spent: 0,
  streak: 0,
  lastActiveDate: "",
  lastStreakBonusAt: 0,
  daily: {},
});
