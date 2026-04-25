import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, Platform, KeyboardAvoidingView, Alert, Pressable, Animated, Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import {
  C, STORAGE, ACTIVITY_TIERS, GOALS, VISUAL_BF, FOODS, TIPS, WORKOUTS,
  FOCUS_META, XP_RULES, CREDIT_PER_XP, PERKS, EQUIPMENT_META,
  workoutRequiredEquipment, canPerform,
  round, todayKey, yesterdayKey, dayOfYear, navyBF,
  type Sex, type Goal, type BfMode, type ActivityTier, type Food, type Unit, type Workout, type WorkoutFocus,
  type Equipment,
} from "../src/data";
import { styles } from "../src/styles";

/* ---------- helpers ---------- */
const haptic = (style: "light" | "medium" | "heavy" | "success" | "warn" | "error" = "light") => {
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

const confirmAction = (title: string, msg: string, onConfirm: () => void) => {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm(`${title}\n\n${msg}`)) onConfirm();
    return;
  }
  Alert.alert(title, msg, [
    { text: "Cancel", style: "cancel" },
    { text: "CONFIRM", style: "destructive", onPress: onConfirm },
  ]);
};

const openYouTube = (q: string) => {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
  Linking.openURL(url).catch(() => {});
};

/* ---------- Profile ---------- */
type Profile = {
  sex: Sex; weight: number; height: number;
  bodyFat: number; bfMode: BfMode; goal: Goal; tier: ActivityTier;
  lbm: number; bmr: number; tdee: number;
  calories: number; protein: number; carbs: number; fat: number;
  createdAt: string;
};

const buildProfile = (p: {
  sex: Sex; weight: number; height: number; bodyFat: number; bfMode: BfMode;
  goal: Goal; tier: ActivityTier;
}): Profile => {
  const lbm = p.weight * (1 - p.bodyFat / 100);
  const bmr = 370 + 21.6 * lbm;
  const tdee = bmr * p.tier.multiplier;
  const goalCfg = GOALS.find((g) => g.id === p.goal)!;
  const calories = tdee * goalCfg.kcalAdj;
  const protein = p.weight * goalCfg.proPerKg;
  const carbs = p.tier.carbTarget * (p.goal === "fatloss" ? 0.7 : p.goal === "muscle" ? 1.2 : 1);
  const fat = Math.max(0, (calories - protein * 4 - carbs * 4) / 9);
  return {
    sex: p.sex, weight: p.weight, height: p.height,
    bodyFat: round(p.bodyFat, 1), bfMode: p.bfMode, goal: p.goal, tier: p.tier,
    lbm: round(lbm, 1), bmr: round(bmr), tdee: round(tdee),
    calories: round(calories), protein: round(protein), carbs: round(carbs), fat: round(fat),
    createdAt: new Date().toISOString(),
  };
};

type LogEntry = {
  id: string; foodId: string; name: string;
  amount: number; unit: string; grams: number;
  kcal: number; p: number; f: number; c: number;
  time: string; dateKey: string;
};
type WeightEntry = { date: string; weight: number };

type XPState = {
  total: number;
  spent: number;
  streak: number;
  lastActiveDate: string;
  lastStreakBonusAt: number; // streak count at which we last awarded bonus
  daily: Record<string, {
    intelRead?: boolean;
    mealsXP?: number;
    workoutsXP?: number;
    macrosHit?: boolean;
    weighIn?: boolean;
  }>;
};

const initialXP = (): XPState => ({
  total: 0, spent: 0, streak: 0,
  lastActiveDate: "", lastStreakBonusAt: 0, daily: {},
});

/* =========================================================
   ROOT
   ========================================================= */
export default function Index() {
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [bank, setBank] = useState(0);
  const [bankHistory, setBankHistory] = useState<{ date: string; deficit: number }[]>([]);
  const [waterMap, setWaterMap] = useState<Record<string, number>>({});
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  const [workoutsLogged, setWorkoutsLogged] = useState<{ id: string; name: string; date: string }[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [xp, setXp] = useState<XPState>(initialXP());
  const [tab, setTab] = useState<"hud" | "fuel" | "forge" | "scan" | "vault">("hud");
  const [weightModal, setWeightModal] = useState(false);
  const [intelModal, setIntelModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const items = await AsyncStorage.multiGet(Object.values(STORAGE));
      const map = Object.fromEntries(items);
      if (map[STORAGE.profile]) setProfile(JSON.parse(map[STORAGE.profile]!));
      if (map[STORAGE.log]) setLog(JSON.parse(map[STORAGE.log]!));
      if (map[STORAGE.bank]) setBank(parseFloat(map[STORAGE.bank]!));
      if (map[STORAGE.bankHistory]) setBankHistory(JSON.parse(map[STORAGE.bankHistory]!));
      if (map[STORAGE.water]) setWaterMap(JSON.parse(map[STORAGE.water]!));
      if (map[STORAGE.weights]) setWeights(JSON.parse(map[STORAGE.weights]!));
      if (map[STORAGE.recents]) setRecents(JSON.parse(map[STORAGE.recents]!));
      if (map[STORAGE.workouts]) setWorkoutsLogged(JSON.parse(map[STORAGE.workouts]!));
      if (map[STORAGE.equipment]) setEquipment(JSON.parse(map[STORAGE.equipment]!));
      if (map[STORAGE.xp]) {
        const parsed: XPState = JSON.parse(map[STORAGE.xp]!);
        // streak tick: if last active was yesterday, +1; if older, reset to 1
        const today = todayKey();
        if (parsed.lastActiveDate !== today) {
          if (parsed.lastActiveDate === yesterdayKey()) parsed.streak += 1;
          else parsed.streak = 1;
          parsed.lastActiveDate = today;
          await AsyncStorage.setItem(STORAGE.xp, JSON.stringify(parsed));
        }
        setXp(parsed);
      } else {
        const fresh = { ...initialXP(), streak: 1, lastActiveDate: todayKey() };
        await AsyncStorage.setItem(STORAGE.xp, JSON.stringify(fresh));
        setXp(fresh);
      }
      setLoaded(true);
    })();
  }, []);

  const persist = (k: string, v: string) => AsyncStorage.setItem(k, v);

  const showXpToast = (amount: number, label: string) => {
    haptic("success");
    setToast(`+${amount} XP · ${label}`);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1700),
      Animated.timing(toastOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setToast(null));
  };

  const addXP = async (amount: number, label: string, kind: keyof NonNullable<XPState["daily"][string]>, opts?: { mealCap?: boolean; workoutCap?: boolean }) => {
    const today = todayKey();
    const next: XPState = JSON.parse(JSON.stringify(xp));
    if (!next.daily[today]) next.daily[today] = {};
    const todayState = next.daily[today];

    if (kind === "intelRead") {
      if (todayState.intelRead) return;
      todayState.intelRead = true;
    } else if (kind === "mealsXP") {
      const cap = XP_RULES.mealCap * XP_RULES.mealLogged;
      const cur = todayState.mealsXP || 0;
      if (cur >= cap) return;
      todayState.mealsXP = Math.min(cap, cur + amount);
    } else if (kind === "workoutsXP") {
      const cap = XP_RULES.workoutCap * XP_RULES.workoutLogged;
      const cur = todayState.workoutsXP || 0;
      if (cur >= cap) return;
      todayState.workoutsXP = Math.min(cap, cur + amount);
    } else if (kind === "macrosHit") {
      if (todayState.macrosHit) return;
      todayState.macrosHit = true;
    } else if (kind === "weighIn") {
      if (todayState.weighIn) return;
      todayState.weighIn = true;
    }

    next.total += amount;

    // Streak bonus
    if (next.streak >= 7 && next.streak > next.lastStreakBonusAt && next.streak % 7 === 0) {
      next.total += XP_RULES.streak7Bonus;
      next.lastStreakBonusAt = next.streak;
      setTimeout(() => showXpToast(XP_RULES.streak7Bonus, `${next.streak}-DAY STREAK`), 1200);
    }

    setXp(next);
    await persist(STORAGE.xp, JSON.stringify(next));
    showXpToast(amount, label);
  };

  const saveProfile = async (p: Profile) => { setProfile(p); await persist(STORAGE.profile, JSON.stringify(p)); };
  const saveLog = async (next: LogEntry[]) => { setLog(next); await persist(STORAGE.log, JSON.stringify(next)); };
  const saveBank = async (val: number, history: { date: string; deficit: number }[]) => {
    setBank(val); setBankHistory(history);
    await persist(STORAGE.bank, String(val));
    await persist(STORAGE.bankHistory, JSON.stringify(history));
  };
  const saveWater = async (next: Record<string, number>) => { setWaterMap(next); await persist(STORAGE.water, JSON.stringify(next)); };
  const saveWeights = async (next: WeightEntry[]) => { setWeights(next); await persist(STORAGE.weights, JSON.stringify(next)); };
  const saveRecents = async (next: string[]) => { setRecents(next); await persist(STORAGE.recents, JSON.stringify(next)); };
  const saveWorkouts = async (next: { id: string; name: string; date: string }[]) => {
    setWorkoutsLogged(next);
    await persist(STORAGE.workouts, JSON.stringify(next));
  };
  const saveEquipment = async (next: Equipment[]) => {
    setEquipment(next);
    await persist(STORAGE.equipment, JSON.stringify(next));
  };

  const resetAll = async () => {
    await AsyncStorage.multiRemove(Object.values(STORAGE));
    setProfile(null); setLog([]); setBank(0); setBankHistory([]);
    setWaterMap({}); setWeights([]); setRecents([]); setWorkoutsLogged([]);
    setEquipment([]);
    setXp(initialXP());
  };

  /* Compute derived values (safe even when profile is null) — must be before any conditional return so hooks are stable. */
  const today = log.filter((e) => e.dateKey === todayKey());
  const totals = today.reduce(
    (a, e) => ({ kcal: a.kcal + e.kcal, p: a.p + e.p, f: a.f + e.f, c: a.c + e.c }),
    { kcal: 0, p: 0, f: 0, c: 0 }
  );
  const waterToday = waterMap[todayKey()] || 0;
  const waterTarget = profile ? Math.round(profile.weight * 35) : 0;

  /* Today's daily intel index */
  const intelIdx = dayOfYear() % TIPS.length;
  const todayTip = TIPS[intelIdx];
  const intelReadToday = !!xp.daily[todayKey()]?.intelRead;

  /* check macros hit (within ±10%) */
  const macrosHitNow = !!profile &&
    Math.abs(totals.p - profile.protein) / profile.protein < 0.1 &&
    Math.abs(totals.f - profile.fat) / profile.fat < 0.1 &&
    Math.abs(totals.c - profile.carbs) / Math.max(profile.carbs, 1) < 0.15 &&
    totals.kcal > 0;
  useEffect(() => {
    if (macrosHitNow && !xp.daily[todayKey()]?.macrosHit) {
      addXP(XP_RULES.macrosHit, "MACROS HIT", "macrosHit");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [macrosHitNow]);

  if (!loaded) {
    return (
      <View style={[styles.root, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={styles.brandSmall}>PRIMALFORGE</Text>
      </View>
    );
  }

  if (!profile) return <Onboarding onComplete={saveProfile} />;

  const handleLog = async (entry: LogEntry) => {
    haptic("light");
    await saveLog([...log, entry]);
    const nextRecents = [entry.foodId, ...recents.filter((id) => id !== entry.foodId)].slice(0, 6);
    await saveRecents(nextRecents);
    await addXP(XP_RULES.mealLogged, "MEAL LOGGED", "mealsXP");
  };

  const handleWorkoutLog = async (w: Workout) => {
    haptic("medium");
    const next = [{ id: w.id, name: w.name, date: todayKey() }, ...workoutsLogged].slice(0, 100);
    await saveWorkouts(next);
    await addXP(XP_RULES.workoutLogged, "WORKOUT DONE", "workoutsXP");
  };

  const handleIntelRead = async () => {
    if (intelReadToday) return;
    await addXP(XP_RULES.intelRead, "INTEL READ", "intelRead");
  };

  const handleWeightSave = async (kg: number) => {
    const next = [{ date: todayKey(), weight: kg }, ...weights.filter((w) => w.date !== todayKey())];
    await saveWeights(next);
    if (profile) await saveProfile(buildProfile({
      sex: profile.sex, weight: kg, height: profile.height, bodyFat: profile.bodyFat,
      bfMode: profile.bfMode, goal: profile.goal, tier: profile.tier,
    }));
    setWeightModal(false);
    await addXP(XP_RULES.weighIn, "WEIGH-IN", "weighIn");
  };

  const credits = Math.floor(xp.total / CREDIT_PER_XP) - xp.spent;

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <StatusBar style="light" />
      <View style={styles.shell}>
        <Header
          profile={profile}
          streak={xp.streak}
          credits={credits}
          onReset={resetAll}
          onWeight={() => { haptic(); setWeightModal(true); }}
        />
        <View style={{ flex: 1 }}>
          {tab === "hud" && (
            <HUDView
              profile={profile} totals={totals}
              waterMl={waterToday} waterTarget={waterTarget}
              tip={todayTip} intelReadToday={intelReadToday}
              onIntelTap={() => { haptic(); setIntelModal(true); }}
              addWater={async (delta) => {
                haptic("light");
                const next = { ...waterMap, [todayKey()]: Math.max(0, waterToday + delta) };
                await saveWater(next);
              }}
              weights={weights}
            />
          )}
          {tab === "fuel" && (
            <FuelView
              log={today} recents={recents}
              onLog={handleLog}
              onWipe={async () => saveLog(log.filter((e) => e.dateKey !== todayKey()))}
            />
          )}
          {tab === "forge" && (
            <ForgeView
              equipment={equipment}
              setEquipment={saveEquipment}
              onLogWorkout={handleWorkoutLog}
              loggedToday={workoutsLogged.filter((w) => w.date === todayKey())}
            />
          )}
          {tab === "scan" && <ScanView />}
          {tab === "vault" && (
            <VaultView
              profile={profile} xp={xp} credits={credits}
              bank={bank} bankHistory={bankHistory}
              consumedCarbs={totals.c}
              weights={weights} workoutsLogged={workoutsLogged}
              onBank={async () => {
                const deficit = profile.carbs - totals.c;
                if (deficit <= 0) { Alert.alert("NO DEFICIT", "Nothing to bank."); return; }
                if (bankHistory.find((h) => h.date === todayKey())) { Alert.alert("ALREADY BANKED", "Today's deficit is already in the vault."); return; }
                const newHist = [{ date: todayKey(), deficit: round(deficit, 1) }, ...bankHistory];
                await saveBank(round(bank + deficit, 1), newHist);
                haptic("success");
              }}
              onResetBank={async () => saveBank(0, [])}
              onSpendCredit={async (cost: number) => {
                if (credits < cost) return;
                const next = { ...xp, spent: xp.spent + cost };
                setXp(next);
                await persist(STORAGE.xp, JSON.stringify(next));
                haptic("success");
              }}
            />
          )}
        </View>
        <TabBar tab={tab} setTab={(t) => { haptic("light"); setTab(t); }} />
      </View>

      {toast && (
        <Animated.View style={[styles.xpToast, { opacity: toastOpacity }]} pointerEvents="none">
          <Ionicons name="flash" size={16} color={C.bg} />
          <Text style={styles.xpToastText}>{toast}</Text>
        </Animated.View>
      )}

      <WeightCheckIn visible={weightModal} onClose={() => setWeightModal(false)} weights={weights} onSave={handleWeightSave} />

      <Modal visible={intelModal} transparent animationType="fade" onRequestClose={() => setIntelModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIntelModal(false)}>
          <Pressable style={styles.modalScrollCard} onPress={(e) => e.stopPropagation()} testID="intel-modal">
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={[styles.intelTag, { marginBottom: 0 }]}>{todayTip.tag}</Text>
              <TouchableOpacity onPress={() => setIntelModal(false)}>
                <Ionicons name="close" size={22} color={C.text} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.intelTitle, { marginTop: 12 }]}>{todayTip.title}</Text>
            <Text style={styles.scienceBody}>{todayTip.body}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 14, gap: 8 }}>
              <View style={[styles.dot, { backgroundColor: C.science }]} />
              <Text style={styles.scienceCitation}>{todayTip.citation}</Text>
            </View>
            <TouchableOpacity
              testID="intel-ack-btn"
              onPress={async () => {
                await handleIntelRead();
                setIntelModal(false);
              }}
              style={[styles.primaryBtn, { marginTop: 18 }, intelReadToday && styles.primaryBtnDisabled]}
              disabled={intelReadToday}
            >
              <Text style={styles.primaryBtnText}>
                {intelReadToday ? "ALREADY CLAIMED" : `MARK READ · +${XP_RULES.intelRead} XP`}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

/* =========================================================
   HEADER
   ========================================================= */
function Header({ profile, streak, credits, onReset, onWeight }: {
  profile: Profile; streak: number; credits: number;
  onReset: () => void; onWeight: () => void;
}) {
  const goalLabel = GOALS.find((g) => g.id === profile.goal)?.label || "—";
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Text style={styles.brand}>PRIMALFORGE</Text>
        <Text style={styles.brandSub}>{goalLabel} · {profile.calories} kcal</Text>
      </View>
      {streak > 0 && (
        <View style={styles.streakChip} testID="streak-chip">
          <Ionicons name="flame" size={13} color={C.fire} />
          <Text style={styles.streakChipText}>{streak}</Text>
        </View>
      )}
      {credits > 0 && (
        <View style={styles.xpChip} testID="credits-chip">
          <Ionicons name="diamond" size={11} color={C.gold} />
          <Text style={styles.xpChipText}>{credits}</Text>
        </View>
      )}
      <TouchableOpacity testID="header-weight-btn" onPress={onWeight} style={[styles.iconBtn, { marginRight: 8 }]}>
        <Ionicons name="trending-down" size={18} color={C.textDim} />
      </TouchableOpacity>
      <TouchableOpacity
        testID="header-reset-btn"
        onPress={() => confirmAction("WIPE PROTOCOL", "Reset profile, logs, bank, XP?", onReset)}
        style={styles.iconBtn}
      >
        <Ionicons name="power" size={18} color={C.textDim} />
      </TouchableOpacity>
    </View>
  );
}

/* =========================================================
   ONBOARDING
   ========================================================= */
function Onboarding({ onComplete }: { onComplete: (p: Profile) => void }) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [sex, setSex] = useState<Sex | null>(null);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bfMode, setBfMode] = useState<BfMode>("manual");
  const [bfManual, setBfManual] = useState("");
  const [neck, setNeck] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [visualBf, setVisualBf] = useState<number | null>(null);
  const [tier, setTier] = useState<ActivityTier | null>(null);

  const computedBF = useMemo(() => {
    if (bfMode === "manual") return parseFloat(bfManual);
    if (bfMode === "visual") return visualBf ?? NaN;
    if (bfMode === "tape" && sex && height && neck && waist && (sex === "m" || hip)) {
      const h = parseFloat(height), n = parseFloat(neck), wa = parseFloat(waist), hp = parseFloat(hip || "0");
      if (h > 0 && n > 0 && wa > n) return navyBF(sex, h, n, wa, hp);
    }
    return NaN;
  }, [bfMode, bfManual, visualBf, sex, height, neck, waist, hip]);

  const step1Valid = goal !== null && goal !== "athlete";
  const step2Valid = sex !== null && parseFloat(weight) > 0 && parseFloat(height) > 0;
  const step3Valid = !isNaN(computedBF) && computedBF >= 3 && computedBF < 60;
  const step4Valid = tier !== null;
  const allValid = step1Valid && step2Valid && step3Valid && step4Valid;

  const preview = useMemo(() => {
    if (!allValid || !goal || !sex || !tier) return null;
    return buildProfile({
      sex, weight: parseFloat(weight), height: parseFloat(height),
      bodyFat: computedBF, bfMode, goal, tier,
    });
  }, [allValid, goal, sex, weight, height, computedBF, bfMode, tier]);

  const submit = () => { if (preview) { haptic("success"); onComplete(preview); } };
  const next = () => {
    haptic();
    if (step === 1 && step1Valid) setStep(2);
    else if (step === 2 && step2Valid) setStep(3);
    else if (step === 3 && step3Valid) setStep(4);
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.shell}>
        <ScrollView contentContainerStyle={styles.onboardScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.onboardHero}>
            <Text style={styles.onboardKicker}>STEP {step} / 4</Text>
            <Text style={styles.brand}>PRIMALFORGE</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]} />
            </View>
          </View>

          {step === 1 && (
            <View>
              <Text style={styles.stepTitle}>WHAT'S THE MISSION?</Text>
              <Text style={styles.stepSub}>Pick a primary objective. We'll calibrate the math to match.</Text>
              {GOALS.map((g) => {
                const active = goal === g.id;
                return (
                  <TouchableOpacity
                    key={g.id} testID={`goal-${g.id}`}
                    onPress={() => { if (!g.locked) { haptic(); setGoal(g.id); } }}
                    disabled={g.locked}
                    style={[styles.goalCard, active && styles.goalCardActive, g.locked && styles.goalCardLocked]}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text style={[styles.goalLabel, active && { color: C.text }]}>{g.label}</Text>
                        {g.locked && (
                          <View style={styles.lockTag}>
                            <Ionicons name="lock-closed" size={10} color={C.science} />
                            <Text style={styles.lockText}>LOCKED</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.goalSub}>{g.sub}</Text>
                    </View>
                    {active && <Ionicons name="checkmark-circle" size={22} color={C.optimal} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={styles.stepTitle}>VITALS</Text>
              <Text style={styles.stepSub}>Sex, weight, and height drive every calculation.</Text>
              <Text style={styles.label}>SEX</Text>
              <View style={styles.segRow}>
                {(["m", "f"] as Sex[]).map((s) => {
                  const active = sex === s;
                  return (
                    <TouchableOpacity key={s} testID={`sex-${s}`}
                      onPress={() => { haptic(); setSex(s); }}
                      style={[styles.segBtn, active && styles.segBtnActive]}>
                      <Text style={[styles.segText, active && { color: C.bg }]}>{s === "m" ? "MALE" : "FEMALE"}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.hint}>Required for the Navy Tape Method &amp; protein scaling.</Text>
              <View style={styles.onboardField}>
                <Text style={styles.label}>BODY WEIGHT · KG</Text>
                <TextInput testID="onboard-weight-input" value={weight} onChangeText={setWeight}
                  placeholder="84" placeholderTextColor={C.textMute} keyboardType="decimal-pad" style={styles.input} />
              </View>
              <View style={styles.onboardField}>
                <Text style={styles.label}>HEIGHT · CM</Text>
                <TextInput testID="onboard-height-input" value={height} onChangeText={setHeight}
                  placeholder="178" placeholderTextColor={C.textMute} keyboardType="decimal-pad" style={styles.input} />
              </View>
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={styles.stepTitle}>BODY COMPOSITION</Text>
              <Text style={styles.stepSub}>Three ways to find Active Metabolic Weight. Pick what suits you.</Text>
              <View style={styles.modeRow}>
                {([
                  { id: "manual", label: "I KNOW IT" },
                  { id: "tape", label: "TAPE METHOD" },
                  { id: "visual", label: "VISUAL" },
                ] as { id: BfMode; label: string }[]).map((m) => {
                  const active = bfMode === m.id;
                  return (
                    <TouchableOpacity key={m.id} testID={`bfmode-${m.id}`}
                      onPress={() => { haptic(); setBfMode(m.id); }}
                      style={[styles.modeBtn, active && styles.modeBtnActive]}>
                      <Text style={[styles.modeText, active && { color: C.bg }]}>{m.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {bfMode === "manual" && (
                <View style={styles.onboardField}>
                  <Text style={styles.label}>BODY FAT · %</Text>
                  <TextInput testID="onboard-bf-input" value={bfManual} onChangeText={setBfManual}
                    placeholder="15" placeholderTextColor={C.textMute} keyboardType="decimal-pad" style={styles.input} />
                  <Text style={styles.hint}>DEXA &gt; calipers &gt; mirror.</Text>
                </View>
              )}
              {bfMode === "tape" && (
                <View>
                  <Text style={styles.hint}>US Navy circumference method. Soft tape, no compression. ±3% of DEXA.</Text>
                  {!sex && (
                    <View style={styles.warnBox}>
                      <Ionicons name="warning" size={16} color={C.warning} />
                      <Text style={styles.warnText}>Set sex in Step 2 first.</Text>
                    </View>
                  )}
                  <View style={styles.onboardField}>
                    <Text style={styles.label}>NECK · CM (below larynx)</Text>
                    <TextInput testID="tape-neck-input" value={neck} onChangeText={setNeck}
                      placeholder="38" placeholderTextColor={C.textMute} keyboardType="decimal-pad" style={styles.input} />
                  </View>
                  <View style={styles.onboardField}>
                    <Text style={styles.label}>WAIST · CM (at navel)</Text>
                    <TextInput testID="tape-waist-input" value={waist} onChangeText={setWaist}
                      placeholder="84" placeholderTextColor={C.textMute} keyboardType="decimal-pad" style={styles.input} />
                  </View>
                  {sex === "f" && (
                    <View style={styles.onboardField}>
                      <Text style={styles.label}>HIP · CM (widest point)</Text>
                      <TextInput testID="tape-hip-input" value={hip} onChangeText={setHip}
                        placeholder="98" placeholderTextColor={C.textMute} keyboardType="decimal-pad" style={styles.input} />
                    </View>
                  )}
                  {!isNaN(computedBF) && computedBF >= 3 && (
                    <View style={styles.computedBox}>
                      <Text style={styles.computedLabel}>ESTIMATED BF%</Text>
                      <Text style={styles.computedValue}>{round(computedBF, 1)}%</Text>
                    </View>
                  )}
                </View>
              )}
              {bfMode === "visual" && (
                <View>
                  {!sex && (
                    <View style={styles.warnBox}>
                      <Ionicons name="warning" size={16} color={C.warning} />
                      <Text style={styles.warnText}>Set sex in Step 2 first.</Text>
                    </View>
                  )}
                  {sex && VISUAL_BF[sex].map((v) => {
                    const active = visualBf === v.bf;
                    return (
                      <TouchableOpacity key={v.id} testID={`visual-${v.id}`}
                        onPress={() => { haptic(); setVisualBf(v.bf); }}
                        style={[styles.visualCard, active && styles.visualCardActive]}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.visualLabel, active && { color: C.text }]}>{v.label}</Text>
                          <Text style={styles.visualSub}>{v.sub}</Text>
                        </View>
                        <Text style={styles.visualBf}>{v.bf}%</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {step === 4 && (
            <View>
              <Text style={styles.stepTitle}>TRAINING LOAD</Text>
              <Text style={styles.stepSub}>Your true daily output. Be honest.</Text>
              {ACTIVITY_TIERS.map((t) => {
                const active = tier?.id === t.id;
                return (
                  <TouchableOpacity key={t.id} testID={`onboard-tier-${t.id}`}
                    onPress={() => { haptic(); setTier(t); }}
                    style={[styles.tierBtn, active && styles.tierBtnActive]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.tierLabel, active && { color: C.text }]}>{t.label}</Text>
                      <Text style={styles.tierSub}>{t.sub}</Text>
                    </View>
                    <View style={styles.tierMeta}>
                      <Text style={styles.tierMetaTop}>×{t.multiplier}</Text>
                      <Text style={styles.tierMetaBot}>{t.carbTarget}g C</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              {preview && (
                <View style={styles.previewCard} testID="onboard-preview">
                  <Text style={styles.previewKicker}>YOUR FORGE</Text>
                  <View style={styles.previewRow}>
                    <PreviewStat label="LBM" value={`${preview.lbm} kg`} />
                    <PreviewStat label="BMR" value={`${preview.bmr}`} />
                    <PreviewStat label="TDEE" value={`${preview.tdee}`} />
                  </View>
                  <View style={styles.previewBig}>
                    <Text style={styles.previewBigLabel}>DAILY KCAL TARGET</Text>
                    <Text style={styles.previewBigValue}>{preview.calories}</Text>
                  </View>
                  <View style={styles.previewMacros}>
                    <PreviewMacro label="P" value={`${preview.protein}g`} color={C.science} />
                    <PreviewMacro label="F" value={`${preview.fat}g`} color={C.warning} />
                    <PreviewMacro label="C" value={`${preview.carbs}g`} color={C.optimal} />
                  </View>
                </View>
              )}
            </View>
          )}

          <View style={styles.navRow}>
            {step > 1 && (
              <TouchableOpacity testID="onboard-back-btn" onPress={() => { haptic(); setStep(step - 1); }} style={styles.secondaryBtn}>
                <Ionicons name="arrow-back" size={16} color={C.text} />
                <Text style={styles.secondaryBtnText}>BACK</Text>
              </TouchableOpacity>
            )}
            {step < 4 ? (
              <TouchableOpacity testID="onboard-next-btn"
                disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid) || (step === 3 && !step3Valid)}
                onPress={next}
                style={[styles.primaryBtn, { flex: 1 },
                  ((step === 1 && !step1Valid) || (step === 2 && !step2Valid) || (step === 3 && !step3Valid)) && styles.primaryBtnDisabled]}>
                <Text style={styles.primaryBtnText}>NEXT →</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity testID="onboard-submit-btn" disabled={!allValid} onPress={submit}
                style={[styles.primaryBtn, { flex: 1 }, !allValid && styles.primaryBtnDisabled]}>
                <Text style={styles.primaryBtnText}>FORGE PROFILE →</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.onboardFooter}>LBM = W × (1 − BF/100) · BMR = 370 + 21.6 × LBM · TDEE = BMR × Activity</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (<View style={styles.previewStat}><Text style={styles.previewStatLabel}>{label}</Text><Text style={styles.previewStatValue}>{value}</Text></View>);
}
function PreviewMacro({ label, value, color }: { label: string; value: string; color: string }) {
  return (<View style={[styles.previewMacro, { borderColor: color }]}><Text style={[styles.previewMacroLabel, { color }]}>{label}</Text><Text style={styles.previewMacroValue}>{value}</Text></View>);
}

/* =========================================================
   HUD VIEW
   ========================================================= */
function HUDView({
  profile, totals, waterMl, waterTarget, addWater, weights, tip, intelReadToday, onIntelTap,
}: {
  profile: Profile;
  totals: { kcal: number; p: number; f: number; c: number };
  waterMl: number; waterTarget: number;
  addWater: (delta: number) => void;
  weights: WeightEntry[];
  tip: typeof TIPS[0];
  intelReadToday: boolean;
  onIntelTap: () => void;
}) {
  const carbDelta = totals.c - profile.carbs;
  let carbStatus: "optimal" | "warning" | "penalty" = "optimal";
  if (carbDelta > 20) carbStatus = "penalty";
  else if (carbDelta > 0) carbStatus = "warning";
  const burpees = carbDelta > 20 ? Math.ceil((Math.max(0, carbDelta) * 4) / 1.4) : 0;
  const lastWeight = weights[0];
  const trend = weights.length >= 2 ? weights[0].weight - weights[weights.length - 1].weight : 0;

  return (
    <ScrollView contentContainerStyle={styles.scrollPad} testID="hud-view">
      <Text style={styles.sectionKicker}>HUD · {todayKey()}</Text>

      {/* DAILY INTEL — replaces Arsenal's old role */}
      <TouchableOpacity
        testID="daily-intel-card"
        onPress={onIntelTap}
        activeOpacity={0.85}
        style={[styles.intelCard, intelReadToday && styles.intelCardRead]}
      >
        <View style={styles.intelHeader}>
          <Text style={styles.intelKicker}>DAILY INTEL</Text>
          {!intelReadToday && (
            <View style={styles.intelXpBadge}>
              <Ionicons name="flash" size={10} color={C.gold} />
              <Text style={styles.intelXpBadgeText}>+{XP_RULES.intelRead} XP</Text>
            </View>
          )}
          {intelReadToday && (
            <View style={styles.intelXpBadge}>
              <Ionicons name="checkmark" size={10} color={C.optimal} />
              <Text style={[styles.intelXpBadgeText, { color: C.optimal }]}>CLAIMED</Text>
            </View>
          )}
        </View>
        <Text style={styles.intelTag}>{tip.tag}</Text>
        <Text style={styles.intelTitle}>{tip.title}</Text>
        <Text style={styles.intelTease} numberOfLines={2}>{tip.body}</Text>
        <Text style={styles.intelTapHint}>TAP TO READ →</Text>
      </TouchableOpacity>

      <View style={styles.macroGrid}>
        <MacroBar label="CALORIES" unit="kcal" value={totals.kcal} target={profile.calories} color={C.text} />
        <MacroBar label="PROTEIN" unit="g" value={totals.p} target={profile.protein} color={C.science} />
        <MacroBar label="FAT" unit="g" value={totals.f} target={profile.fat} color={C.warning} />
        <MacroBar label="CARBS" unit="g" value={totals.c} target={profile.carbs} color={
          carbStatus === "optimal" ? C.optimal : carbStatus === "warning" ? C.warning : C.penalty} />
      </View>

      <CarbStatusCard status={carbStatus} delta={carbDelta} target={profile.carbs} consumed={totals.c} />
      {burpees > 0 && <BurpeePenalty burpees={burpees} />}

      <View style={styles.waterCard} testID="water-card">
        <View style={styles.waterHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.waterLabel}>HYDRATION · WATER</Text>
            <Text style={styles.waterValue}>{waterMl} <Text style={styles.waterTarget}>/ {waterTarget} ml</Text></Text>
          </View>
          <Ionicons name="water" size={28} color={C.science} />
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${Math.min(100, (waterMl / waterTarget) * 100)}%`, backgroundColor: C.science }]} />
        </View>
        <View style={styles.waterBtnRow}>
          <TouchableOpacity testID="water-minus-btn" onPress={() => addWater(-250)} style={styles.waterBtn}>
            <Ionicons name="remove" size={18} color={C.text} /><Text style={styles.waterBtnText}>250ml</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="water-plus-btn" onPress={() => addWater(250)} style={[styles.waterBtn, styles.waterBtnPrimary]}>
            <Ionicons name="add" size={18} color={C.bg} /><Text style={[styles.waterBtnText, { color: C.bg }]}>250ml</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="water-500-btn" onPress={() => addWater(500)} style={[styles.waterBtn, styles.waterBtnPrimary]}>
            <Ionicons name="add" size={18} color={C.bg} /><Text style={[styles.waterBtnText, { color: C.bg }]}>500ml</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.miniStats}>
        <MiniStat label="LBM" value={`${profile.lbm} kg`} />
        <MiniStat label="BMR" value={`${profile.bmr}`} />
        <MiniStat label="TDEE" value={`${profile.tdee}`} />
      </View>

      {lastWeight && (
        <View style={styles.weightTrendCard} testID="weight-trend">
          <View style={{ flex: 1 }}>
            <Text style={styles.weightTrendLabel}>LATEST WEIGH-IN</Text>
            <Text style={styles.weightTrendValue}>{lastWeight.weight} kg</Text>
            <Text style={styles.weightTrendDate}>{lastWeight.date}</Text>
          </View>
          {weights.length >= 2 && (
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.weightTrendLabel}>TREND</Text>
              <Text style={[styles.weightTrendDelta, { color: trend < 0 ? C.optimal : trend > 0 ? C.warning : C.textDim }]}>
                {trend > 0 ? "+" : ""}{round(trend, 1)} kg
              </Text>
              <Text style={styles.weightTrendDate}>over {weights.length} entries</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function MacroBar({ label, unit, value, target, color }: { label: string; unit: string; value: number; target: number; color: string }) {
  const pct = Math.min(100, target > 0 ? (value / target) * 100 : 0);
  return (
    <View style={styles.macroCard} testID={`macro-${label.toLowerCase()}`}>
      <Text style={styles.macroLabel}>{label}</Text>
      <View style={styles.macroValueRow}>
        <Text style={styles.macroValue}>{round(value, 1)}</Text>
        <Text style={styles.macroTarget}> / {round(target)} {unit}</Text>
      </View>
      <View style={styles.barTrack}><View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} /></View>
    </View>
  );
}

function CarbStatusCard({ status, delta, target, consumed }: { status: "optimal" | "warning" | "penalty"; delta: number; target: number; consumed: number }) {
  const color = status === "optimal" ? C.optimal : status === "warning" ? C.warning : C.penalty;
  const tag = status === "optimal" ? "OPTIMAL" : status === "warning" ? "WARNING" : "OVERFLOW";
  const detail = status === "optimal"
    ? `${round(target - consumed, 1)}g under target. Glycogen stable.`
    : status === "warning"
    ? `+${round(delta, 1)}g over. Within tolerance.`
    : `+${round(delta, 1)}g over. Penalty engaged.`;
  return (
    <View style={[styles.statusCard, { borderColor: color }]} testID="carb-status-card">
      <View style={styles.statusHeader}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[styles.statusTag, { color }]}>CARB STATUS · {tag}</Text>
      </View>
      <Text style={styles.statusDetail}>{detail}</Text>
    </View>
  );
}

function BurpeePenalty({ burpees }: { burpees: number }) {
  const [siphon, setSiphon] = useState(false);
  const blocks = useMemo(() => {
    if (burpees <= 50) return [];
    const per = Math.ceil(burpees / 6);
    return Array.from({ length: 6 }, (_, i) => ({ idx: i + 1, offset: i * 30, reps: per }));
  }, [burpees]);
  return (
    <View style={styles.penaltyCard} testID="burpee-penalty">
      <Text style={styles.penaltyTag}>EXCESS CARB DEBT</Text>
      <Text style={styles.penaltyValue} testID="burpee-count">🔴 {burpees} BURPEES REQUIRED</Text>
      <Text style={styles.penaltyFormula}>((excess × 4 kcal) ÷ 1.4) — repay glycogen surplus or store as adipose.</Text>
      {burpees > 50 && (
        <TouchableOpacity testID="siphon-alarm-btn" onPress={() => { haptic("warn"); setSiphon(true); }} style={styles.siphonBtn}>
          <Ionicons name="alarm-outline" size={16} color={C.bg} />
          <Text style={styles.siphonBtnText}>INITIATE SIPHON ALARM</Text>
        </TouchableOpacity>
      )}
      <Modal visible={siphon} transparent animationType="fade" onRequestClose={() => setSiphon(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard} testID="siphon-modal">
            <Text style={styles.modalTitle}>SIPHON PROTOCOL</Text>
            <Text style={styles.modalSub}>Burpees fragmented across 3 hours. Every 30 min. GLUT4 stays open.</Text>
            {blocks.map((b) => (
              <View key={b.idx} style={styles.block}>
                <Text style={styles.blockIdx}>0{b.idx}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.blockTime}>+{b.offset} MIN</Text>
                  <Text style={styles.blockReps}>{b.reps} BURPEES</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity onPress={() => setSiphon(false)} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>ACKNOWLEDGE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (<View style={styles.miniStatBox}><Text style={styles.miniStatLabel}>{label}</Text><Text style={styles.miniStatValue}>{value}</Text></View>);
}

/* =========================================================
   FUEL VIEW
   ========================================================= */
function FuelView({ log, recents, onLog, onWipe }: {
  log: LogEntry[]; recents: string[];
  onLog: (e: LogEntry) => void; onWipe: () => void;
}) {
  const [picker, setPicker] = useState(false);
  const [selected, setSelected] = useState<Food | null>(null);
  const [unit, setUnit] = useState<Unit>({ id: "g", label: "g", g: 1 });
  const [amount, setAmount] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return FOODS;
    return FOODS.filter((f) => f.name.toLowerCase().includes(q) || f.cat.toLowerCase().includes(q));
  }, [search]);

  const recentFoods = useMemo(
    () => recents.map((id) => FOODS.find((f) => f.id === id)).filter(Boolean) as Food[],
    [recents]
  );

  const availableUnits = useMemo<Unit[]>(() => {
    const base: Unit = { id: "g", label: "g", g: 1 };
    return [base, ...(selected?.units ?? [])];
  }, [selected]);

  const pickFood = (f: Food) => {
    haptic();
    setSelected(f);
    setUnit({ id: "g", label: "g", g: 1 });
    setPicker(false);
    setSearch("");
  };

  const submit = () => {
    const n = parseFloat(amount);
    if (!selected || !n || n <= 0) return;
    const grams = n * unit.g;
    const ratio = grams / 100;
    const entry: LogEntry = {
      id: `${Date.now()}`, foodId: selected.id, name: selected.name,
      amount: n, unit: unit.label, grams: round(grams, 1),
      kcal: round(selected.kcal * ratio, 1),
      p: round(selected.p * ratio, 1),
      f: round(selected.f * ratio, 1),
      c: round(selected.c * ratio, 1),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      dateKey: todayKey(),
    };
    onLog(entry);
    setSelected(null);
    setAmount("");
  };

  const preview = useMemo(() => {
    const n = parseFloat(amount);
    if (!selected || !n || n <= 0) return null;
    const ratio = (n * unit.g) / 100;
    return {
      kcal: round(selected.kcal * ratio, 1),
      p: round(selected.p * ratio, 1),
      f: round(selected.f * ratio, 1),
      c: round(selected.c * ratio, 1),
    };
  }, [selected, amount, unit]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollPad} keyboardShouldPersistTaps="handled" testID="fuel-view">
        <Text style={styles.sectionKicker}>FUEL · LOG WHOLE FOODS</Text>

        {recentFoods.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.subKicker}>RECENT</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {recentFoods.map((f) => (
                <TouchableOpacity key={f.id} testID={`recent-${f.id}`} onPress={() => pickFood(f)} style={styles.recentChip}>
                  <Text style={styles.recentChipText} numberOfLines={1}>{f.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <TouchableOpacity testID="open-food-picker" onPress={() => { haptic(); setPicker(true); }} style={styles.foodPickerBtn}>
          <View style={{ flex: 1 }}>
            <Text style={styles.foodPickerLabel}>FOOD</Text>
            <Text style={styles.foodPickerValue}>{selected ? selected.name : "Tap to select…"}</Text>
            {selected && <Text style={styles.foodPickerMeta}>{selected.kcal} kcal · {selected.p}P / {selected.f}F / {selected.c}C per 100g</Text>}
          </View>
          <Ionicons name="chevron-down" size={20} color={C.textDim} />
        </TouchableOpacity>

        {selected && availableUnits.length > 1 && (
          <View style={{ marginBottom: 14 }}>
            <Text style={styles.label}>UNIT</Text>
            <View style={styles.unitRow}>
              {availableUnits.map((u) => {
                const active = unit.id === u.id;
                return (
                  <TouchableOpacity key={u.id} testID={`unit-${u.id}`}
                    onPress={() => { haptic(); setUnit(u); }}
                    style={[styles.unitChip, active && styles.unitChipActive]}>
                    <Text style={[styles.unitChipText, active && { color: C.bg }]}>{u.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.onboardField}>
          <Text style={styles.label}>{unit.id === "g" ? "GRAMS" : `AMOUNT · ${unit.label.toUpperCase()}`}</Text>
          <TextInput testID="fuel-amount-input" value={amount} onChangeText={setAmount}
            placeholder={unit.id === "g" ? "200" : "1"} placeholderTextColor={C.textMute}
            keyboardType="decimal-pad" style={styles.input} />
          {preview && (
            <Text style={styles.previewInline} testID="fuel-preview">
              ≈ {preview.kcal} kcal · {preview.p}P / {preview.f}F / {preview.c}C
            </Text>
          )}
        </View>

        <TouchableOpacity testID="fuel-log-btn" onPress={submit}
          disabled={!selected || !amount}
          style={[styles.primaryBtn, (!selected || !amount) && styles.primaryBtnDisabled]}>
          <Text style={styles.primaryBtnText}>LOG INTAKE · +{XP_RULES.mealLogged} XP</Text>
        </TouchableOpacity>

        <View style={styles.todayLogHeader}>
          <Text style={styles.sectionKicker}>TODAY'S LOG · {log.length}</Text>
          {log.length > 0 && (
            <TouchableOpacity testID="wipe-day-btn"
              onPress={() => confirmAction("WIPE DAY", "Erase today's log?", onWipe)}>
              <Text style={styles.wipeText}>WIPE DAY</Text>
            </TouchableOpacity>
          )}
        </View>

        {log.length === 0 ? (
          <View style={styles.emptyBox}><Text style={styles.emptyText}>No intake logged. Eat or fast.</Text></View>
        ) : (
          [...log].reverse().map((e) => (
            <View key={e.id} style={styles.logCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.logName}>{e.name}</Text>
                <Text style={styles.logMeta}>{e.amount} {e.unit}{e.unit !== "g" ? ` (${e.grams}g)` : ""} · {e.time}</Text>
              </View>
              <View style={styles.logMacros}>
                <Text style={styles.logKcal}>{e.kcal} kcal</Text>
                <Text style={styles.logBreak}>{e.p}P · {e.f}F · {e.c}C</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={picker} animationType="slide" onRequestClose={() => setPicker(false)}>
        <SafeAreaView style={[styles.root, { flex: 1 }]} edges={["top", "bottom"]}>
          <View style={styles.shell}>
            <View style={styles.pickerHeader}>
              <Text style={styles.brand}>SELECT FOOD</Text>
              <TouchableOpacity onPress={() => setPicker(false)} testID="close-food-picker">
                <Ionicons name="close" size={26} color={C.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.searchWrap}>
              <Ionicons name="search" size={16} color={C.textDim} />
              <TextInput testID="food-search-input" value={search} onChangeText={setSearch}
                placeholder="ribeye, kippers, honey…" placeholderTextColor={C.textMute} style={styles.searchInput} />
            </View>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
              {filtered.map((f) => (
                <Pressable key={f.id} testID={`food-option-${f.id}`} onPress={() => pickFood(f)}
                  style={({ pressed }) => [styles.foodRow, pressed && { backgroundColor: C.cardHi }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.foodRowName}>{f.name}</Text>
                    <Text style={styles.foodRowCat}>{f.cat}</Text>
                  </View>
                  <View style={styles.foodRowMeta}>
                    <Text style={styles.foodRowKcal}>{f.kcal}</Text>
                    <Text style={styles.foodRowMacros}>{f.p}P · {f.f}F · {f.c}C</Text>
                  </View>
                </Pressable>
              ))}
              {filtered.length === 0 && <Text style={styles.emptyText}>No match. Whole foods only.</Text>}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

/* =========================================================
   FORGE VIEW
   ========================================================= */
function ForgeView({ equipment, setEquipment, onLogWorkout, loggedToday }: {
  equipment: Equipment[];
  setEquipment: (e: Equipment[]) => void;
  onLogWorkout: (w: Workout) => void;
  loggedToday: { id: string; name: string; date: string }[];
}) {
  const [filter, setFilter] = useState<WorkoutFocus | "all">("all");
  const [time, setTime] = useState<"all" | 15 | 30 | 60>("all");
  const [myKitOnly, setMyKitOnly] = useState(false);
  const [eqExpanded, setEqExpanded] = useState(false);
  const [open, setOpen] = useState<Workout | null>(null);
  const [showAlt, setShowAlt] = useState<Record<number, boolean>>({});

  const filtered = useMemo(() => {
    let list = [...WORKOUTS];
    if (filter !== "all") list = list.filter((w) => w.focus === filter);
    if (time !== "all") list = list.filter((w) => w.time <= time);
    if (myKitOnly) list = list.filter((w) => canPerform(w, equipment));
    return list;
  }, [filter, time, myKitOnly, equipment]);

  const focuses: { id: WorkoutFocus | "all"; label: string }[] = [
    { id: "all", label: "ALL" },
    { id: "fatburn", label: "FAT BURN" },
    { id: "performance", label: "PERFORMANCE" },
    { id: "strength", label: "STRENGTH" },
    { id: "metcon", label: "METCON" },
    { id: "mobility", label: "MOBILITY" },
    { id: "recovery", label: "RECOVERY" },
  ];
  const times = [
    { id: "all" as const, label: "ANY" },
    { id: 15 as const, label: "≤ 15 MIN" },
    { id: 30 as const, label: "≤ 30 MIN" },
    { id: 60 as const, label: "≤ 60 MIN" },
  ];

  const allEq = Object.keys(EQUIPMENT_META) as Equipment[];

  const toggleEq = (e: Equipment) => {
    haptic("light");
    setEquipment(equipment.includes(e) ? equipment.filter((x) => x !== e) : [...equipment, e]);
  };

  const clearFilters = () => {
    haptic();
    setFilter("all");
    setTime("all");
    setMyKitOnly(false);
  };

  const filtersActive = filter !== "all" || time !== "all" || myKitOnly;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollPad} testID="forge-view">
        <Text style={styles.sectionKicker}>FORGE · TRAINING LIBRARY</Text>

        {/* Equipment kit */}
        <View style={styles.equipmentSection} testID="equipment-section">
          <TouchableOpacity
            testID="equipment-toggle"
            onPress={() => { haptic(); setEqExpanded(!eqExpanded); }}
            style={styles.equipmentHeader}
            activeOpacity={0.7}>
            <Text style={styles.equipmentTitle}>MY KIT</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={styles.equipmentCount}>{equipment.length} ITEMS</Text>
              <Ionicons name={eqExpanded ? "chevron-up" : "chevron-down"} size={14} color={C.textDim} />
            </View>
          </TouchableOpacity>
          {eqExpanded && (
            <View style={[styles.filterRow, { marginBottom: 8 }]}>
              {allEq.map((e) => {
                const active = equipment.includes(e);
                const meta = EQUIPMENT_META[e];
                return (
                  <TouchableOpacity key={e} testID={`eq-${e}`}
                    onPress={() => toggleEq(e)}
                    style={[styles.equipmentChip, active && styles.equipmentChipActive]}>
                    <Ionicons name={meta.icon as any} size={11} color={active ? C.bg : C.textDim} />
                    <Text style={[styles.equipmentChipText, active && { color: C.bg }]}>{meta.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          <TouchableOpacity
            testID="my-kit-toggle"
            onPress={() => { haptic(); setMyKitOnly(!myKitOnly); }}
            style={[styles.filterChip, myKitOnly && styles.filterChipActive, { alignSelf: "flex-start", marginTop: 4 }]}>
            <Text style={[styles.filterChipText, myKitOnly && { color: C.bg }]}>
              {myKitOnly ? "✓ MATCHES MY KIT" : "FILTER TO MY KIT"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subKicker}>FOCUS</Text>
        <View style={styles.filterRow}>
          {focuses.map((f) => {
            const active = filter === f.id;
            return (
              <TouchableOpacity key={f.id} testID={`filter-focus-${f.id}`}
                onPress={() => { haptic("light"); setFilter(f.id); }}
                activeOpacity={0.7}
                style={[styles.filterChip, active && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, active && { color: C.bg }]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.subKicker}>MAX TIME</Text>
        <View style={styles.filterRow}>
          {times.map((t) => {
            const active = time === t.id;
            return (
              <TouchableOpacity key={String(t.id)} testID={`filter-time-${t.id}`}
                onPress={() => { haptic("light"); setTime(t.id); }}
                activeOpacity={0.7}
                style={[styles.filterChip, active && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, active && { color: C.bg }]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Result count */}
        <View style={styles.forgeCount} testID="forge-count">
          <Text style={styles.forgeCountText}>{filtered.length} of {WORKOUTS.length} workouts</Text>
          {filtersActive && (
            <TouchableOpacity testID="clear-filters" onPress={clearFilters}>
              <Text style={styles.clearBtnText}>CLEAR ALL</Text>
            </TouchableOpacity>
          )}
        </View>

        {filtered.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No workouts match. Loosen the filter or add equipment to MY KIT.</Text>
          </View>
        )}

        {filtered.map((w) => {
          const meta = FOCUS_META[w.focus];
          const reqEq = workoutRequiredEquipment(w);
          const performable = canPerform(w, equipment);
          return (
            <TouchableOpacity key={w.id} testID={`workout-${w.id}`}
              onPress={() => { haptic(); setShowAlt({}); setOpen(w); }}
              activeOpacity={0.85}
              style={[styles.workoutCard, myKitOnly && !performable && styles.workoutCardLocked]}>
              <View style={styles.workoutHeaderRow}>
                <View style={[styles.focusBadge, { backgroundColor: `${meta.color}22` }]}>
                  <Text style={[styles.focusBadgeText, { color: meta.color }]}>{meta.label}</Text>
                </View>
                <View style={styles.timeBadge}>
                  <Ionicons name="time-outline" size={11} color={C.textDim} />
                  <Text style={styles.timeBadgeText}>{w.time} MIN</Text>
                </View>
                {w.source && (
                  <View style={styles.sourceBadge}>
                    <Text style={styles.sourceBadgeText}>{w.source}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.workoutTitle}>{w.name}</Text>
              <Text style={styles.workoutDesc} numberOfLines={2}>{w.description}</Text>
              {reqEq.length > 0 && (
                <View style={styles.equipmentSummary}>
                  {reqEq.slice(0, 6).map((e) => {
                    const meta2 = EQUIPMENT_META[e];
                    const has = equipment.includes(e);
                    return (
                      <View key={e} style={[styles.equipmentTag, has && { borderWidth: 1, borderColor: C.optimal }]}>
                        <Ionicons name={meta2.icon as any} size={9} color={has ? C.optimal : C.textDim} />
                        <Text style={[styles.equipmentTagText, has && { color: C.optimal }]}>{meta2.label}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
              <View style={styles.workoutCardFooter}>
                <Text style={styles.workoutExCount}>{w.exercises.length} EXERCISES</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Text style={styles.workoutOpenText}>OPEN</Text>
                  <Ionicons name="arrow-forward" size={14} color={C.text} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal visible={open !== null} animationType="slide" onRequestClose={() => setOpen(null)}>
        {open && (
          <SafeAreaView style={[styles.root, { flex: 1 }]} edges={["top", "bottom"]}>
            <View style={styles.shell}>
              <View style={styles.pickerHeader}>
                <Text style={styles.brand}>WORKOUT</Text>
                <TouchableOpacity onPress={() => setOpen(null)} testID="close-workout">
                  <Ionicons name="close" size={26} color={C.text} />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.detailScroll} testID="workout-detail">
                <View style={styles.detailHeader}>
                  <View style={styles.workoutHeaderRow}>
                    <View style={[styles.focusBadge, { backgroundColor: `${FOCUS_META[open.focus].color}22` }]}>
                      <Text style={[styles.focusBadgeText, { color: FOCUS_META[open.focus].color }]}>{FOCUS_META[open.focus].label}</Text>
                    </View>
                    <View style={styles.timeBadge}>
                      <Ionicons name="time-outline" size={11} color={C.textDim} />
                      <Text style={styles.timeBadgeText}>{open.time} MIN</Text>
                    </View>
                    {open.source && (
                      <View style={styles.sourceBadge}>
                        <Text style={styles.sourceBadgeText}>{open.source}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.detailTitle}>{open.name}</Text>
                  <Text style={styles.detailDesc}>{open.description}</Text>
                </View>

                <View style={styles.scienceBox}>
                  <Text style={styles.scienceKicker}>WHY IT WORKS</Text>
                  <Text style={styles.scienceBody}>{open.scienceNote}</Text>
                  {open.citation && (
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, gap: 8 }}>
                      <View style={[styles.dot, { backgroundColor: C.science }]} />
                      <Text style={styles.scienceCitation}>{open.citation}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.subKicker}>EXERCISES</Text>
                {open.exercises.map((ex, i) => {
                  const exHas = ex.equipment.every((e) => e === "bodyweight" || equipment.includes(e));
                  const altsOpen = !!showAlt[i];
                  return (
                    <View key={i} style={styles.exerciseCard} testID={`exercise-${i}`}>
                      <View style={styles.exerciseHeader}>
                        <Text style={styles.exerciseIdx}>{String(i + 1).padStart(2, "0")}</Text>
                        <Text style={styles.exerciseName}>{ex.name}</Text>
                      </View>
                      <Text style={styles.exerciseSets}>{ex.setsReps}</Text>
                      {ex.cue && <Text style={styles.exerciseCue}>↳ {ex.cue}</Text>}
                      <View style={{ flexDirection: "row", marginLeft: 38, marginTop: 8, flexWrap: "wrap", gap: 4 }}>
                        {ex.equipment.map((e) => {
                          const m2 = EQUIPMENT_META[e];
                          const ok = e === "bodyweight" || equipment.includes(e);
                          return (
                            <View key={e} style={[styles.equipmentTag, ok && { borderWidth: 1, borderColor: C.optimal }]}>
                              <Ionicons name={m2.icon as any} size={9} color={ok ? C.optimal : C.textDim} />
                              <Text style={[styles.equipmentTagText, ok && { color: C.optimal }]}>{m2.label}</Text>
                            </View>
                          );
                        })}
                      </View>
                      <View style={{ flexDirection: "row", gap: 6, marginTop: 8, marginLeft: 38, flexWrap: "wrap" }}>
                        <TouchableOpacity testID={`video-${i}`}
                          onPress={() => { haptic(); openYouTube(ex.videoQuery); }}
                          style={styles.videoBtn}>
                          <Ionicons name="logo-youtube" size={14} color={C.penalty} />
                          <Text style={styles.videoBtnText}>WATCH FORM</Text>
                        </TouchableOpacity>
                        {ex.alternatives && ex.alternatives.length > 0 && (
                          <TouchableOpacity testID={`alt-toggle-${i}`}
                            onPress={() => { haptic(); setShowAlt({ ...showAlt, [i]: !altsOpen }); }}
                            style={styles.videoBtn}>
                            <Ionicons name={altsOpen ? "chevron-up" : "swap-horizontal"} size={14} color={!exHas ? C.warning : C.textDim} />
                            <Text style={[styles.videoBtnText, !exHas && { color: C.warning }]}>
                              {!exHas ? "MISSING KIT · ALTERNATIVES" : `${ex.alternatives.length} ALT${ex.alternatives.length > 1 ? "S" : ""}`}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      {altsOpen && ex.alternatives && (
                        <View style={styles.altBox}>
                          <Text style={styles.altKicker}>SWAPS</Text>
                          {ex.alternatives.map((a, ai) => (
                            <View key={ai} style={[styles.altRow, ai === ex.alternatives!.length - 1 && { borderBottomWidth: 0 }]}>
                              <Text style={styles.altName}>{a.name}</Text>
                              <TouchableOpacity testID={`alt-video-${i}-${ai}`}
                                onPress={() => { haptic(); openYouTube(a.videoQuery); }}
                                style={styles.altVideoBtn}>
                                <Ionicons name="logo-youtube" size={11} color={C.penalty} />
                                <Text style={styles.altVideoText}>WATCH</Text>
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}

                <TouchableOpacity testID="log-workout-btn"
                  onPress={() => { onLogWorkout(open); setOpen(null); }}
                  style={styles.logWorkoutBtn}>
                  <Ionicons name="checkmark-circle" size={18} color={C.bg} />
                  <Text style={styles.logWorkoutBtnText}>MARK COMPLETE · +{XP_RULES.workoutLogged} XP</Text>
                </TouchableOpacity>

                {loggedToday.some((w) => w.id === open.id) && (
                  <Text style={[styles.hint, { textAlign: "center", color: C.optimal, marginTop: 10 }]}>
                    ✓ Already logged today
                  </Text>
                )}
              </ScrollView>
            </View>
          </SafeAreaView>
        )}
      </Modal>
    </View>
  );
}

/* =========================================================
   SCAN VIEW (placeholder)
   ========================================================= */
function ScanView() {
  return (
    <ScrollView contentContainerStyle={styles.scrollPad} testID="scan-view">
      <Text style={styles.sectionKicker}>SCAN · INGREDIENT TRUTH</Text>
      <View style={styles.scanHero}>
        <View style={styles.scanIcon}>
          <Ionicons name="scan" size={42} color={C.science} />
        </View>
        <Text style={styles.scanTitle}>COMING SOON</Text>
        <Text style={styles.scanSub}>
          Yuka-style ingredient analysis for cosmetics &amp; food. Paste a label or scan a barcode — get an instant red / amber / green verdict on parabens, phthalates, sulfates, oxybenzone, retinyl palmitate, fragrance, aluminium salts, and 200+ flagged compounds.
        </Text>
        <View style={styles.scanBullets}>
          <View style={styles.scanBullet}>
            <Ionicons name="warning" size={16} color={C.penalty} />
            <Text style={styles.scanBulletText}>Endocrine disruptors flagged with citations</Text>
          </View>
          <View style={styles.scanBullet}>
            <Ionicons name="leaf" size={16} color={C.optimal} />
            <Text style={styles.scanBulletText}>Cleaner alternatives suggested</Text>
          </View>
          <View style={styles.scanBullet}>
            <Ionicons name="shield-checkmark" size={16} color={C.science} />
            <Text style={styles.scanBulletText}>Personal exposure score · weekly trend</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

/* =========================================================
   VAULT VIEW — XP / Credits / Carb Bank / Archive / Perks
   ========================================================= */
function VaultView({
  profile, xp, credits, bank, bankHistory, consumedCarbs, weights, workoutsLogged,
  onBank, onResetBank, onSpendCredit,
}: {
  profile: Profile; xp: XPState; credits: number;
  bank: number; bankHistory: { date: string; deficit: number }[];
  consumedCarbs: number;
  weights: WeightEntry[];
  workoutsLogged: { id: string; name: string; date: string }[];
  onBank: () => void;
  onResetBank: () => void;
  onSpendCredit: (cost: number) => void;
}) {
  const today = todayKey();
  const todayXP = xp.daily[today] || {};
  const todayDeficit = profile.carbs - consumedCarbs;
  const alreadyBanked = bankHistory.some((h) => h.date === today);
  const todayWorkouts = workoutsLogged.filter((w) => w.date === today);

  const earnList = [
    { label: "Daily Intel Read", got: !!todayXP.intelRead, xp: XP_RULES.intelRead },
    { label: `Meals Logged (cap ${XP_RULES.mealCap})`, got: (todayXP.mealsXP || 0) > 0, xp: todayXP.mealsXP || 0, capXp: XP_RULES.mealCap * XP_RULES.mealLogged },
    { label: `Workouts Done (cap ${XP_RULES.workoutCap})`, got: (todayXP.workoutsXP || 0) > 0, xp: todayXP.workoutsXP || 0, capXp: XP_RULES.workoutCap * XP_RULES.workoutLogged },
    { label: "Macros Hit", got: !!todayXP.macrosHit, xp: XP_RULES.macrosHit },
    { label: "Daily Weigh-in", got: !!todayXP.weighIn, xp: XP_RULES.weighIn },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollPad} testID="vault-view">
      <Text style={styles.sectionKicker}>VAULT · YOUR FORGE</Text>

      <View style={styles.vaultHero}>
        <Text style={styles.vaultLabel}>TOTAL XP</Text>
        <Text style={styles.vaultXp} testID="vault-xp">{xp.total.toLocaleString()}</Text>
        <Text style={styles.vaultXpSub}>{CREDIT_PER_XP - (xp.total % CREDIT_PER_XP)} XP to next credit</Text>
      </View>

      <View style={styles.vaultSplit}>
        <View style={styles.vaultStat}>
          <Text style={styles.vaultStatLabel}>STREAK</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="flame" size={20} color={C.fire} />
            <Text style={styles.vaultStatValue} testID="vault-streak">{xp.streak}</Text>
          </View>
        </View>
        <View style={styles.vaultStat}>
          <Text style={styles.vaultStatLabel}>CREDITS</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="diamond" size={18} color={C.gold} />
            <Text style={[styles.vaultStatValue, { color: C.gold }]} testID="vault-credits">{credits}</Text>
          </View>
        </View>
        <View style={styles.vaultStat}>
          <Text style={styles.vaultStatLabel}>WORKOUTS</Text>
          <Text style={styles.vaultStatValue}>{todayWorkouts.length}/{workoutsLogged.length}</Text>
        </View>
      </View>

      <Text style={styles.subKicker}>TODAY'S EARNINGS</Text>
      <View style={styles.todayEarn}>
        {earnList.map((row, i) => (
          <View key={i} style={[styles.earnRow, i === earnList.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons
                name={row.got ? "checkmark-circle" : "ellipse-outline"}
                size={16}
                color={row.got ? C.optimal : C.textMute}
              />
              <Text style={styles.earnLabel}>{row.label}</Text>
            </View>
            <Text style={row.got ? styles.earnXp : styles.earnXpDim}>
              {row.got ? `+${row.xp}` : row.capXp ? `0 / ${row.capXp}` : `+${row.xp}`}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.subKicker}>UNLOCKS &amp; PERKS</Text>
      {PERKS.map((p) => {
        const canAfford = credits >= p.cost;
        return (
          <View key={p.id} style={[styles.perkCard, !canAfford && styles.perkCardLocked]} testID={`perk-${p.id}`}>
            <View style={styles.perkHead}>
              <Text style={styles.perkPartner}>{p.partner.toUpperCase()}</Text>
              <View style={styles.perkCost}>
                <Ionicons name="diamond" size={10} color={C.gold} />
                <Text style={styles.perkCostText}>{p.cost}</Text>
              </View>
            </View>
            <Text style={styles.perkTitle}>{p.title}</Text>
            <Text style={styles.perkDesc}>{p.description}</Text>
            <TouchableOpacity testID={`redeem-${p.id}`}
              disabled={!canAfford}
              onPress={() => {
                confirmAction("REDEEM", `Spend ${p.cost} credit${p.cost > 1 ? "s" : ""} on ${p.title}?`,
                  () => onSpendCredit(p.cost));
              }}
              style={[styles.perkRedeem, !canAfford && styles.perkRedeemDisabled]}>
              <Ionicons name={canAfford ? "gift" : "lock-closed"} size={12} color={canAfford ? C.bg : C.textMute} />
              <Text style={canAfford ? styles.perkRedeemText : styles.perkRedeemTextDisabled}>
                {canAfford ? "REDEEM" : `NEED ${p.cost - credits} MORE`}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <Text style={[styles.subKicker, { marginTop: 24 }]}>CARB BANK · LEDGER</Text>
      <View style={styles.bankCard}>
        <Text style={styles.bankLabel}>BANKED SURPLUS</Text>
        <Text style={styles.bankValue} testID="bank-value">{round(bank, 1)}g</Text>
        <Text style={styles.bankSub}>Glycogen reserves accumulated. Spend on weekend supercompensation.</Text>
      </View>
      <View style={styles.todayDeficitCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>TODAY'S DEFICIT</Text>
          <Text style={[styles.deficitValue, { color: todayDeficit > 0 ? C.optimal : C.penalty }]}>
            {todayDeficit > 0 ? "+" : ""}{round(todayDeficit, 1)}g
          </Text>
          <Text style={styles.hint}>Target {profile.carbs}g · Consumed {round(consumedCarbs, 1)}g</Text>
        </View>
        <TouchableOpacity testID="bank-deficit-btn" onPress={onBank}
          disabled={todayDeficit <= 0 || alreadyBanked}
          style={[styles.bankBtn, (todayDeficit <= 0 || alreadyBanked) && styles.bankBtnDisabled]}>
          <Text style={styles.bankBtnText}>{alreadyBanked ? "BANKED" : "BANK IT"}</Text>
        </TouchableOpacity>
      </View>
      {bankHistory.length > 0 && (
        <View style={[styles.todayLogHeader, { marginTop: 16 }]}>
          <Text style={styles.subKicker}>HISTORY · {bankHistory.length}</Text>
          <TouchableOpacity testID="reset-bank-btn"
            onPress={() => confirmAction("RESET BANK", "Clear all banked surplus and history?", onResetBank)}>
            <Text style={styles.wipeText}>RESET</Text>
          </TouchableOpacity>
        </View>
      )}
      {bankHistory.map((h) => (
        <View key={h.date} style={styles.historyRow}>
          <Text style={styles.historyDate}>{h.date}</Text>
          <Text style={styles.historyDeficit}>+{h.deficit}g</Text>
        </View>
      ))}

      <Text style={[styles.subKicker, { marginTop: 24 }]}>ARSENAL ARCHIVE · {TIPS.length} CARDS</Text>
      {TIPS.map((t, i) => (
        <View key={i} style={styles.archiveCard} testID={`archive-${i}`}>
          <View style={styles.archiveHead}>
            <Text style={styles.archiveIdx}>{String(i + 1).padStart(2, "0")}</Text>
            <Text style={styles.archiveTag}>{t.tag}</Text>
          </View>
          <Text style={styles.archiveTitle}>{t.title}</Text>
          <Text style={styles.archiveBody}>{t.body}</Text>
          <Text style={styles.archiveCitation}>{t.citation}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

/* =========================================================
   WEIGHT CHECK-IN MODAL
   ========================================================= */
function WeightCheckIn({ visible, onClose, weights, onSave }: {
  visible: boolean; onClose: () => void; weights: WeightEntry[]; onSave: (kg: number) => void;
}) {
  const [kg, setKg] = useState("");
  useEffect(() => { if (visible) setKg(""); }, [visible]);
  const submit = () => {
    const n = parseFloat(kg);
    if (!n || n <= 0 || n > 400) return;
    onSave(n);
  };
  const last7 = weights.slice(0, 7);
  const max = Math.max(...last7.map((w) => w.weight), 0);
  const min = Math.min(...last7.map((w) => w.weight), max);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
        <View style={styles.modalCard} testID="weight-modal">
          <View style={styles.weightModalHeader}>
            <Text style={styles.modalTitleLight}>WEIGH-IN</Text>
            <TouchableOpacity onPress={onClose} testID="weight-modal-close">
              <Ionicons name="close" size={22} color={C.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSub}>Daily weigh-in. Same time, same scale. Trend &gt; absolute.</Text>
          <Text style={styles.label}>WEIGHT · KG</Text>
          <TextInput testID="weight-input" value={kg} onChangeText={setKg}
            placeholder="84.2" placeholderTextColor={C.textMute}
            keyboardType="decimal-pad" style={styles.input} autoFocus />
          <TouchableOpacity testID="weight-save-btn" onPress={submit} disabled={!kg}
            style={[styles.primaryBtn, !kg && styles.primaryBtnDisabled, { marginTop: 14 }]}>
            <Text style={styles.primaryBtnText}>LOG WEIGHT · +{XP_RULES.weighIn} XP</Text>
          </TouchableOpacity>
          {last7.length > 0 && (
            <View style={{ marginTop: 22 }}>
              <Text style={styles.subKicker}>LAST {last7.length} ENTRIES</Text>
              {last7.map((w) => {
                const pct = max === min ? 0.5 : (w.weight - min) / (max - min);
                return (
                  <View key={w.date} style={styles.weightRow}>
                    <Text style={styles.weightRowDate}>{w.date}</Text>
                    <View style={styles.weightRowBarTrack}>
                      <View style={[styles.weightRowBarFill, { width: `${20 + pct * 80}%` }]} />
                    </View>
                    <Text style={styles.weightRowValue}>{w.weight}kg</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* =========================================================
   TAB BAR
   ========================================================= */
function TabBar({ tab, setTab }: {
  tab: "hud" | "fuel" | "forge" | "scan" | "vault";
  setTab: (t: "hud" | "fuel" | "forge" | "scan" | "vault") => void;
}) {
  const items: { id: typeof tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: "hud", label: "HUD", icon: "pulse" },
    { id: "fuel", label: "FUEL", icon: "flame" },
    { id: "forge", label: "FORGE", icon: "fitness" },
    { id: "scan", label: "SCAN", icon: "scan-outline" },
    { id: "vault", label: "VAULT", icon: "trophy" },
  ];
  return (
    <View style={styles.tabBar}>
      {items.map((it) => {
        const active = tab === it.id;
        return (
          <TouchableOpacity key={it.id} testID={`tab-${it.id}`} onPress={() => setTab(it.id)} style={styles.tabBtn}>
            <Ionicons name={it.icon} size={20} color={active ? C.text : C.textMute} />
            <Text style={[styles.tabLabel, active && { color: C.text }]}>{it.label}</Text>
            {active && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
