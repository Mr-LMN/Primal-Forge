/* =========================================================
   PRIMALFORGE — DATA MODULE
   Foods · Tips · Workouts · Constants · Types
   ========================================================= */

export const C = {
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
  gold: "#f5b400",
  fire: "#ff6a00",
};

export const STORAGE = {
  profile: "pf_profile_v2",
  log: "pf_log_v2",
  bank: "pf_bank_v2",
  bankHistory: "pf_bank_history_v2",
  water: "pf_water_v2",
  weights: "pf_weights_v2",
  recents: "pf_recents_v2",
  xp: "pf_xp_v3",
  workouts: "pf_workouts_v3",
  intelRead: "pf_intel_read_v3",
};

/* ---------- Types ---------- */
export type Sex = "m" | "f";
export type Goal = "fatloss" | "muscle" | "maintain" | "athlete";
export type BfMode = "manual" | "tape" | "visual";

export type ActivityTier = {
  id: string;
  label: string;
  sub: string;
  multiplier: number;
  carbTarget: number;
};

export const ACTIVITY_TIERS: ActivityTier[] = [
  { id: "sedentary", label: "DESK LIFE", sub: "Rarely train · mostly sitting", multiplier: 1.2, carbTarget: 50 },
  { id: "baseline", label: "BASELINE", sub: "2–3x / week · moderate effort", multiplier: 1.375, carbTarget: 100 },
  { id: "heavy", label: "HEAVY LIFTING", sub: "4–5x / week · barbell focus", multiplier: 1.55, carbTarget: 150 },
  { id: "metcon", label: "METCON / ATHLETE", sub: "Daily training · high intensity", multiplier: 1.725, carbTarget: 200 },
];

export const GOALS: { id: Goal; label: string; sub: string; kcalAdj: number; proPerKg: number; locked?: boolean }[] = [
  { id: "fatloss", label: "FAT LOSS", sub: "Strip adipose · preserve LBM · 20% deficit", kcalAdj: 0.8, proPerKg: 2.4 },
  { id: "muscle", label: "MUSCLE GAIN", sub: "Lean tissue accrual · 10% surplus", kcalAdj: 1.1, proPerKg: 2.2 },
  { id: "maintain", label: "MAINTAIN", sub: "Recomposition at TDEE", kcalAdj: 1.0, proPerKg: 2.0 },
  { id: "athlete", label: "ATHLETE TIER", sub: "HYROX · CROSSFIT · IRONMAN — coming soon", kcalAdj: 1.05, proPerKg: 2.2, locked: true },
];

export const VISUAL_BF: Record<Sex, { id: string; label: string; bf: number; sub: string }[]> = {
  m: [
    { id: "shred", label: "SHREDDED", bf: 8, sub: "Striated. Vascular. Stage-ready." },
    { id: "athletic", label: "ATHLETIC", bf: 12, sub: "Visible abs. Veins on arms." },
    { id: "lean", label: "LEAN", bf: 17, sub: "Faint abs. Light softness." },
    { id: "average", label: "AVERAGE", bf: 22, sub: "No visible abs. Some belly." },
    { id: "soft", label: "SOFT", bf: 28, sub: "Roundness across torso." },
  ],
  f: [
    { id: "athletic", label: "ATHLETIC", bf: 17, sub: "Visible abs. Defined arms." },
    { id: "fit", label: "FIT", bf: 22, sub: "Toned. Faint abs in light." },
    { id: "average", label: "AVERAGE", bf: 27, sub: "Healthy curves." },
    { id: "soft", label: "SOFT", bf: 32, sub: "Roundness across hips/thighs." },
    { id: "higher", label: "HIGHER", bf: 37, sub: "Above-average adiposity." },
  ],
};

/* ---------- Foods (per 100g) ---------- */
export type Unit = { id: string; label: string; g: number };
export type Food = {
  id: string; name: string; cat: string;
  kcal: number; p: number; f: number; c: number;
  units?: Unit[];
};

export const FOODS: Food[] = [
  { id: "mince5", name: "Beef Mince 5% (lean, cooked)", cat: "Beef", kcal: 174, p: 27, f: 7, c: 0 },
  { id: "mince10", name: "Beef Mince 10% (cooked)", cat: "Beef", kcal: 217, p: 26, f: 12, c: 0 },
  { id: "mince20", name: "Beef Mince 20% (cooked)", cat: "Beef", kcal: 273, p: 24, f: 21, c: 0 },
  { id: "sirloin", name: "Sirloin Steak (grilled)", cat: "Beef", kcal: 244, p: 28, f: 14, c: 0 },
  { id: "rump", name: "Rump Steak (grilled)", cat: "Beef", kcal: 218, p: 30, f: 11, c: 0 },
  { id: "ribeye", name: "Ribeye Steak (grilled)", cat: "Beef", kcal: 271, p: 25, f: 19, c: 0 },
  { id: "topside", name: "Roast Topside (cooked)", cat: "Beef", kcal: 195, p: 31, f: 8, c: 0 },
  { id: "oxheart", name: "Ox Heart", cat: "Beef", kcal: 179, p: 28, f: 6, c: 0 },
  { id: "oxliver", name: "Ox Liver / Beef Liver", cat: "Beef", kcal: 175, p: 27, f: 5, c: 4 },
  { id: "marrow", name: "Bone Marrow", cat: "Beef", kcal: 786, p: 7, f: 84, c: 0 },
  { id: "lambmince", name: "Lamb Mince (cooked)", cat: "Lamb", kcal: 258, p: 25, f: 17, c: 0 },
  { id: "lambchop", name: "Lamb Chop (grilled)", cat: "Lamb", kcal: 294, p: 25, f: 21, c: 0 },
  { id: "lambshoulder", name: "Slow-Roast Lamb Shoulder", cat: "Lamb", kcal: 285, p: 25, f: 21, c: 0 },
  { id: "mutton", name: "Mutton (cooked)", cat: "Lamb", kcal: 246, p: 24, f: 16, c: 0 },
  { id: "back-bacon", name: "Back Bacon (grilled)", cat: "Pork", kcal: 215, p: 24, f: 13, c: 0,
    units: [{ id: "rasher", label: "rasher", g: 25 }] },
  { id: "streaky-bacon", name: "Streaky Bacon (grilled)", cat: "Pork", kcal: 541, p: 37, f: 42, c: 1,
    units: [{ id: "rasher", label: "rasher", g: 8 }] },
  { id: "gammon", name: "Gammon Steak (grilled)", cat: "Pork", kcal: 165, p: 25, f: 7, c: 0 },
  { id: "porkbelly", name: "Pork Belly (slow-roast)", cat: "Pork", kcal: 518, p: 9, f: 53, c: 0 },
  { id: "porkloin", name: "Pork Loin Chop (grilled)", cat: "Pork", kcal: 231, p: 25, f: 14, c: 0 },
  { id: "cumberland", name: "Cumberland Sausage (grilled)", cat: "Pork", kcal: 296, p: 14, f: 25, c: 5,
    units: [{ id: "sausage", label: "sausage", g: 60 }] },
  { id: "lincolnshire", name: "Lincolnshire Sausage (grilled)", cat: "Pork", kcal: 285, p: 14, f: 23, c: 6,
    units: [{ id: "sausage", label: "sausage", g: 55 }] },
  { id: "blackpud", name: "Black Pudding (sliced, fried)", cat: "Pork", kcal: 297, p: 11, f: 22, c: 13,
    units: [{ id: "slice", label: "slice", g: 30 }] },
  { id: "porkscratch", name: "Pork Scratchings", cat: "Pork", kcal: 605, p: 53, f: 44, c: 0 },
  { id: "breast", name: "Chicken Breast (cooked)", cat: "Poultry", kcal: 165, p: 31, f: 4, c: 0 },
  { id: "thigh", name: "Chicken Thigh (skin on)", cat: "Poultry", kcal: 229, p: 25, f: 14, c: 0 },
  { id: "wings", name: "Chicken Wings (skin on)", cat: "Poultry", kcal: 266, p: 27, f: 17, c: 0 },
  { id: "roastchicken", name: "Whole Roast Chicken (meat+skin)", cat: "Poultry", kcal: 239, p: 27, f: 14, c: 0 },
  { id: "turkey", name: "Roast Turkey (meat+skin)", cat: "Poultry", kcal: 189, p: 28, f: 8, c: 0 },
  { id: "duck", name: "Duck Breast (skin on)", cat: "Poultry", kcal: 337, p: 19, f: 28, c: 0 },
  { id: "pheasant", name: "Pheasant (roast)", cat: "Poultry", kcal: 213, p: 31, f: 9, c: 0 },
  { id: "salmon", name: "Scottish Salmon (grilled)", cat: "Seafood", kcal: 208, p: 20, f: 13, c: 0 },
  { id: "smokedsalmon", name: "Smoked Salmon", cat: "Seafood", kcal: 117, p: 18, f: 5, c: 0 },
  { id: "kippers", name: "Kippers (smoked herring)", cat: "Seafood", kcal: 217, p: 25, f: 13, c: 0 },
  { id: "mackerel", name: "Mackerel (grilled)", cat: "Seafood", kcal: 305, p: 19, f: 25, c: 0 },
  { id: "smokedmackerel", name: "Smoked Mackerel", cat: "Seafood", kcal: 354, p: 19, f: 31, c: 0 },
  { id: "sardines", name: "Sardines (in olive oil)", cat: "Seafood", kcal: 208, p: 25, f: 11, c: 0 },
  { id: "tunaspring", name: "Tuna (canned in spring water)", cat: "Seafood", kcal: 116, p: 26, f: 1, c: 0 },
  { id: "cod", name: "Cod Fillet (baked)", cat: "Seafood", kcal: 105, p: 23, f: 1, c: 0 },
  { id: "haddock", name: "Smoked Haddock (poached)", cat: "Seafood", kcal: 116, p: 24, f: 2, c: 0 },
  { id: "plaice", name: "Plaice (grilled)", cat: "Seafood", kcal: 98, p: 19, f: 2, c: 0 },
  { id: "prawns", name: "Prawns (cooked)", cat: "Seafood", kcal: 99, p: 24, f: 0.3, c: 0.2 },
  { id: "brownshrimp", name: "Brown Shrimp (potted)", cat: "Seafood", kcal: 106, p: 22, f: 2, c: 0 },
  { id: "mussels", name: "Mussels (steamed)", cat: "Seafood", kcal: 86, p: 12, f: 2, c: 4 },
  { id: "oysters", name: "Native Oysters", cat: "Seafood", kcal: 81, p: 9, f: 2, c: 5,
    units: [{ id: "oyster", label: "oyster", g: 15 }] },
  { id: "egg-whole", name: "Whole Egg (medium)", cat: "Eggs/Dairy", kcal: 155, p: 13, f: 11, c: 1,
    units: [{ id: "egg", label: "egg", g: 50 }] },
  { id: "egg-yolk", name: "Egg Yolk", cat: "Eggs/Dairy", kcal: 322, p: 16, f: 27, c: 4,
    units: [{ id: "yolk", label: "yolk", g: 17 }] },
  { id: "egg-white", name: "Egg White", cat: "Eggs/Dairy", kcal: 52, p: 11, f: 0, c: 0.7,
    units: [{ id: "white", label: "white", g: 33 }] },
  { id: "milk-blue", name: "Whole Milk (blue top)", cat: "Eggs/Dairy", kcal: 64, p: 3.4, f: 3.6, c: 4.7,
    units: [{ id: "tbsp", label: "tbsp", g: 15 }, { id: "cup", label: "cup (250ml)", g: 258 }] },
  { id: "milk-green", name: "Semi-Skimmed (green top)", cat: "Eggs/Dairy", kcal: 47, p: 3.5, f: 1.7, c: 4.8,
    units: [{ id: "tbsp", label: "tbsp", g: 15 }, { id: "cup", label: "cup (250ml)", g: 258 }] },
  { id: "double-cream", name: "Double Cream", cat: "Eggs/Dairy", kcal: 467, p: 1.7, f: 50, c: 1.7,
    units: [{ id: "tbsp", label: "tbsp", g: 15 }, { id: "tsp", label: "tsp", g: 5 }] },
  { id: "single-cream", name: "Single Cream", cat: "Eggs/Dairy", kcal: 195, p: 2.4, f: 19, c: 4,
    units: [{ id: "tbsp", label: "tbsp", g: 15 }, { id: "tsp", label: "tsp", g: 5 }] },
  { id: "greek-yog", name: "Greek-Style Yoghurt (full fat)", cat: "Eggs/Dairy", kcal: 133, p: 5.7, f: 10, c: 5,
    units: [{ id: "tbsp", label: "tbsp", g: 16 }] },
  { id: "cheddar", name: "Mature Cheddar (West Country)", cat: "Eggs/Dairy", kcal: 416, p: 25, f: 35, c: 0.1 },
  { id: "stilton", name: "Stilton (blue)", cat: "Eggs/Dairy", kcal: 410, p: 24, f: 35, c: 0.1 },
  { id: "wensleydale", name: "Wensleydale", cat: "Eggs/Dairy", kcal: 380, p: 23, f: 31, c: 0.1 },
  { id: "redleicester", name: "Red Leicester", cat: "Eggs/Dairy", kcal: 401, p: 24, f: 33, c: 0.1 },
  { id: "lancashire", name: "Lancashire Cheese", cat: "Eggs/Dairy", kcal: 373, p: 23, f: 31, c: 0.1 },
  { id: "cottage", name: "Cottage Cheese", cat: "Eggs/Dairy", kcal: 98, p: 11, f: 4, c: 3.4,
    units: [{ id: "tbsp", label: "tbsp", g: 16 }] },
  { id: "butter", name: "Butter (English, salted)", cat: "Eggs/Dairy", kcal: 717, p: 0.9, f: 81, c: 0.1,
    units: [{ id: "tbsp", label: "tbsp", g: 14 }, { id: "tsp", label: "tsp", g: 5 }, { id: "knob", label: "knob", g: 10 }] },
  { id: "ghee", name: "Ghee", cat: "Eggs/Dairy", kcal: 900, p: 0, f: 100, c: 0,
    units: [{ id: "tbsp", label: "tbsp", g: 13 }, { id: "tsp", label: "tsp", g: 4.5 }] },
  { id: "dripping", name: "Beef Dripping", cat: "Animal Fat", kcal: 902, p: 0, f: 100, c: 0,
    units: [{ id: "tbsp", label: "tbsp", g: 13 }, { id: "tsp", label: "tsp", g: 4.5 }] },
  { id: "lard", name: "Lard", cat: "Animal Fat", kcal: 902, p: 0, f: 100, c: 0,
    units: [{ id: "tbsp", label: "tbsp", g: 13 }, { id: "tsp", label: "tsp", g: 4.5 }] },
  { id: "tallow", name: "Tallow", cat: "Animal Fat", kcal: 902, p: 0, f: 100, c: 0,
    units: [{ id: "tbsp", label: "tbsp", g: 13 }, { id: "tsp", label: "tsp", g: 4.5 }] },
  { id: "duckfat", name: "Duck Fat", cat: "Animal Fat", kcal: 882, p: 0, f: 99, c: 0,
    units: [{ id: "tbsp", label: "tbsp", g: 13 }, { id: "tsp", label: "tsp", g: 4.5 }] },
  { id: "honey", name: "British Raw Honey", cat: "Fruit/Honey", kcal: 304, p: 0.3, f: 0, c: 82,
    units: [{ id: "tbsp", label: "tbsp", g: 21 }, { id: "tsp", label: "tsp", g: 7 }] },
  { id: "apple", name: "Apple (Bramley/Cox)", cat: "Fruit/Honey", kcal: 52, p: 0.3, f: 0.2, c: 14,
    units: [{ id: "apple", label: "apple", g: 180 }] },
  { id: "banana", name: "Banana", cat: "Fruit/Honey", kcal: 89, p: 1.1, f: 0.3, c: 23,
    units: [{ id: "banana", label: "banana", g: 120 }] },
  { id: "strawberry", name: "Strawberries", cat: "Fruit/Honey", kcal: 32, p: 0.7, f: 0.3, c: 7.7 },
  { id: "blueberry", name: "Blueberries", cat: "Fruit/Honey", kcal: 57, p: 0.7, f: 0.3, c: 14 },
  { id: "blackberry", name: "Blackberries", cat: "Fruit/Honey", kcal: 43, p: 1.4, f: 0.5, c: 10 },
  { id: "raspberry", name: "Raspberries", cat: "Fruit/Honey", kcal: 52, p: 1.2, f: 0.7, c: 12 },
  { id: "pear", name: "Pear (Conference)", cat: "Fruit/Honey", kcal: 57, p: 0.4, f: 0.1, c: 15,
    units: [{ id: "pear", label: "pear", g: 178 }] },
  { id: "avocado", name: "Avocado", cat: "Fruit/Honey", kcal: 160, p: 2, f: 15, c: 9,
    units: [{ id: "avo", label: "avocado", g: 150 }] },
  { id: "jacket", name: "Jacket Potato (baked)", cat: "Refeed Carb", kcal: 93, p: 2.5, f: 0.1, c: 21,
    units: [{ id: "potato", label: "med jacket", g: 250 }] },
  { id: "newpot", name: "New Potatoes (boiled)", cat: "Refeed Carb", kcal: 75, p: 1.7, f: 0.1, c: 17 },
  { id: "sweetpot", name: "Sweet Potato (baked)", cat: "Refeed Carb", kcal: 90, p: 2, f: 0.1, c: 21 },
  { id: "rice-white", name: "White Rice (boiled)", cat: "Refeed Carb", kcal: 130, p: 2.7, f: 0.3, c: 28 },
  { id: "maple", name: "Maple Syrup", cat: "Refeed Carb", kcal: 260, p: 0, f: 0.2, c: 67,
    units: [{ id: "tbsp", label: "tbsp", g: 20 }, { id: "tsp", label: "tsp", g: 7 }] },
];

/* ---------- Tips (Daily Intel + Vault archive) ---------- */
export type Tip = { title: string; body: string; citation: string; tag: string };

export const TIPS: Tip[] = [
  { title: "The Post-Prandial Siphon", body: "Walking 10 min within 30 min of eating forces GLUT4 translocation in skeletal muscle — clearing blood glucose independent of insulin.", citation: "Reynolds et al. (2016) Diabetologia 59(12):2572", tag: "GLUCOSE" },
  { title: "Protein-First Sequencing", body: "Eating protein and fat 15 min before carbohydrates lowers postprandial glucose by ~36% and insulin by ~50%.", citation: "Shukla et al. (2015) Diabetes Care 38(7):e98", tag: "INSULIN" },
  { title: "Cold Exposure & UCP1", body: "2-min cold showers (or 11 min/week ≤15°C) activate brown adipose tissue thermogenesis. Norepinephrine rises ~530%.", citation: "Søberg et al. (2021) Cell Reports Medicine 2(10):100408", tag: "THERMO" },
  { title: "Zone 2 Mitochondrial Density", body: "150–180 min/week at 60–70% max HR drives mitochondrial biogenesis via PGC-1α. Substrate for every other adaptation.", citation: "San-Millán & Brooks (2018) Sports Medicine 48:467", tag: "AEROBIC" },
  { title: "Protein Distribution > Total", body: "4 doses of 0.4g/kg per meal stimulates muscle protein synthesis ~25% more than 2 large doses, even at matched daily protein.", citation: "Mamerow et al. (2014) J Nutr 144(6):876", tag: "MPS" },
  { title: "Fasted Resistance Training", body: "Training fasted preserves AMPK signaling. Hypertrophy is unaffected provided total daily protein ≥1.6 g/kg bodyweight.", citation: "Schoenfeld et al. (2014) JISSN 11:54", tag: "TRAINING" },
  { title: "Morning UVB & Testosterone", body: "Direct sun on skin within 1 hr of waking elevates serum vitamin D3 and free testosterone. Sunscreen blocks 95–98% of UVB.", citation: "Pilz et al. (2011) Horm Metab Res 43(3):223", tag: "HORMONES" },
  { title: "Saturated Fat & Steroidogenesis", body: "Diets <20% fat suppress total testosterone 10–15% in men. Cholesterol is substrate for all steroid hormones.", citation: "Whittaker & Wu (2021) J Steroid Biochem 210:105878", tag: "HORMONES" },
  { title: "Creatine for Brain & Body", body: "5g/day creatine monohydrate improves working memory, reduces mental fatigue, and raises ATP regeneration in muscle.", citation: "Avgerinos et al. (2018) Exp Gerontol 108:166", tag: "COGNITION" },
  { title: "Ruminant Bioavailability Stack", body: "Beef provides complete heme iron, B12, zinc, retinol, choline, creatine in ratios plant matrices cannot match. ~99% protein digestibility.", citation: "Leroy et al. (2022) Animal Frontiers 12(5):11", tag: "NUTRIENTS" },
  { title: "Honey + Glucose Refeed", body: "Fructose:glucose blends (e.g. honey) refill liver glycogen ~2× faster than glucose alone post-training. Fructose uses GLUT5.", citation: "Jentjens & Jeukendrup (2005) Br J Nutr 93(4):485", tag: "GLYCOGEN" },
  { title: "Sleep & Lean Mass Loss", body: "Sleep restricted to 5.5h/night during a deficit causes 60% MORE lean mass loss vs 8.5h — same calories, same protein.", citation: "Nedeltcheva et al. (2010) Ann Intern Med 153(7):435", tag: "RECOVERY" },
  { title: "VO₂max & All-Cause Mortality", body: "Each 1-MET (3.5ml/kg/min) increase in VO₂max reduces all-cause mortality risk by ~13%. Train aerobic capacity ruthlessly.", citation: "Mandsager et al. (2018) JAMA Netw Open 1(6):e183605", tag: "LONGEVITY" },
  { title: "Heavy Compound Lifts & Bone", body: "Squats and deadlifts at >80% 1RM produce site-specific bone-mineral-density gains the lighter loads cannot replicate. Critical past 40.", citation: "Watson et al. (2018) J Bone Miner Res 33(2):211", tag: "BONE" },
  { title: "Endocrine Disruptors in Cosmetics", body: "Parabens and phthalates absorb transdermally and detectably alter testosterone, estradiol, and thyroid hormone. Audit your bathroom shelf.", citation: "Meeker et al. (2011) Environ Health Perspect 119(2):252", tag: "TOXINS" },
];

/* ---------- Workouts (FORGE) ---------- */
export type WorkoutFocus = "fatburn" | "performance" | "strength" | "metcon" | "mobility" | "recovery";

export type Exercise = {
  name: string;
  setsReps: string;
  cue?: string;
  videoQuery: string;
};

export type Workout = {
  id: string;
  name: string;
  time: number; // minutes
  focus: WorkoutFocus;
  intensity: "low" | "med" | "high" | "max";
  description: string;
  scienceNote: string;
  citation?: string;
  exercises: Exercise[];
};

export const FOCUS_META: Record<WorkoutFocus, { label: string; color: string }> = {
  fatburn: { label: "FAT BURN", color: "#ff6a00" },
  performance: { label: "PERFORMANCE", color: "#0ea5e9" },
  strength: { label: "STRENGTH", color: "#f5b400" },
  metcon: { label: "METCON", color: "#dc2626" },
  mobility: { label: "MOBILITY", color: "#22c55e" },
  recovery: { label: "RECOVERY", color: "#9a9a9a" },
};

const SU = "squat university"; // default form-tutorial channel

export const WORKOUTS: Workout[] = [
  // ===== FAT BURN (6) =====
  {
    id: "tabata-torch", name: "TABATA TORCH", time: 4, focus: "fatburn", intensity: "max",
    description: "Maximal-output 4-minute protocol. 8 rounds of 20s all-out / 10s rest.",
    scienceNote: "The original Tabata study showed VO₂max gains equal to 1hr of moderate cycling, in 4 minutes — provided each 20s round is genuine all-out effort (170%+ VO₂max).",
    citation: "Tabata et al. (1996) Med Sci Sports Exerc 28(10):1327",
    exercises: [
      { name: "Burpee (8 rounds)", setsReps: "20s ON / 10s OFF × 8", cue: "Chest to floor every rep. No pacing.", videoQuery: "burpee form tutorial " + SU },
    ],
  },
  {
    id: "post-meal-walk", name: "POST-PRANDIAL SIPHON", time: 10, focus: "fatburn", intensity: "low",
    description: "Brisk walk within 30 min of a meal. Single most underrated metabolic tool.",
    scienceNote: "Activates GLUT4-mediated glucose uptake in muscle independent of insulin. Blunts postprandial glucose excursion ~30% in T2D and healthy adults.",
    citation: "Reynolds et al. (2016) Diabetologia 59(12):2572",
    exercises: [
      { name: "Brisk Walk (post-meal)", setsReps: "10 min · 100+ steps/min", cue: "Pace = comfortable but purposeful. Not a stroll.", videoQuery: "brisk walking pace technique" },
    ],
  },
  {
    id: "20-emom", name: "20-MIN EMOM CRUSHER", time: 20, focus: "fatburn", intensity: "high",
    description: "Every minute on the minute, 20 min. 4 movements rotating.",
    scienceNote: "Constant-rate intervals at ~85% MaxHR maximise EPOC (excess post-exercise oxygen consumption) — fat oxidation stays elevated 14–48 hr post-session.",
    citation: "LaForgia et al. (2006) J Sports Sci 24(12):1247",
    exercises: [
      { name: "Min 1 — Kettlebell Swings", setsReps: "15 reps", cue: "Hip hinge, not a squat. Glutes fire at the top.", videoQuery: "kettlebell swing form " + SU },
      { name: "Min 2 — Push-ups", setsReps: "10 reps", cue: "Hands under shoulders. Full lockout.", videoQuery: "push up form " + SU },
      { name: "Min 3 — Air Squats", setsReps: "20 reps", cue: "Knees track toes. Hip crease below knee.", videoQuery: "air squat form " + SU },
      { name: "Min 4 — Row (or burpees)", setsReps: "200m row / 10 burpees", cue: "Drive with legs first.", videoQuery: "rowing technique concept2" },
    ],
  },
  {
    id: "vo2-intervals", name: "VO₂ INTERVAL CRUSHER", time: 16, focus: "fatburn", intensity: "max",
    description: "8 × 1 min hard / 1 min easy on bike, rower, or running.",
    scienceNote: "1-on/1-off intervals at 90%+ MaxHR drive VO₂max gains 3× faster than steady-state cardio. Most time-efficient cardio protocol.",
    citation: "Helgerud et al. (2007) Med Sci Sports Exerc 39(4):665",
    exercises: [
      { name: "Hard Interval", setsReps: "8 × 1 min @ RPE 9/10", cue: "Cannot speak. Legs/lungs burning.", videoQuery: "vo2 max interval training" },
      { name: "Easy Recovery", setsReps: "8 × 1 min @ RPE 4/10", cue: "Active recovery. Don't stop moving.", videoQuery: "active recovery cardio" },
    ],
  },
  {
    id: "zone2", name: "ZONE 2 ENGINE BUILD", time: 30, focus: "fatburn", intensity: "low",
    description: "Conversational pace cardio. Heart rate 60–70% of max.",
    scienceNote: "Zone 2 is the only intensity that selectively recruits type-I fibres long enough to upregulate mitochondrial density via PGC-1α. The aerobic foundation.",
    citation: "San-Millán & Brooks (2018) Sports Medicine 48:467",
    exercises: [
      { name: "Steady-State Cardio", setsReps: "30 min · HR 60–70% max", cue: "Nose-breathe if possible. Should be able to speak full sentences.", videoQuery: "zone 2 training heart rate" },
    ],
  },
  {
    id: "incline-burn", name: "INCLINE TREADMILL BURN", time: 12, focus: "fatburn", intensity: "med",
    description: "12% incline at walking pace. Hands off the rails.",
    scienceNote: "Steep incline walking elevates posterior-chain recruitment and energy expenditure to match running, with a fraction of joint impact.",
    citation: "Ebbeling et al. (1994) Am J Phys Med Rehabil 73(2):88",
    exercises: [
      { name: "Incline Walk", setsReps: "12 min · 12% grade · 5 km/h", cue: "Don't grip the rails. Lean slightly forward at the ankle.", videoQuery: "12-3-30 treadmill walking" },
    ],
  },

  // ===== PERFORMANCE / HYROX (5) =====
  {
    id: "hyrox-sim-1", name: "HYROX SIM — STATIONS 1–4", time: 35, focus: "performance", intensity: "high",
    description: "Sled push, sled pull, burpee broad jump, ski erg — race pace.",
    scienceNote: "Hyrox alternates running with high-power resistance work. Specificity of pacing across sled push/pull is the #1 predictor of finish time among amateurs.",
    citation: "Hyrox Performance Report (2024)",
    exercises: [
      { name: "Run", setsReps: "1 km", videoQuery: "hyrox running pace strategy" },
      { name: "Sled Push", setsReps: "50m · 152kg M / 102kg F", cue: "Hips low. Drive through ball of foot.", videoQuery: "sled push technique hyrox" },
      { name: "Run", setsReps: "1 km", videoQuery: "hyrox running pace strategy" },
      { name: "Sled Pull", setsReps: "50m · 103kg M / 78kg F", cue: "Hips back. Pull arm-over-arm.", videoQuery: "sled pull technique hyrox" },
      { name: "Run", setsReps: "1 km", videoQuery: "hyrox running pace strategy" },
      { name: "Burpee Broad Jump", setsReps: "80m", cue: "Land soft. Don't break rhythm.", videoQuery: "burpee broad jump hyrox" },
    ],
  },
  {
    id: "row-wallball", name: "ROW + WALL BALL DOUBLES", time: 25, focus: "performance", intensity: "high",
    description: "8 rounds: 250m row + 25 wall balls. Hyrox-style transitions.",
    scienceNote: "Cyclical+ballistic pairing trains the energy-system shift Hyrox demands. Lactate clearance under load is the rate-limiter for sub-90 finishers.",
    citation: "Bishop et al. (2008) Sports Med 38(11):947",
    exercises: [
      { name: "Concept2 Row", setsReps: "8 × 250m", cue: "Legs–back–arms. Don't rush the recovery.", videoQuery: "concept2 row technique" },
      { name: "Wall Ball", setsReps: "8 × 25 reps · 9kg M / 6kg F", cue: "Squat depth. Drive ball to 10ft target.", videoQuery: "wall ball form crossfit" },
    ],
  },
  {
    id: "farmers-march", name: "FARMER'S MARCH EMOM", time: 10, focus: "performance", intensity: "med",
    description: "Heavy carry every minute, 10 rounds. Grip and trunk endurance.",
    scienceNote: "Loaded carries simultaneously train grip, anti-lateral-flexion core, and aerobic capacity — transferable to every Hyrox station.",
    citation: "McGill (2010) Strength Cond J 32(3):33",
    exercises: [
      { name: "Farmer's Walk", setsReps: "10 × 30m · 32kg/hand", cue: "Stand tall. Crush the handles.", videoQuery: "farmers walk technique " + SU },
    ],
  },
  {
    id: "sled-endurance", name: "SLED ENDURANCE BLOCK", time: 25, focus: "performance", intensity: "high",
    description: "5 × 100m sled push at 40% bodyweight load.",
    scienceNote: "Sled training trains horizontal force production — the most Hyrox-specific quality. Joint-friendly hypertrophy stimulus for quads and glutes.",
    citation: "Cross et al. (2017) Front Physiol 8:412",
    exercises: [
      { name: "Heavy Sled Push", setsReps: "5 × 100m · ~40% BW load", cue: "Hips low. Don't stand up out of position.", videoQuery: "heavy sled push technique" },
    ],
  },
  {
    id: "hyrox-tt", name: "HYROX TIME TRIAL", time: 20, focus: "performance", intensity: "max",
    description: "1 km run + 100m sled push. Race pace. Benchmark.",
    scienceNote: "Repeating a benchmark every 4–6 weeks lets you track training transfer. Performance gains hide in the curve, not the day.",
    exercises: [
      { name: "Run", setsReps: "1 km · race pace", cue: "Mid-foot strike. 180 cadence.", videoQuery: "running form 180 cadence" },
      { name: "Sled Push", setsReps: "100m · race weight", cue: "Don't blow up in first 25m.", videoQuery: "hyrox sled pacing strategy" },
    ],
  },

  // ===== METCON / CROSSFIT (4) =====
  {
    id: "cindy", name: "CINDY", time: 20, focus: "metcon", intensity: "high",
    description: "20-min AMRAP: 5 pull-ups · 10 push-ups · 15 air squats. Benchmark WOD.",
    scienceNote: "20-min AMRAPs at 85% MaxHR produce mitochondrial adaptations equal to 60+ min of steady-state cardio. The bodyweight benchmark.",
    citation: "Smith et al. (2013) J Strength Cond Res 27(11):3159",
    exercises: [
      { name: "Pull-up", setsReps: "5 reps", cue: "Chin clears bar. Full hang at bottom.", videoQuery: "pull up form crossfit" },
      { name: "Push-up", setsReps: "10 reps", cue: "Chest to floor. No sagging hips.", videoQuery: "push up form " + SU },
      { name: "Air Squat", setsReps: "15 reps", cue: "Hip below knee. Stand fully.", videoQuery: "air squat form " + SU },
    ],
  },
  {
    id: "fran", name: "FRAN", time: 8, focus: "metcon", intensity: "max",
    description: "21-15-9: thrusters 43kg M / 30kg F + pull-ups. The CrossFit gold standard.",
    scienceNote: "Sub-5-min Fran demands max anaerobic glycolytic capacity. Lactate peaks ~15–18 mmol/L — pure VO₂max territory.",
    citation: "Fernández-Fernández et al. (2015) J Strength Cond Res 29(11):3151",
    exercises: [
      { name: "Thruster", setsReps: "21-15-9 · 43kg M / 30kg F", cue: "Squat depth. Bar locked overhead.", videoQuery: "thruster crossfit form" },
      { name: "Pull-up", setsReps: "21-15-9", cue: "Kipping allowed. Chin over bar.", videoQuery: "kipping pull up technique crossfit" },
    ],
  },
  {
    id: "murph-light", name: "MURPH (LIGHT)", time: 35, focus: "metcon", intensity: "max",
    description: "1 mile run · 50 pull-ups · 100 push-ups · 150 squats · 1 mile run. No vest.",
    scienceNote: "Long, mixed-modal sessions train metabolic efficiency across all energy systems. The original Murph honors Lt. Michael Murphy (KIA 2005).",
    exercises: [
      { name: "Mile Run", setsReps: "1 mile", videoQuery: "running form 180 cadence" },
      { name: "Pull-up", setsReps: "50 reps (partition as needed)", videoQuery: "pull up form crossfit" },
      { name: "Push-up", setsReps: "100 reps", videoQuery: "push up form " + SU },
      { name: "Air Squat", setsReps: "150 reps", videoQuery: "air squat form " + SU },
      { name: "Mile Run", setsReps: "1 mile", videoQuery: "running form 180 cadence" },
    ],
  },
  {
    id: "dt", name: "DT", time: 15, focus: "metcon", intensity: "high",
    description: "5 rounds: 12 deadlifts · 9 hang power cleans · 6 push jerks. 70kg M / 47.5kg F.",
    scienceNote: "Olympic-derivative complexes train rate of force development under fatigue — the holy grail for Hyrox sled work and CrossFit metcons alike.",
    exercises: [
      { name: "Deadlift", setsReps: "5 × 12 · 70kg M / 47.5kg F", cue: "Bar over mid-foot. Lat-tight.", videoQuery: "deadlift form " + SU },
      { name: "Hang Power Clean", setsReps: "5 × 9", cue: "Aggressive hip extension. Elbows fast under bar.", videoQuery: "hang power clean form crossfit" },
      { name: "Push Jerk", setsReps: "5 × 6", cue: "Dip-drive-drop. Lock arms before standing.", videoQuery: "push jerk form crossfit" },
    ],
  },

  // ===== STRENGTH (4) =====
  {
    id: "back-squat-5x5", name: "BACK SQUAT — 5×5", time: 45, focus: "strength", intensity: "high",
    description: "5 sets of 5 reps at 80–85% 1RM. Add 2.5 kg/week.",
    scienceNote: "5×5 progression maximises strength-specific neural adaptation and Type-IIa hypertrophy. Linear progression works for 6–12 months for most lifters.",
    citation: "Schoenfeld et al. (2017) J Strength Cond Res 31(12):3508",
    exercises: [
      { name: "Back Squat", setsReps: "5 × 5 · 80–85% 1RM", cue: "Bar on traps. Hip & knee flex together.", videoQuery: "back squat form " + SU },
      { name: "Romanian Deadlift", setsReps: "3 × 8", cue: "Hinge from hips. Hamstring stretch.", videoQuery: "romanian deadlift " + SU },
      { name: "Walking Lunge", setsReps: "3 × 10/leg", videoQuery: "walking lunge form " + SU },
    ],
  },
  {
    id: "deadlift-531", name: "DEADLIFT — 5/3/1", time: 40, focus: "strength", intensity: "max",
    description: "Wendler 5/3/1 wave: 5@65%, 5@75%, 5+@85% (week 1).",
    scienceNote: "5/3/1 builds sustainable strength via auto-regulated top sets. AMRAP final set provides ongoing 1RM estimate. Decade-proven protocol.",
    citation: "Wendler (2009) Beyond 5/3/1",
    exercises: [
      { name: "Conventional Deadlift", setsReps: "5@65% · 5@75% · 5+@85%", cue: "Lats engaged. Push the floor away.", videoQuery: "conventional deadlift form " + SU },
      { name: "Bent-Over Row", setsReps: "5 × 8", videoQuery: "bent over row form " + SU },
      { name: "Hanging Leg Raise", setsReps: "3 × 10", videoQuery: "hanging leg raise form " + SU },
    ],
  },
  {
    id: "press-day", name: "PRESS DAY — OHP + INCLINE", time: 45, focus: "strength", intensity: "high",
    description: "Strict overhead press + incline bench. Vertical and inclined pressing for rounded shoulder development.",
    scienceNote: "Combining vertical and 30° incline pressing maximises clavicular pec and anterior deltoid recruitment without rotator-cuff overuse.",
    citation: "Trebs et al. (2010) J Strength Cond Res 24(7):1925",
    exercises: [
      { name: "Strict Overhead Press", setsReps: "5 × 5 · 80% 1RM", cue: "Squeeze glutes. No leg drive.", videoQuery: "overhead press form " + SU },
      { name: "Incline Bench Press", setsReps: "4 × 8 · 30°", cue: "Bar to upper chest. Drive through feet.", videoQuery: "incline bench press " + SU },
      { name: "Lateral Raise", setsReps: "3 × 12", videoQuery: "lateral raise form" },
      { name: "Tricep Dip", setsReps: "3 × 10", videoQuery: "tricep dip form " + SU },
    ],
  },
  {
    id: "pull-day", name: "PULL DAY — VERTICAL + HORIZONTAL", time: 45, focus: "strength", intensity: "high",
    description: "Weighted pull-ups + barbell row. Both pull vectors for balanced back development.",
    scienceNote: "Lats produce force in two distinct planes (vertical adduction vs horizontal extension). Both must be loaded for full hypertrophy and posterior chain function.",
    citation: "Andersen et al. (2014) J Strength Cond Res 28(1):91",
    exercises: [
      { name: "Weighted Pull-up", setsReps: "5 × 5", cue: "Initiate with scap depression.", videoQuery: "weighted pull up form " + SU },
      { name: "Barbell Row (Pendlay)", setsReps: "4 × 6", cue: "Bar starts on floor each rep.", videoQuery: "pendlay row form " + SU },
      { name: "Face Pull", setsReps: "3 × 15", videoQuery: "face pull form " + SU },
      { name: "Hammer Curl", setsReps: "3 × 10", videoQuery: "hammer curl form" },
    ],
  },

  // ===== MOBILITY (4) =====
  {
    id: "atg-basics", name: "ATG — KNEES OVER TOES BASICS", time: 15, focus: "mobility", intensity: "low",
    description: "Tibialis raises, ATG split squat, sled drag. Bulletproof knees.",
    scienceNote: "Loaded end-range knee flexion strengthens VMO and patellar tendon at angles where most lifters are weakest. Reduces patellofemoral pain.",
    citation: "Patrick (2022) ATG for Life",
    exercises: [
      { name: "Tibialis Raise", setsReps: "3 × 25 · against wall", cue: "Toes pull up. Heels stay planted.", videoQuery: "tibialis raise atg knees over toes" },
      { name: "ATG Split Squat", setsReps: "3 × 10/leg", cue: "Front knee tracks past toe. No pain.", videoQuery: "atg split squat knees over toes" },
      { name: "Reverse Sled Drag", setsReps: "3 × 30m · light", cue: "Walk backwards. Quads on fire.", videoQuery: "reverse sled drag atg" },
    ],
  },
  {
    id: "hip-flexor-reclaim", name: "HIP FLEXOR RECLAIM", time: 12, focus: "mobility", intensity: "low",
    description: "Couch stretch · 90/90 · half-kneeling lunge. Reverse desk-life damage.",
    scienceNote: "Sitting >6 hr/day shortens iliopsoas and rectus femoris, which then anteriorly tilts pelvis and inhibits glute activation. Daily reset is non-negotiable past 30.",
    citation: "Sahrmann (2002) Diagnosis and Treatment of Movement Impairment Syndromes",
    exercises: [
      { name: "Couch Stretch", setsReps: "2 × 60s/leg", cue: "Squeeze glute on stretching side.", videoQuery: "couch stretch hip flexor " + SU },
      { name: "90/90 Hip Switch", setsReps: "10 switches", cue: "Sit tall. Both knees pin to ground.", videoQuery: "90 90 hip mobility " + SU },
      { name: "Half-Kneeling Lunge Stretch", setsReps: "2 × 45s/leg", videoQuery: "half kneeling lunge stretch " + SU },
    ],
  },
  {
    id: "shoulder-prehab", name: "SHOULDER PREHAB FLOW", time: 10, focus: "mobility", intensity: "low",
    description: "Band pull-aparts · dislocates · scap pulls. Pre-workout staple.",
    scienceNote: "External rotators (infraspinatus, teres minor) are 30% weaker than internal rotators in untrained lifters. Pre-fatigue them daily to prevent impingement.",
    citation: "Cools et al. (2007) Br J Sports Med 41(11):874",
    exercises: [
      { name: "Band Pull-Apart", setsReps: "3 × 20", cue: "Squeeze shoulder blades together.", videoQuery: "band pull apart shoulder " + SU },
      { name: "Band Shoulder Dislocate", setsReps: "3 × 10", cue: "Pass band overhead with straight arms.", videoQuery: "band shoulder dislocate " + SU },
      { name: "Scapular Pull-up", setsReps: "3 × 10", cue: "Hang. Pull shoulder blades down only.", videoQuery: "scapular pull up form " + SU },
    ],
  },
  {
    id: "tspine-opener", name: "T-SPINE OPENERS", time: 8, focus: "mobility", intensity: "low",
    description: "Cat-cow · foam-roll t-spine · thread the needle. Restore overhead position.",
    scienceNote: "Thoracic rotation drives overhead reach, hip rotation, and rib-cage breathing mechanics. Restricted t-spine limits squat depth and OHP lockout.",
    citation: "Cook (2010) Movement",
    exercises: [
      { name: "Cat-Cow", setsReps: "10 reps slow", videoQuery: "cat cow stretch form" },
      { name: "Foam Roll T-Spine", setsReps: "60s · 3 spots", cue: "Pause and exhale on each tight spot.", videoQuery: "foam roll thoracic spine " + SU },
      { name: "Thread the Needle", setsReps: "8/side", videoQuery: "thread the needle stretch" },
    ],
  },

  // ===== RECOVERY (2) =====
  {
    id: "para-reset", name: "PARASYMPATHETIC RESET", time: 10, focus: "recovery", intensity: "low",
    description: "Box breathing 4-4-4-4 · legs up the wall. Drop HRV from sympathetic.",
    scienceNote: "Slow nasal breathing (5–6 breaths/min) maximises HRV and vagal tone. 10 min lowers cortisol and improves sleep onset by ~15 min.",
    citation: "Russo et al. (2017) Breathe 13(4):298",
    exercises: [
      { name: "Box Breathing", setsReps: "5 min · 4-4-4-4 cadence", cue: "Inhale through nose only.", videoQuery: "box breathing 4 4 4 4 navy seal" },
      { name: "Legs Up the Wall", setsReps: "5 min", cue: "Hips against wall. Arms relaxed.", videoQuery: "legs up the wall pose recovery" },
    ],
  },
  {
    id: "cold-walk", name: "COLD + WALK PROTOCOL", time: 25, focus: "recovery", intensity: "med",
    description: "2 min cold shower + 20 min walk. Combined dopamine + glucose siphon.",
    scienceNote: "Cold exposure raises baseline dopamine ~250% sustained for ~2 hr. Pairing with a walk amplifies fat oxidation and blunts post-meal glucose simultaneously.",
    citation: "Søberg et al. (2021) Cell Reports Medicine 2(10):100408",
    exercises: [
      { name: "Cold Shower", setsReps: "2 min · ≤15°C", cue: "Slow exhale. Stay still.", videoQuery: "cold shower protocol benefits" },
      { name: "Outdoor Walk", setsReps: "20 min · brisk", videoQuery: "brisk walking pace technique" },
    ],
  },
];

/* ---------- XP / Credits ---------- */
export const XP_RULES = {
  intelRead: 50,
  mealLogged: 10,
  mealCap: 5, // max meals giving XP per day = 50 max from meals
  workoutLogged: 100,
  workoutCap: 2,
  macrosHit: 200,
  weighIn: 25,
  streak7Bonus: 500,
};

export const CREDIT_PER_XP = 1000; // 1 credit = 1000 XP

export type Perk = {
  id: string;
  title: string;
  partner: string;
  cost: number; // credits
  type: "content" | "affiliate";
  description: string;
};

export const PERKS: Perk[] = [
  { id: "recipes-fatloss", type: "content", title: "FAT-LOSS RECIPE PACK", partner: "PrimalForge", cost: 2, description: "20 macro-balanced whole-food recipes engineered for cuts." },
  { id: "recipes-hyrox", type: "content", title: "HYROX RACE-DAY FUEL PLAN", partner: "PrimalForge", cost: 3, description: "T-72hr to T+0 fuelling protocol with carb back-loading schedule." },
  { id: "advanced-workouts", type: "content", title: "ADVANCED WORKOUT PACK", partner: "PrimalForge", cost: 3, description: "12 elite-level Hyrox simulations and CrossFit benchmarks." },
  { id: "biltong", type: "affiliate", title: "10% OFF BILTONG", partner: "Honest Biltong Co.", cost: 4, description: "Single-ingredient grass-fed beef biltong. Ships UK-wide." },
  { id: "creatine", type: "affiliate", title: "15% OFF CREATINE MONOHYDRATE", partner: "Bulk Powders", cost: 5, description: "Pure creatine monohydrate, 500g. Most studied legal ergogenic." },
  { id: "coffee", type: "affiliate", title: "20% OFF COLD-BREW COFFEE", partner: "Black Insomnia", cost: 4, description: "Single-origin Tanzanian, low-acid, training-fuel grade." },
];

/* ---------- Utility ---------- */
export const round = (n: number, d = 0) => {
  const m = Math.pow(10, d);
  return Math.round(n * m) / m;
};

export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const dayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

/* US Navy body fat — inputs in cm */
export const navyBF = (sex: Sex, height: number, neck: number, waist: number, hip: number) => {
  const log10 = (n: number) => Math.log(n) / Math.LN10;
  if (sex === "m") {
    const denom = 1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height);
    return 495 / denom - 450;
  }
  const denom = 1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height);
  return 495 / denom - 450;
};
