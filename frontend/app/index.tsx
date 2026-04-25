import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

/* =========================================================
   PRIMALFORGE — Metabolic Tracking
   Brutalist · Dark · Data-driven
   ========================================================= */

const C = {
  bg: "#0a0a0a",
  bg2: "#111111",
  card: "#161616",
  cardHi: "#1c1c1c",
  border: "#262626",
  borderHi: "#3a3a3a",
  text: "#f5f5f5",
  textDim: "#9a9a9a",
  textMute: "#5f5f5f",
  optimal: "#22c55e",
  warning: "#f59e0b",
  penalty: "#dc2626",
  science: "#0ea5e9",
};

const STORAGE = {
  profile: "pf_profile_v1",
  log: "pf_log_v1",
  bank: "pf_bank_v1",
  bankHistory: "pf_bank_history_v1",
};

/* ---------- Activity tiers ---------- */
type ActivityTier = {
  id: string;
  label: string;
  sub: string;
  multiplier: number;
  carbTarget: number;
};

const ACTIVITY_TIERS: ActivityTier[] = [
  { id: "sedentary", label: "DESK LIFE", sub: "Rarely train · mostly sitting", multiplier: 1.2, carbTarget: 50 },
  { id: "baseline", label: "BASELINE", sub: "2–3x / week · moderate effort", multiplier: 1.375, carbTarget: 100 },
  { id: "heavy", label: "HEAVY LIFTING", sub: "4–5x / week · barbell focus", multiplier: 1.55, carbTarget: 150 },
  { id: "metcon", label: "METCON / ATHLETE", sub: "Daily training · high intensity", multiplier: 1.725, carbTarget: 200 },
];

/* ---------- Whole foods database (per 100g) ---------- */
type Food = { id: string; name: string; cat: string; kcal: number; p: number; f: number; c: number };

const FOODS: Food[] = [
  // Ruminant
  { id: "ribeye", name: "Ribeye Steak (cooked)", cat: "Ruminant", kcal: 271, p: 25, f: 19, c: 0 },
  { id: "gb8020", name: "Ground Beef 80/20 (cooked)", cat: "Ruminant", kcal: 254, p: 26, f: 17, c: 0 },
  { id: "gb7030", name: "Ground Beef 70/30 (cooked)", cat: "Ruminant", kcal: 273, p: 24, f: 21, c: 0 },
  { id: "liver", name: "Beef Liver", cat: "Ruminant", kcal: 175, p: 27, f: 5, c: 4 },
  { id: "heart", name: "Beef Heart", cat: "Ruminant", kcal: 179, p: 28, f: 6, c: 0 },
  { id: "marrow", name: "Bone Marrow", cat: "Ruminant", kcal: 786, p: 7, f: 84, c: 0 },
  { id: "lamb", name: "Lamb Chop (cooked)", cat: "Ruminant", kcal: 294, p: 25, f: 21, c: 0 },
  { id: "bison", name: "Bison (cooked)", cat: "Ruminant", kcal: 146, p: 20, f: 7, c: 0 },
  { id: "venison", name: "Venison (cooked)", cat: "Ruminant", kcal: 158, p: 30, f: 3, c: 0 },
  // Pork
  { id: "bacon", name: "Bacon (cooked)", cat: "Pork", kcal: 541, p: 37, f: 42, c: 1 },
  { id: "pbelly", name: "Pork Belly", cat: "Pork", kcal: 518, p: 9, f: 53, c: 0 },
  { id: "pchop", name: "Pork Chop (cooked)", cat: "Pork", kcal: 231, p: 25, f: 14, c: 0 },
  // Poultry
  { id: "wings", name: "Chicken Wings (skin on)", cat: "Poultry", kcal: 266, p: 27, f: 17, c: 0 },
  { id: "thigh", name: "Chicken Thigh (skin on)", cat: "Poultry", kcal: 229, p: 25, f: 14, c: 0 },
  { id: "breast", name: "Chicken Breast (cooked)", cat: "Poultry", kcal: 165, p: 31, f: 4, c: 0 },
  { id: "duck", name: "Duck (skin on)", cat: "Poultry", kcal: 337, p: 19, f: 28, c: 0 },
  { id: "turkey", name: "Turkey Thigh", cat: "Poultry", kcal: 217, p: 25, f: 12, c: 0 },
  // Seafood
  { id: "salmon", name: "Salmon (Atlantic)", cat: "Seafood", kcal: 208, p: 20, f: 13, c: 0 },
  { id: "sardines", name: "Sardines (in oil)", cat: "Seafood", kcal: 208, p: 25, f: 11, c: 0 },
  { id: "mackerel", name: "Mackerel", cat: "Seafood", kcal: 305, p: 19, f: 25, c: 0 },
  { id: "tuna", name: "Tuna (fresh)", cat: "Seafood", kcal: 132, p: 28, f: 1, c: 0 },
  { id: "shrimp", name: "Shrimp", cat: "Seafood", kcal: 99, p: 24, f: 0.3, c: 0.2 },
  { id: "oysters", name: "Oysters", cat: "Seafood", kcal: 81, p: 9, f: 2, c: 5 },
  { id: "mussels", name: "Mussels", cat: "Seafood", kcal: 86, p: 12, f: 2, c: 4 },
  { id: "cod", name: "Cod", cat: "Seafood", kcal: 82, p: 18, f: 0.7, c: 0 },
  // Eggs / Dairy
  { id: "egg", name: "Whole Egg", cat: "Eggs/Dairy", kcal: 155, p: 13, f: 11, c: 1 },
  { id: "yolk", name: "Egg Yolk", cat: "Eggs/Dairy", kcal: 322, p: 16, f: 27, c: 4 },
  { id: "milk", name: "Whole Milk (A2 / raw)", cat: "Eggs/Dairy", kcal: 61, p: 3.2, f: 3.3, c: 4.8 },
  { id: "cream", name: "Heavy Cream", cat: "Eggs/Dairy", kcal: 340, p: 2.8, f: 36, c: 2.8 },
  { id: "yogurt", name: "Greek Yogurt (full fat)", cat: "Eggs/Dairy", kcal: 97, p: 9, f: 5, c: 4 },
  { id: "cheddar", name: "Cheddar (hard cheese)", cat: "Eggs/Dairy", kcal: 403, p: 25, f: 33, c: 1.3 },
  { id: "parm", name: "Parmesan", cat: "Eggs/Dairy", kcal: 431, p: 38, f: 29, c: 4 },
  { id: "butter", name: "Butter (grass-fed)", cat: "Eggs/Dairy", kcal: 717, p: 0.9, f: 81, c: 0.1 },
  { id: "ghee", name: "Ghee", cat: "Eggs/Dairy", kcal: 900, p: 0, f: 100, c: 0 },
  { id: "cottage", name: "Cottage Cheese", cat: "Eggs/Dairy", kcal: 98, p: 11, f: 4, c: 3.4 },
  // Animal fats
  { id: "tallow", name: "Beef Tallow", cat: "Animal Fat", kcal: 902, p: 0, f: 100, c: 0 },
  { id: "lard", name: "Lard", cat: "Animal Fat", kcal: 902, p: 0, f: 100, c: 0 },
  { id: "duckfat", name: "Duck Fat", cat: "Animal Fat", kcal: 900, p: 0, f: 100, c: 0 },
  // Fruit / Honey
  { id: "honey", name: "Raw Honey", cat: "Fruit/Honey", kcal: 304, p: 0.3, f: 0, c: 82 },
  { id: "banana", name: "Banana", cat: "Fruit/Honey", kcal: 89, p: 1.1, f: 0.3, c: 23 },
  { id: "blueberries", name: "Blueberries", cat: "Fruit/Honey", kcal: 57, p: 0.7, f: 0.3, c: 14 },
  { id: "watermelon", name: "Watermelon", cat: "Fruit/Honey", kcal: 30, p: 0.6, f: 0.2, c: 7.6 },
  { id: "mango", name: "Mango", cat: "Fruit/Honey", kcal: 60, p: 0.8, f: 0.4, c: 15 },
  { id: "apple", name: "Apple", cat: "Fruit/Honey", kcal: 52, p: 0.3, f: 0.2, c: 14 },
  { id: "avocado", name: "Avocado", cat: "Fruit/Honey", kcal: 160, p: 2, f: 15, c: 9 },
  { id: "date", name: "Medjool Date", cat: "Fruit/Honey", kcal: 277, p: 1.8, f: 0.2, c: 75 },
  // Refeed carbs
  { id: "rice", name: "White Rice (cooked)", cat: "Refeed Carb", kcal: 130, p: 2.7, f: 0.3, c: 28 },
  { id: "sweetpot", name: "Sweet Potato (cooked)", cat: "Refeed Carb", kcal: 86, p: 1.6, f: 0.1, c: 20 },
  { id: "potato", name: "White Potato (cooked)", cat: "Refeed Carb", kcal: 87, p: 1.9, f: 0.1, c: 20 },
  { id: "maple", name: "Maple Syrup", cat: "Refeed Carb", kcal: 260, p: 0, f: 0.2, c: 67 },
];

/* ---------- Arsenal (science-backed) ---------- */
type Tip = { title: string; body: string; citation: string; tag: string };
const TIPS: Tip[] = [
  {
    title: "The Post-Prandial Siphon",
    body: "Walking 10 min within 30 min of eating forces GLUT4 translocation in skeletal muscle — clearing blood glucose independent of insulin. Single most underrated metabolic tool.",
    citation: "Reynolds et al. (2016) Diabetologia 59(12):2572–2578",
    tag: "GLUCOSE",
  },
  {
    title: "Protein-First Sequencing",
    body: "Eating protein and fat 15 min before carbohydrates lowers postprandial glucose by ~36% and insulin by ~50%. Same meal, different order, different metabolic outcome.",
    citation: "Shukla et al. (2015) Diabetes Care 38(7):e98–e99",
    tag: "INSULIN",
  },
  {
    title: "Cold Exposure & UCP1",
    body: "2-minute cold showers (or 11 min/week ≤15°C) activate brown adipose tissue and UCP1 thermogenesis. Increases norepinephrine ~530%, raising mood and resting energy expenditure.",
    citation: "Søberg et al. (2021) Cell Reports Medicine 2(10):100408",
    tag: "THERMO",
  },
  {
    title: "Zone 2 Mitochondrial Density",
    body: "150–180 min/week at 60–70% max HR (you can hold a conversation) drives mitochondrial biogenesis via PGC-1α. The substrate for every other metabolic adaptation.",
    citation: "San-Millán & Brooks (2018) Sports Medicine 48:467–479",
    tag: "AEROBIC",
  },
  {
    title: "Fasted Resistance Training",
    body: "Training fasted preserves AMPK signaling and elevates growth hormone. Hypertrophy is unaffected provided total daily protein ≥1.6g/kg bodyweight.",
    citation: "Schoenfeld et al. (2014) J Int Soc Sports Nutr 11:54",
    tag: "TRAINING",
  },
  {
    title: "Morning UVB & Testosterone",
    body: "Direct sun exposure on skin (esp. torso) within 1 hour of waking elevates serum vitamin D3 and free testosterone. Sunscreen blocks 95–98% of the relevant UVB band.",
    citation: "Pilz et al. (2011) Horm Metab Res 43(3):223–225",
    tag: "HORMONES",
  },
  {
    title: "Saturated Fat & Steroidogenesis",
    body: "Diets <20% fat suppress total testosterone by 10–15% in men. Cholesterol is the substrate for all steroid hormones — including testosterone, cortisol, and estrogen.",
    citation: "Whittaker & Wu (2021) J Steroid Biochem Mol Biol 210:105878",
    tag: "HORMONES",
  },
  {
    title: "Creatine for Brain & Body",
    body: "5g/day creatine monohydrate improves working memory, reduces mental fatigue, and raises ATP regeneration in muscle. The most studied legal ergogenic aid in existence.",
    citation: "Avgerinos et al. (2018) Exp Gerontol 108:166–173",
    tag: "COGNITION",
  },
  {
    title: "Ruminant Bioavailability Stack",
    body: "Beef provides complete heme iron, B12, zinc, retinol, choline, and creatine in ratios plant matrices cannot match. ~99% protein digestibility (PDCAAS=1.0) vs 50–70% for legumes.",
    citation: "Leroy et al. (2022) Animal Frontiers 12(5):11–18",
    tag: "NUTRIENTS",
  },
  {
    title: "Honey + Glucose Refeed",
    body: "Fructose:glucose blends (e.g. raw honey) refill liver glycogen ~2x faster than glucose alone post-training. Fructose uses GLUT5, bypassing the saturated GLUT4 pathway.",
    citation: "Jentjens & Jeukendrup (2005) Br J Nutr 93(4):485–492",
    tag: "GLYCOGEN",
  },
];

/* ---------- Helpers ---------- */
const round = (n: number, d = 0) => {
  const m = Math.pow(10, d);
  return Math.round(n * m) / m;
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

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

type Profile = {
  weight: number;
  bodyFat: number;
  tier: ActivityTier;
  lbm: number;
  bmr: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
};

const calcTargets = (weight: number, bodyFat: number, tier: ActivityTier): Profile => {
  const lbm = weight * (1 - bodyFat / 100);
  const bmr = 370 + 21.6 * lbm;
  const calories = bmr * tier.multiplier;
  const protein = weight * 2.2;
  const carbs = tier.carbTarget;
  const fat = Math.max(0, (calories - protein * 4 - carbs * 4) / 9);
  return {
    weight,
    bodyFat,
    tier,
    lbm: round(lbm, 1),
    bmr: round(bmr),
    calories: round(calories),
    protein: round(protein),
    carbs: round(carbs),
    fat: round(fat),
    createdAt: new Date().toISOString(),
  };
};

type LogEntry = {
  id: string;
  foodId: string;
  name: string;
  grams: number;
  kcal: number;
  p: number;
  f: number;
  c: number;
  time: string;
  dateKey: string;
};

/* =========================================================
   ROOT
   ========================================================= */
export default function Index() {
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [bank, setBank] = useState<number>(0);
  const [bankHistory, setBankHistory] = useState<{ date: string; deficit: number }[]>([]);
  const [tab, setTab] = useState<"hud" | "fuel" | "ledger" | "arsenal">("hud");

  /* Load all */
  useEffect(() => {
    (async () => {
      const [p, l, b, bh] = await Promise.all([
        AsyncStorage.getItem(STORAGE.profile),
        AsyncStorage.getItem(STORAGE.log),
        AsyncStorage.getItem(STORAGE.bank),
        AsyncStorage.getItem(STORAGE.bankHistory),
      ]);
      if (p) setProfile(JSON.parse(p));
      if (l) setLog(JSON.parse(l));
      if (b) setBank(parseFloat(b));
      if (bh) setBankHistory(JSON.parse(bh));
      setLoaded(true);
    })();
  }, []);

  const saveProfile = async (p: Profile) => {
    setProfile(p);
    await AsyncStorage.setItem(STORAGE.profile, JSON.stringify(p));
  };

  const saveLog = async (next: LogEntry[]) => {
    setLog(next);
    await AsyncStorage.setItem(STORAGE.log, JSON.stringify(next));
  };

  const saveBank = async (val: number, history: { date: string; deficit: number }[]) => {
    setBank(val);
    setBankHistory(history);
    await AsyncStorage.setItem(STORAGE.bank, String(val));
    await AsyncStorage.setItem(STORAGE.bankHistory, JSON.stringify(history));
  };

  const resetAll = async () => {
    await AsyncStorage.multiRemove([STORAGE.profile, STORAGE.log, STORAGE.bank, STORAGE.bankHistory]);
    setProfile(null);
    setLog([]);
    setBank(0);
    setBankHistory([]);
  };

  if (!loaded) {
    return (
      <View style={[styles.root, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={styles.brandSmall}>PRIMALFORGE</Text>
      </View>
    );
  }

  if (!profile) {
    return <Onboarding onComplete={saveProfile} />;
  }

  /* Today's totals */
  const today = log.filter((e) => e.dateKey === todayKey());
  const totals = today.reduce(
    (acc, e) => ({
      kcal: acc.kcal + e.kcal,
      p: acc.p + e.p,
      f: acc.f + e.f,
      c: acc.c + e.c,
    }),
    { kcal: 0, p: 0, f: 0, c: 0 }
  );

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <StatusBar style="light" />
      <View style={styles.shell}>
        <Header profile={profile} onReset={resetAll} />
        <View style={{ flex: 1 }}>
          {tab === "hud" && <HUDView profile={profile} totals={totals} />}
          {tab === "fuel" && (
            <FuelView
              log={today}
              onLog={async (entry) => saveLog([...log, entry])}
              onWipe={async () => saveLog(log.filter((e) => e.dateKey !== todayKey()))}
            />
          )}
          {tab === "ledger" && (
            <LedgerView
              profile={profile}
              consumedCarbs={totals.c}
              bank={bank}
              history={bankHistory}
              onBank={async () => {
                const deficit = profile.carbs - totals.c;
                if (deficit <= 0) {
                  Alert.alert("NO DEFICIT", "You're at or over carb target today. Nothing to bank.");
                  return;
                }
                const already = bankHistory.find((h) => h.date === todayKey());
                if (already) {
                  Alert.alert("ALREADY BANKED", "Today's deficit is already in the vault.");
                  return;
                }
                const newHist = [{ date: todayKey(), deficit: round(deficit, 1) }, ...bankHistory];
                await saveBank(round(bank + deficit, 1), newHist);
              }}
              onReset={async () => saveBank(0, [])}
            />
          )}
          {tab === "arsenal" && <ArsenalView />}
        </View>
        <TabBar tab={tab} setTab={setTab} />
      </View>
    </SafeAreaView>
  );
}

/* =========================================================
   HEADER
   ========================================================= */
function Header({ profile, onReset }: { profile: Profile; onReset: () => void }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.brand}>PRIMALFORGE</Text>
        <Text style={styles.brandSub}>
          {profile.tier.label} · {profile.calories} kcal
        </Text>
      </View>
      <TouchableOpacity
        testID="header-reset-btn"
        onPress={() =>
          confirmAction("WIPE PROTOCOL", "Reset profile, logs, and bank?", onReset)
        }
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
  const [weight, setWeight] = useState("");
  const [bf, setBf] = useState("");
  const [tier, setTier] = useState<ActivityTier | null>(null);

  const valid =
    parseFloat(weight) > 0 && parseFloat(bf) >= 0 && parseFloat(bf) < 60 && tier !== null;

  const submit = () => {
    if (!valid || !tier) return;
    const p = calcTargets(parseFloat(weight), parseFloat(bf), tier);
    onComplete(p);
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.shell}
      >
        <ScrollView contentContainerStyle={styles.onboardScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.onboardHero}>
            <Text style={styles.onboardKicker}>INITIATE</Text>
            <Text style={styles.brand}>PRIMALFORGE</Text>
            <Text style={styles.onboardLead}>
              Calibrate the engine. Katch–McArdle formula. No fluff, no NHS guidelines.
            </Text>
          </View>

          <View style={styles.onboardField}>
            <Text style={styles.label}>BODY WEIGHT · KG</Text>
            <TextInput
              testID="onboard-weight-input"
              value={weight}
              onChangeText={setWeight}
              placeholder="84"
              placeholderTextColor={C.textMute}
              keyboardType="decimal-pad"
              style={styles.input}
            />
          </View>

          <View style={styles.onboardField}>
            <Text style={styles.label}>BODY FAT · %</Text>
            <TextInput
              testID="onboard-bf-input"
              value={bf}
              onChangeText={setBf}
              placeholder="15"
              placeholderTextColor={C.textMute}
              keyboardType="decimal-pad"
              style={styles.input}
            />
            <Text style={styles.hint}>Estimate. DEXA &gt; calipers &gt; mirror.</Text>
          </View>

          <View style={styles.onboardField}>
            <Text style={styles.label}>TRAINING LOAD</Text>
            {ACTIVITY_TIERS.map((t) => {
              const active = tier?.id === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  testID={`onboard-tier-${t.id}`}
                  onPress={() => setTier(t)}
                  style={[styles.tierBtn, active && styles.tierBtnActive]}
                >
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
          </View>

          <TouchableOpacity
            testID="onboard-submit-btn"
            disabled={!valid}
            onPress={submit}
            style={[styles.primaryBtn, !valid && styles.primaryBtnDisabled]}
          >
            <Text style={styles.primaryBtnText}>FORGE PROFILE →</Text>
          </TouchableOpacity>

          <Text style={styles.onboardFooter}>
            LBM = W × (1 − BF/100) · BMR = 370 + 21.6 × LBM · TDEE = BMR × Activity
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =========================================================
   HUD VIEW
   ========================================================= */
function HUDView({
  profile,
  totals,
}: {
  profile: Profile;
  totals: { kcal: number; p: number; f: number; c: number };
}) {
  const carbDelta = totals.c - profile.carbs;
  let carbStatus: "optimal" | "warning" | "penalty" = "optimal";
  if (carbDelta > 20) carbStatus = "penalty";
  else if (carbDelta > 0) carbStatus = "warning";

  const burpees = carbDelta > 20 ? Math.ceil((Math.max(0, carbDelta) * 4) / 1.4) : 0;

  return (
    <ScrollView contentContainerStyle={styles.scrollPad} testID="hud-view">
      <Text style={styles.sectionKicker}>HUD · {todayKey()}</Text>

      <View style={styles.macroGrid}>
        <MacroBar label="CALORIES" unit="kcal" value={totals.kcal} target={profile.calories} color={C.text} />
        <MacroBar label="PROTEIN" unit="g" value={totals.p} target={profile.protein} color={C.science} />
        <MacroBar label="FAT" unit="g" value={totals.f} target={profile.fat} color={C.warning} />
        <MacroBar label="CARBS" unit="g" value={totals.c} target={profile.carbs} color={
          carbStatus === "optimal" ? C.optimal : carbStatus === "warning" ? C.warning : C.penalty
        } />
      </View>

      <CarbStatusCard status={carbStatus} delta={carbDelta} target={profile.carbs} consumed={totals.c} />

      {burpees > 0 && <BurpeePenalty burpees={burpees} />}

      <View style={styles.miniStats}>
        <MiniStat label="LBM" value={`${profile.lbm} kg`} />
        <MiniStat label="BMR" value={`${profile.bmr}`} />
        <MiniStat label="TDEE" value={`${profile.calories}`} />
      </View>
    </ScrollView>
  );
}

function MacroBar({
  label,
  unit,
  value,
  target,
  color,
}: {
  label: string;
  unit: string;
  value: number;
  target: number;
  color: string;
}) {
  const pct = Math.min(100, target > 0 ? (value / target) * 100 : 0);
  return (
    <View style={styles.macroCard} testID={`macro-${label.toLowerCase()}`}>
      <Text style={styles.macroLabel}>{label}</Text>
      <View style={styles.macroValueRow}>
        <Text style={styles.macroValue}>{round(value, 1)}</Text>
        <Text style={styles.macroTarget}>
          / {round(target)} {unit}
        </Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function CarbStatusCard({
  status,
  delta,
  target,
  consumed,
}: {
  status: "optimal" | "warning" | "penalty";
  delta: number;
  target: number;
  consumed: number;
}) {
  const color = status === "optimal" ? C.optimal : status === "warning" ? C.warning : C.penalty;
  const tag = status === "optimal" ? "OPTIMAL" : status === "warning" ? "WARNING" : "OVERFLOW";
  const detail =
    status === "optimal"
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
    return Array.from({ length: 6 }, (_, i) => ({
      idx: i + 1,
      offset: i * 30,
      reps: per,
    }));
  }, [burpees]);

  return (
    <View style={styles.penaltyCard} testID="burpee-penalty">
      <Text style={styles.penaltyTag}>EXCESS CARB DEBT</Text>
      <Text style={styles.penaltyValue} testID="burpee-count">
        🔴 {burpees} BURPEES REQUIRED
      </Text>
      <Text style={styles.penaltyFormula}>
        ((excess × 4 kcal) ÷ 1.4) — repay glycogen surplus or store as adipose.
      </Text>
      {burpees > 50 && (
        <TouchableOpacity
          testID="siphon-alarm-btn"
          onPress={() => setSiphon(true)}
          style={styles.siphonBtn}
        >
          <Ionicons name="alarm-outline" size={16} color={C.bg} />
          <Text style={styles.siphonBtnText}>INITIATE SIPHON ALARM</Text>
        </TouchableOpacity>
      )}

      <Modal visible={siphon} transparent animationType="fade" onRequestClose={() => setSiphon(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard} testID="siphon-modal">
            <Text style={styles.modalTitle}>SIPHON PROTOCOL</Text>
            <Text style={styles.modalSub}>
              Burpees fragmented across 3 hours. Every 30 min. GLUT4 stays open.
            </Text>
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
  return (
    <View style={styles.miniStatBox}>
      <Text style={styles.miniStatLabel}>{label}</Text>
      <Text style={styles.miniStatValue}>{value}</Text>
    </View>
  );
}

/* =========================================================
   FUEL VIEW
   ========================================================= */
function FuelView({
  log,
  onLog,
  onWipe,
}: {
  log: LogEntry[];
  onLog: (e: LogEntry) => void;
  onWipe: () => void;
}) {
  const [picker, setPicker] = useState(false);
  const [selected, setSelected] = useState<Food | null>(null);
  const [grams, setGrams] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return FOODS;
    return FOODS.filter((f) => f.name.toLowerCase().includes(q) || f.cat.toLowerCase().includes(q));
  }, [search]);

  const submit = () => {
    const g = parseFloat(grams);
    if (!selected || !g || g <= 0) return;
    const ratio = g / 100;
    const entry: LogEntry = {
      id: `${Date.now()}`,
      foodId: selected.id,
      name: selected.name,
      grams: g,
      kcal: round(selected.kcal * ratio, 1),
      p: round(selected.p * ratio, 1),
      f: round(selected.f * ratio, 1),
      c: round(selected.c * ratio, 1),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      dateKey: todayKey(),
    };
    onLog(entry);
    setSelected(null);
    setGrams("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollPad} keyboardShouldPersistTaps="handled" testID="fuel-view">
        <Text style={styles.sectionKicker}>FUEL · LOG WHOLE FOODS</Text>

        <TouchableOpacity
          testID="open-food-picker"
          onPress={() => setPicker(true)}
          style={styles.foodPickerBtn}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.foodPickerLabel}>FOOD</Text>
            <Text style={styles.foodPickerValue}>
              {selected ? selected.name : "Tap to select…"}
            </Text>
            {selected && (
              <Text style={styles.foodPickerMeta}>
                {selected.kcal} kcal · {selected.p}P / {selected.f}F / {selected.c}C per 100g
              </Text>
            )}
          </View>
          <Ionicons name="chevron-down" size={20} color={C.textDim} />
        </TouchableOpacity>

        <View style={styles.onboardField}>
          <Text style={styles.label}>GRAMS</Text>
          <TextInput
            testID="fuel-grams-input"
            value={grams}
            onChangeText={setGrams}
            placeholder="200"
            placeholderTextColor={C.textMute}
            keyboardType="decimal-pad"
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          testID="fuel-log-btn"
          onPress={submit}
          disabled={!selected || !grams}
          style={[styles.primaryBtn, (!selected || !grams) && styles.primaryBtnDisabled]}
        >
          <Text style={styles.primaryBtnText}>LOG INTAKE →</Text>
        </TouchableOpacity>

        <View style={styles.todayLogHeader}>
          <Text style={styles.sectionKicker}>TODAY'S LOG · {log.length}</Text>
          {log.length > 0 && (
            <TouchableOpacity
              testID="wipe-day-btn"
              onPress={() => confirmAction("WIPE DAY", "Erase today's log?", onWipe)}
            >
              <Text style={styles.wipeText}>WIPE DAY</Text>
            </TouchableOpacity>
          )}
        </View>

        {log.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No intake logged. Eat or fast.</Text>
          </View>
        ) : (
          [...log].reverse().map((e) => (
            <View key={e.id} style={styles.logCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.logName}>{e.name}</Text>
                <Text style={styles.logMeta}>
                  {e.grams}g · {e.time}
                </Text>
              </View>
              <View style={styles.logMacros}>
                <Text style={styles.logKcal}>{e.kcal} kcal</Text>
                <Text style={styles.logBreak}>
                  {e.p}P · {e.f}F · {e.c}C
                </Text>
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
              <TextInput
                testID="food-search-input"
                value={search}
                onChangeText={setSearch}
                placeholder="ribeye, salmon, honey…"
                placeholderTextColor={C.textMute}
                style={styles.searchInput}
              />
            </View>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
              {filtered.map((f) => (
                <Pressable
                  key={f.id}
                  testID={`food-option-${f.id}`}
                  onPress={() => {
                    setSelected(f);
                    setPicker(false);
                    setSearch("");
                  }}
                  style={({ pressed }) => [styles.foodRow, pressed && { backgroundColor: C.cardHi }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.foodRowName}>{f.name}</Text>
                    <Text style={styles.foodRowCat}>{f.cat}</Text>
                  </View>
                  <View style={styles.foodRowMeta}>
                    <Text style={styles.foodRowKcal}>{f.kcal}</Text>
                    <Text style={styles.foodRowMacros}>
                      {f.p}P · {f.f}F · {f.c}C
                    </Text>
                  </View>
                </Pressable>
              ))}
              {filtered.length === 0 && (
                <Text style={styles.emptyText}>No match. Whole foods only.</Text>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

/* =========================================================
   LEDGER VIEW
   ========================================================= */
function LedgerView({
  profile,
  consumedCarbs,
  bank,
  history,
  onBank,
  onReset,
}: {
  profile: Profile;
  consumedCarbs: number;
  bank: number;
  history: { date: string; deficit: number }[];
  onBank: () => void;
  onReset: () => void;
}) {
  const todayDeficit = profile.carbs - consumedCarbs;
  const alreadyBanked = history.some((h) => h.date === todayKey());
  return (
    <ScrollView contentContainerStyle={styles.scrollPad} testID="ledger-view">
      <Text style={styles.sectionKicker}>WEEKLY LEDGER · CARB BANK</Text>

      <View style={styles.bankCard}>
        <Text style={styles.bankLabel}>BANKED SURPLUS</Text>
        <Text style={styles.bankValue} testID="bank-value">
          {round(bank, 1)}g
        </Text>
        <Text style={styles.bankSub}>
          Glycogen reserves accumulated. Spend on weekend supercompensation.
        </Text>
      </View>

      <View style={styles.todayDeficitCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>TODAY'S DEFICIT</Text>
          <Text style={[styles.deficitValue, { color: todayDeficit > 0 ? C.optimal : C.penalty }]}>
            {todayDeficit > 0 ? "+" : ""}
            {round(todayDeficit, 1)}g
          </Text>
          <Text style={styles.hint}>
            Target {profile.carbs}g · Consumed {round(consumedCarbs, 1)}g
          </Text>
        </View>
        <TouchableOpacity
          testID="bank-deficit-btn"
          onPress={onBank}
          disabled={todayDeficit <= 0 || alreadyBanked}
          style={[
            styles.bankBtn,
            (todayDeficit <= 0 || alreadyBanked) && styles.bankBtnDisabled,
          ]}
        >
          <Text style={styles.bankBtnText}>{alreadyBanked ? "BANKED" : "BANK IT"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.todayLogHeader}>
        <Text style={styles.sectionKicker}>HISTORY · {history.length}</Text>
        {history.length > 0 && (
          <TouchableOpacity
            testID="reset-bank-btn"
            onPress={() =>
              confirmAction("RESET BANK", "Clear all banked surplus and history?", onReset)
            }
          >
            <Text style={styles.wipeText}>RESET BANK</Text>
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No deposits yet. Run a deficit, bank it.</Text>
        </View>
      ) : (
        history.map((h) => (
          <View key={h.date} style={styles.historyRow}>
            <Text style={styles.historyDate}>{h.date}</Text>
            <Text style={styles.historyDeficit}>+{h.deficit}g</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

/* =========================================================
   ARSENAL VIEW
   ========================================================= */
function ArsenalView() {
  return (
    <ScrollView contentContainerStyle={styles.scrollPad} testID="arsenal-view">
      <Text style={styles.sectionKicker}>ARSENAL · METABOLIC INTEL</Text>
      <Text style={styles.arsenalLead}>
        Peer-reviewed protocols. No bro-science. Citations included.
      </Text>
      {TIPS.map((t, i) => (
        <View key={i} style={styles.tipCard} testID={`tip-${i}`}>
          <View style={styles.tipHeader}>
            <Text style={styles.tipIdx}>0{i + 1 < 10 ? i + 1 : i + 1}</Text>
            <Text style={styles.tipTag}>{t.tag}</Text>
          </View>
          <Text style={styles.tipTitle}>{t.title}</Text>
          <Text style={styles.tipBody}>{t.body}</Text>
          <View style={styles.citationBar}>
            <View style={[styles.dot, { backgroundColor: C.science }]} />
            <Text style={styles.tipCitation}>{t.citation}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

/* =========================================================
   TAB BAR
   ========================================================= */
function TabBar({
  tab,
  setTab,
}: {
  tab: "hud" | "fuel" | "ledger" | "arsenal";
  setTab: (t: "hud" | "fuel" | "ledger" | "arsenal") => void;
}) {
  const items: { id: typeof tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: "hud", label: "HUD", icon: "pulse" },
    { id: "fuel", label: "FUEL", icon: "flame" },
    { id: "ledger", label: "LEDGER", icon: "wallet" },
    { id: "arsenal", label: "ARSENAL", icon: "flash" },
  ];
  return (
    <View style={styles.tabBar}>
      {items.map((it) => {
        const active = tab === it.id;
        return (
          <TouchableOpacity
            key={it.id}
            testID={`tab-${it.id}`}
            onPress={() => setTab(it.id)}
            style={styles.tabBtn}
          >
            <Ionicons name={it.icon} size={20} color={active ? C.text : C.textMute} />
            <Text style={[styles.tabLabel, active && { color: C.text }]}>{it.label}</Text>
            {active && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/* =========================================================
   STYLES
   ========================================================= */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  shell: {
    flex: 1,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 480 : undefined,
    alignSelf: "center",
    backgroundColor: C.bg,
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: C.border,
  },
  brand: {
    fontSize: 22,
    fontWeight: "900",
    color: C.text,
    letterSpacing: 4,
  },
  brandSmall: { color: C.text, letterSpacing: 6, fontWeight: "900" },
  brandSub: {
    color: C.textDim,
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 2,
    fontWeight: "700",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.card,
  },

  /* Onboarding */
  onboardScroll: { padding: 20, paddingBottom: 60 },
  onboardHero: { marginTop: 20, marginBottom: 40 },
  onboardKicker: {
    color: C.science,
    letterSpacing: 6,
    fontWeight: "900",
    fontSize: 11,
    marginBottom: 8,
  },
  onboardLead: {
    color: C.textDim,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    maxWidth: 320,
  },
  onboardField: { marginBottom: 24 },
  label: {
    color: C.textDim,
    letterSpacing: 3,
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 8,
  },
  input: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    color: C.text,
    fontSize: 22,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 10,
  },
  hint: { color: C.textMute, fontSize: 11, marginTop: 6, letterSpacing: 1 },
  tierBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
  },
  tierBtnActive: {
    borderColor: C.text,
    backgroundColor: C.cardHi,
  },
  tierLabel: {
    color: C.textDim,
    fontWeight: "900",
    letterSpacing: 2,
    fontSize: 13,
  },
  tierSub: { color: C.textMute, fontSize: 12, marginTop: 4 },
  tierMeta: { alignItems: "flex-end" },
  tierMetaTop: { color: C.text, fontWeight: "900", fontSize: 14 },
  tierMetaBot: { color: C.textDim, fontSize: 11, fontWeight: "700", marginTop: 2 },

  primaryBtn: {
    backgroundColor: C.text,
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnDisabled: { backgroundColor: C.border },
  primaryBtnText: {
    color: C.bg,
    fontWeight: "900",
    letterSpacing: 3,
    fontSize: 13,
  },
  onboardFooter: {
    color: C.textMute,
    fontSize: 10,
    textAlign: "center",
    marginTop: 24,
    letterSpacing: 1,
    lineHeight: 16,
  },

  /* Sections */
  scrollPad: { padding: 20, paddingBottom: 100 },
  sectionKicker: {
    color: C.textDim,
    letterSpacing: 4,
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 14,
  },

  /* Macro grid */
  macroGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  macroCard: {
    width: "48%",
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 14,
  },
  macroLabel: {
    color: C.textDim,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "800",
    marginBottom: 8,
  },
  macroValueRow: { flexDirection: "row", alignItems: "baseline" },
  macroValue: { color: C.text, fontSize: 24, fontWeight: "900" },
  macroTarget: { color: C.textMute, fontSize: 11, marginLeft: 6, fontWeight: "700" },
  barTrack: {
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    marginTop: 10,
    overflow: "hidden",
  },
  barFill: { height: 4, borderRadius: 2 },

  /* Status */
  statusCard: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    backgroundColor: C.card,
    marginBottom: 14,
  },
  statusHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  statusTag: { fontSize: 11, fontWeight: "900", letterSpacing: 3 },
  statusDetail: { color: C.text, fontSize: 14, lineHeight: 20 },

  /* Penalty */
  penaltyCard: {
    backgroundColor: "#1a0808",
    borderWidth: 1.5,
    borderColor: C.penalty,
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
  },
  penaltyTag: {
    color: C.penalty,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: "900",
    marginBottom: 8,
  },
  penaltyValue: {
    color: C.text,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  },
  penaltyFormula: {
    color: C.textDim,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  siphonBtn: {
    backgroundColor: C.penalty,
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  siphonBtnText: {
    color: C.bg,
    fontWeight: "900",
    letterSpacing: 2,
    fontSize: 12,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.borderHi,
    borderRadius: 16,
    padding: 22,
  },
  modalTitle: {
    color: C.penalty,
    letterSpacing: 4,
    fontWeight: "900",
    fontSize: 14,
  },
  modalSub: {
    color: C.textDim,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    marginBottom: 18,
  },
  block: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.bg2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  blockIdx: {
    color: C.penalty,
    fontWeight: "900",
    fontSize: 18,
    width: 40,
  },
  blockTime: {
    color: C.textDim,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "700",
  },
  blockReps: { color: C.text, fontWeight: "900", fontSize: 16, marginTop: 2 },

  /* Mini stats */
  miniStats: { flexDirection: "row", gap: 10, marginTop: 4 },
  miniStatBox: {
    flex: 1,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  miniStatLabel: { color: C.textMute, fontSize: 10, letterSpacing: 2, fontWeight: "800" },
  miniStatValue: { color: C.text, fontSize: 16, fontWeight: "900", marginTop: 4 },

  /* Fuel */
  foodPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  foodPickerLabel: { color: C.textDim, fontSize: 10, letterSpacing: 3, fontWeight: "800" },
  foodPickerValue: { color: C.text, fontSize: 16, fontWeight: "700", marginTop: 6 },
  foodPickerMeta: { color: C.textMute, fontSize: 11, marginTop: 4 },

  todayLogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 10,
  },
  wipeText: {
    color: C.penalty,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "900",
  },
  emptyBox: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: "dashed",
    borderRadius: 10,
    padding: 24,
    alignItems: "center",
  },
  emptyText: { color: C.textMute, fontSize: 13 },

  logCard: {
    flexDirection: "row",
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  logName: { color: C.text, fontWeight: "700", fontSize: 14 },
  logMeta: { color: C.textMute, fontSize: 11, marginTop: 4 },
  logMacros: { alignItems: "flex-end" },
  logKcal: { color: C.text, fontWeight: "900", fontSize: 14 },
  logBreak: { color: C.textDim, fontSize: 11, marginTop: 4 },

  /* Picker modal */
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: C.border,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginTop: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: C.text,
    fontSize: 15,
    paddingVertical: 14,
  },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  foodRowName: { color: C.text, fontWeight: "700", fontSize: 14 },
  foodRowCat: {
    color: C.textMute,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "800",
    marginTop: 4,
  },
  foodRowMeta: { alignItems: "flex-end" },
  foodRowKcal: { color: C.text, fontWeight: "900", fontSize: 14 },
  foodRowMacros: { color: C.textDim, fontSize: 11, marginTop: 4 },

  /* Ledger */
  bankCard: {
    backgroundColor: "#06180c",
    borderWidth: 1.5,
    borderColor: C.optimal,
    borderRadius: 14,
    padding: 22,
    marginBottom: 16,
  },
  bankLabel: {
    color: C.optimal,
    letterSpacing: 4,
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 8,
  },
  bankValue: {
    color: C.optimal,
    fontSize: 56,
    fontWeight: "900",
    letterSpacing: -2,
  },
  bankSub: { color: C.textDim, fontSize: 12, marginTop: 8, lineHeight: 18 },
  todayDeficitCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 16,
    gap: 14,
  },
  deficitValue: { fontSize: 28, fontWeight: "900", marginTop: 4 },
  bankBtn: {
    backgroundColor: C.optimal,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
  },
  bankBtnDisabled: { backgroundColor: C.border },
  bankBtnText: {
    color: C.bg,
    fontWeight: "900",
    letterSpacing: 2,
    fontSize: 12,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 6,
  },
  historyDate: { color: C.textDim, fontSize: 13, fontWeight: "700" },
  historyDeficit: { color: C.optimal, fontWeight: "900", fontSize: 16 },

  /* Arsenal */
  arsenalLead: {
    color: C.textDim,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  tipCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
  },
  tipHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  tipIdx: {
    color: C.textMute,
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 2,
    marginRight: 10,
  },
  tipTag: {
    color: C.science,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 3,
    backgroundColor: "rgba(14,165,233,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tipTitle: {
    color: C.text,
    fontWeight: "900",
    fontSize: 18,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tipBody: { color: C.textDim, fontSize: 13, lineHeight: 20 },
  citationBar: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: C.border,
    gap: 8,
  },
  tipCitation: {
    color: C.science,
    fontSize: 11,
    fontWeight: "700",
    flex: 1,
  },

  /* Tab Bar */
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg2,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingBottom: 14,
    position: "relative",
  },
  tabLabel: {
    color: C.textMute,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "900",
    marginTop: 4,
  },
  tabIndicator: {
    position: "absolute",
    top: 0,
    width: 28,
    height: 2,
    backgroundColor: C.text,
  },
});
