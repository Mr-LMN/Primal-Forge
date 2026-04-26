import React, { useEffect, useRef, useState } from "react";
import { View, Text, Modal, Pressable, Animated, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import {
  C,
  STORAGE,
  TIPS,
  XP_RULES,
  CREDIT_PER_XP,
  todayKey,
  yesterdayKey,
  dayOfYear,
  round,
  type Equipment,
  type Workout,
  type Recipe,
  type RiskLevel,
} from "../src/data";
import { styles } from "../src/styles";
import { haptic, buildProfile, initialXP } from "../src/utils";
import type {
  Profile,
  LogEntry,
  WeightEntry,
  WorkoutLogged,
  BankHistoryEntry,
  ScanHistEntry,
  XPState,
  XPDaily,
  Tab,
} from "../src/types";

import { Header } from "../src/components/Header";
import { TabBar } from "../src/components/TabBar";
import { WeightCheckIn } from "../src/components/WeightCheckIn";

import { Onboarding } from "../src/screens/Onboarding";
import { HUDView } from "../src/screens/HUDView";
import { FuelView } from "../src/screens/FuelView";
import { ForgeView } from "../src/screens/ForgeView";
import { ScanView } from "../src/screens/ScanView";
import { VaultView } from "../src/screens/VaultView";
import { TrendsView } from "../src/screens/TrendsView";
import { CoachView } from "../src/screens/CoachView";

export default function Index() {
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [bank, setBank] = useState(0);
  const [bankHistory, setBankHistory] = useState<BankHistoryEntry[]>([]);
  const [waterMap, setWaterMap] = useState<Record<string, number>>({});
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  const [workoutsLogged, setWorkoutsLogged] = useState<WorkoutLogged[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [scanHistory, setScanHistory] = useState<ScanHistEntry[]>([]);
  const [recipeFavourites, setRecipeFavourites] = useState<string[]>([]);
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>([]);
  const [xp, setXp] = useState<XPState>(initialXP());
  const [tab, setTab] = useState<Tab>("hud");
  const [weightModal, setWeightModal] = useState(false);
  const [intelModal, setIntelModal] = useState(false);
  const [coachVisible, setCoachVisible] = useState(false);
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
      if (map[STORAGE.scanHistory]) setScanHistory(JSON.parse(map[STORAGE.scanHistory]!));
      if (map[STORAGE.recipeFavourites]) setRecipeFavourites(JSON.parse(map[STORAGE.recipeFavourites]!));
      if (map[STORAGE.customRecipes]) setCustomRecipes(JSON.parse(map[STORAGE.customRecipes]!));
      if (map[STORAGE.xp]) {
        const parsed: XPState = JSON.parse(map[STORAGE.xp]!);
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

  const addXP = async (
    amount: number,
    label: string,
    kind: keyof XPDaily,
  ) => {
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

    if (next.streak >= 7 && next.streak > next.lastStreakBonusAt && next.streak % 7 === 0) {
      next.total += XP_RULES.streak7Bonus;
      next.lastStreakBonusAt = next.streak;
      setTimeout(() => showXpToast(XP_RULES.streak7Bonus, `${next.streak}-DAY STREAK`), 1200);
    }

    setXp(next);
    await persist(STORAGE.xp, JSON.stringify(next));
    showXpToast(amount, label);
  };

  const saveProfile = async (p: Profile) => {
    setProfile(p);
    await persist(STORAGE.profile, JSON.stringify(p));
  };
  const saveLog = async (next: LogEntry[]) => {
    setLog(next);
    await persist(STORAGE.log, JSON.stringify(next));
  };
  const saveBank = async (val: number, history: BankHistoryEntry[]) => {
    setBank(val);
    setBankHistory(history);
    await persist(STORAGE.bank, String(val));
    await persist(STORAGE.bankHistory, JSON.stringify(history));
  };
  const saveWater = async (next: Record<string, number>) => {
    setWaterMap(next);
    await persist(STORAGE.water, JSON.stringify(next));
  };
  const saveWeights = async (next: WeightEntry[]) => {
    setWeights(next);
    await persist(STORAGE.weights, JSON.stringify(next));
  };
  const saveRecents = async (next: string[]) => {
    setRecents(next);
    await persist(STORAGE.recents, JSON.stringify(next));
  };
  const saveWorkouts = async (next: WorkoutLogged[]) => {
    setWorkoutsLogged(next);
    await persist(STORAGE.workouts, JSON.stringify(next));
  };
  const saveEquipment = async (next: Equipment[]) => {
    setEquipment(next);
    await persist(STORAGE.equipment, JSON.stringify(next));
  };
  const saveScanHistory = async (next: ScanHistEntry[]) => {
    setScanHistory(next);
    await persist(STORAGE.scanHistory, JSON.stringify(next));
  };
  const toggleRecipeFavourite = async (recipeId: string) => {
    haptic("light");
    const next = recipeFavourites.includes(recipeId)
      ? recipeFavourites.filter((id) => id !== recipeId)
      : [...recipeFavourites, recipeId];
    setRecipeFavourites(next);
    await persist(STORAGE.recipeFavourites, JSON.stringify(next));
  };
  const saveCustomRecipe = async (r: Recipe) => {
    haptic("success");
    const next = [r, ...customRecipes.filter((x) => x.id !== r.id)];
    setCustomRecipes(next);
    await persist(STORAGE.customRecipes, JSON.stringify(next));
  };
  const deleteCustomRecipe = async (id: string) => {
    haptic();
    const next = customRecipes.filter((r) => r.id !== id);
    setCustomRecipes(next);
    await persist(STORAGE.customRecipes, JSON.stringify(next));
  };

  const resetAll = async () => {
    await AsyncStorage.multiRemove(Object.values(STORAGE));
    setProfile(null);
    setLog([]);
    setBank(0);
    setBankHistory([]);
    setWaterMap({});
    setWeights([]);
    setRecents([]);
    setWorkoutsLogged([]);
    setEquipment([]);
    setScanHistory([]);
    setRecipeFavourites([]);
    setCustomRecipes([]);
    setXp(initialXP());
  };

  const today = log.filter((e) => e.dateKey === todayKey());
  const totals = today.reduce(
    (a, e) => ({ kcal: a.kcal + e.kcal, p: a.p + e.p, f: a.f + e.f, c: a.c + e.c }),
    { kcal: 0, p: 0, f: 0, c: 0 }
  );
  const waterToday = waterMap[todayKey()] || 0;
  const waterTarget = profile ? Math.round(profile.weight * 35) : 0;

  const intelIdx = dayOfYear() % TIPS.length;
  const todayTip = TIPS[intelIdx];
  const intelReadToday = !!xp.daily[todayKey()]?.intelRead;

  const macrosHitNow =
    !!profile &&
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
    if (profile)
      await saveProfile(
        buildProfile({
          sex: profile.sex,
          weight: kg,
          height: profile.height,
          bodyFat: profile.bodyFat,
          bfMode: profile.bfMode,
          goal: profile.goal,
          tier: profile.tier,
        })
      );
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
          onWeight={() => {
            haptic();
            setWeightModal(true);
          }}
        />
        <View style={{ flex: 1 }}>
          {tab === "hud" && (
            <HUDView
              profile={profile}
              totals={totals}
              waterMl={waterToday}
              waterTarget={waterTarget}
              tip={todayTip}
              intelReadToday={intelReadToday}
              onIntelTap={() => {
                haptic();
                setIntelModal(true);
              }}
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
              log={today}
              recents={recents}
              onLog={handleLog}
              onWipe={async () => saveLog(log.filter((e) => e.dateKey !== todayKey()))}
              remaining={{
                kcal: Math.max(0, profile.calories - totals.kcal),
                p: Math.max(0, profile.protein - totals.p),
                f: Math.max(0, profile.fat - totals.f),
                c: Math.max(0, profile.carbs - totals.c),
              }}
              favourites={recipeFavourites}
              onToggleFavourite={toggleRecipeFavourite}
              customRecipes={customRecipes}
              onSaveCustomRecipe={saveCustomRecipe}
              onDeleteCustomRecipe={deleteCustomRecipe}
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
          {tab === "scan" && (
            <ScanView
              history={scanHistory}
              onSave={async (entry) => saveScanHistory([entry, ...scanHistory].slice(0, 25))}
              onClear={async () => saveScanHistory([])}
            />
          )}
          {tab === "trends" && (
            <TrendsView log={log} profile={profile} />
          )}
          {tab === "vault" && (
            <VaultView
              profile={profile}
              xp={xp}
              credits={credits}
              bank={bank}
              bankHistory={bankHistory}
              consumedCarbs={totals.c}
              weights={weights}
              workoutsLogged={workoutsLogged}
              onBank={async () => {
                const deficit = profile.carbs - totals.c;
                if (deficit <= 0) {
                  Alert.alert("NO DEFICIT", "Nothing to bank.");
                  return;
                }
                if (bankHistory.find((h) => h.date === todayKey())) {
                  Alert.alert("ALREADY BANKED", "Today's deficit is already in the vault.");
                  return;
                }
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
        <TabBar
          tab={tab}
          setTab={(t) => {
            haptic("light");
            setTab(t);
          }}
        />
      </View>

      {/* ANVIL FAB */}
      <TouchableOpacity
        testID="anvil-fab"
        onPress={() => { haptic("medium"); setCoachVisible(true); }}
        style={{
          position: "absolute", bottom: 80, right: 16,
          width: 52, height: 52, borderRadius: 26,
          backgroundColor: C.fire, justifyContent: "center", alignItems: "center",
          shadowColor: C.fire, shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
        }}
        activeOpacity={0.8}
      >
        <Text style={{ fontSize: 22 }}>⚒</Text>
      </TouchableOpacity>

      {/* ANVIL Coach Modal */}
      <Modal visible={coachVisible} animationType="slide" onRequestClose={() => setCoachVisible(false)}>
        <SafeAreaView style={[styles.root, { flex: 1 }]} edges={["top", "bottom"]}>
          <CoachView
            profile={profile}
            totals={totals}
            remaining={{
              kcal: Math.max(0, profile.calories - totals.kcal),
              p: Math.max(0, profile.protein - totals.p),
              f: Math.max(0, profile.fat - totals.f),
              c: Math.max(0, profile.carbs - totals.c),
            }}
            equipment={equipment}
            recentWorkouts={workoutsLogged.slice(0, 10)}
            loggedMealsToday={today.length > 0}
            loggedWorkoutToday={workoutsLogged.some((w) => w.date === todayKey())}
            onClose={() => setCoachVisible(false)}
          />
        </SafeAreaView>
      </Modal>

      {toast && (
        <Animated.View style={[styles.xpToast, { opacity: toastOpacity }]} pointerEvents="none">
          <Ionicons name="flash" size={16} color={C.bg} />
          <Text style={styles.xpToastText}>{toast}</Text>
        </Animated.View>
      )}

      <WeightCheckIn
        visible={weightModal}
        onClose={() => setWeightModal(false)}
        weights={weights}
        onSave={handleWeightSave}
      />

      <Modal visible={intelModal} transparent animationType="fade" onRequestClose={() => setIntelModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIntelModal(false)}>
          <Pressable
            style={styles.modalScrollCard}
            onPress={(e) => e.stopPropagation()}
            testID="intel-modal"
          >
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
