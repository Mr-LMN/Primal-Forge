/* =========================================================
   PRIMALFORGE — DATA MODULE
   Foods · Tips · Workouts · Equipment · Constants · Types
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
  equipment: "pf_equipment_v4",
  scanHistory: "pf_scan_history_v4",
  recipeFavourites: "pf_recipe_favourites_v1",
  customRecipes: "pf_user_recipes_v1",
  coachHistory: "pf_coach_history_v1",
  supplementLog: "pf_supplement_log_v1",
  dietPreferences: "pf_diet_prefs_v1",
};

/* ---------- Dietary preferences & allergens ---------- */
export const DIET_OPTIONS: { id: string; label: string }[] = [
  { id: "carnivore", label: "Carnivore" },
  { id: "animal-based", label: "Animal-Based" },
  { id: "keto", label: "Keto / Low-Carb" },
  { id: "paleo", label: "Paleo" },
  { id: "no-preference", label: "No Preference" },
];

export const ALLERGEN_OPTIONS: { id: string; label: string }[] = [
  { id: "gluten", label: "Gluten" },
  { id: "dairy", label: "Dairy" },
  { id: "eggs", label: "Eggs" },
  { id: "shellfish", label: "Shellfish" },
  { id: "nuts", label: "Tree Nuts" },
  { id: "soy", label: "Soy" },
  { id: "none", label: "No Allergens" },
];

/* ---------- Profile types ---------- */
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
export type Food = { id: string; name: string; cat: string; kcal: number; p: number; f: number; c: number; units?: Unit[] };

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
  { id: "back-bacon", name: "Back Bacon (grilled)", cat: "Pork", kcal: 215, p: 24, f: 13, c: 0, units: [{ id: "rasher", label: "rasher", g: 25 }] },
  { id: "streaky-bacon", name: "Streaky Bacon (grilled)", cat: "Pork", kcal: 541, p: 37, f: 42, c: 1, units: [{ id: "rasher", label: "rasher", g: 8 }] },
  { id: "gammon", name: "Gammon Steak (grilled)", cat: "Pork", kcal: 165, p: 25, f: 7, c: 0 },
  { id: "porkbelly", name: "Pork Belly (slow-roast)", cat: "Pork", kcal: 518, p: 9, f: 53, c: 0 },
  { id: "porkloin", name: "Pork Loin Chop (grilled)", cat: "Pork", kcal: 231, p: 25, f: 14, c: 0 },
  { id: "cumberland", name: "Cumberland Sausage (grilled)", cat: "Pork", kcal: 296, p: 14, f: 25, c: 5, units: [{ id: "sausage", label: "sausage", g: 60 }] },
  { id: "lincolnshire", name: "Lincolnshire Sausage (grilled)", cat: "Pork", kcal: 285, p: 14, f: 23, c: 6, units: [{ id: "sausage", label: "sausage", g: 55 }] },
  { id: "blackpud", name: "Black Pudding (sliced, fried)", cat: "Pork", kcal: 297, p: 11, f: 22, c: 13, units: [{ id: "slice", label: "slice", g: 30 }] },
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
  { id: "oysters", name: "Native Oysters", cat: "Seafood", kcal: 81, p: 9, f: 2, c: 5, units: [{ id: "oyster", label: "oyster", g: 15 }] },
  { id: "egg-whole", name: "Whole Egg (medium)", cat: "Eggs/Dairy", kcal: 155, p: 13, f: 11, c: 1, units: [{ id: "egg", label: "egg", g: 50 }] },
  { id: "egg-yolk", name: "Egg Yolk", cat: "Eggs/Dairy", kcal: 322, p: 16, f: 27, c: 4, units: [{ id: "yolk", label: "yolk", g: 17 }] },
  { id: "egg-white", name: "Egg White", cat: "Eggs/Dairy", kcal: 52, p: 11, f: 0, c: 0.7, units: [{ id: "white", label: "white", g: 33 }] },
  { id: "milk-blue", name: "Whole Milk (blue top)", cat: "Eggs/Dairy", kcal: 64, p: 3.4, f: 3.6, c: 4.7, units: [{ id: "tbsp", label: "tbsp", g: 15 }, { id: "cup", label: "cup (250ml)", g: 258 }] },
  { id: "milk-green", name: "Semi-Skimmed (green top)", cat: "Eggs/Dairy", kcal: 47, p: 3.5, f: 1.7, c: 4.8, units: [{ id: "tbsp", label: "tbsp", g: 15 }, { id: "cup", label: "cup (250ml)", g: 258 }] },
  { id: "double-cream", name: "Double Cream", cat: "Eggs/Dairy", kcal: 467, p: 1.7, f: 50, c: 1.7, units: [{ id: "tbsp", label: "tbsp", g: 15 }, { id: "tsp", label: "tsp", g: 5 }] },
  { id: "single-cream", name: "Single Cream", cat: "Eggs/Dairy", kcal: 195, p: 2.4, f: 19, c: 4, units: [{ id: "tbsp", label: "tbsp", g: 15 }, { id: "tsp", label: "tsp", g: 5 }] },
  { id: "greek-yog", name: "Greek-Style Yoghurt (full fat)", cat: "Eggs/Dairy", kcal: 133, p: 5.7, f: 10, c: 5, units: [{ id: "tbsp", label: "tbsp", g: 16 }] },
  { id: "cheddar", name: "Mature Cheddar (West Country)", cat: "Eggs/Dairy", kcal: 416, p: 25, f: 35, c: 0.1 },
  { id: "stilton", name: "Stilton (blue)", cat: "Eggs/Dairy", kcal: 410, p: 24, f: 35, c: 0.1 },
  { id: "wensleydale", name: "Wensleydale", cat: "Eggs/Dairy", kcal: 380, p: 23, f: 31, c: 0.1 },
  { id: "redleicester", name: "Red Leicester", cat: "Eggs/Dairy", kcal: 401, p: 24, f: 33, c: 0.1 },
  { id: "lancashire", name: "Lancashire Cheese", cat: "Eggs/Dairy", kcal: 373, p: 23, f: 31, c: 0.1 },
  { id: "cottage", name: "Cottage Cheese", cat: "Eggs/Dairy", kcal: 98, p: 11, f: 4, c: 3.4, units: [{ id: "tbsp", label: "tbsp", g: 16 }] },
  { id: "butter", name: "Butter (English, salted)", cat: "Eggs/Dairy", kcal: 717, p: 0.9, f: 81, c: 0.1, units: [{ id: "tbsp", label: "tbsp", g: 14 }, { id: "tsp", label: "tsp", g: 5 }, { id: "knob", label: "knob", g: 10 }] },
  { id: "ghee", name: "Ghee", cat: "Eggs/Dairy", kcal: 900, p: 0, f: 100, c: 0, units: [{ id: "tbsp", label: "tbsp", g: 13 }, { id: "tsp", label: "tsp", g: 4.5 }] },
  { id: "dripping", name: "Beef Dripping", cat: "Animal Fat", kcal: 902, p: 0, f: 100, c: 0, units: [{ id: "tbsp", label: "tbsp", g: 13 }, { id: "tsp", label: "tsp", g: 4.5 }] },
  { id: "lard", name: "Lard", cat: "Animal Fat", kcal: 902, p: 0, f: 100, c: 0, units: [{ id: "tbsp", label: "tbsp", g: 13 }, { id: "tsp", label: "tsp", g: 4.5 }] },
  { id: "tallow", name: "Tallow", cat: "Animal Fat", kcal: 902, p: 0, f: 100, c: 0, units: [{ id: "tbsp", label: "tbsp", g: 13 }, { id: "tsp", label: "tsp", g: 4.5 }] },
  { id: "duckfat", name: "Duck Fat", cat: "Animal Fat", kcal: 882, p: 0, f: 99, c: 0, units: [{ id: "tbsp", label: "tbsp", g: 13 }, { id: "tsp", label: "tsp", g: 4.5 }] },
  { id: "honey", name: "British Raw Honey", cat: "Fruit/Honey", kcal: 304, p: 0.3, f: 0, c: 82, units: [{ id: "tbsp", label: "tbsp", g: 21 }, { id: "tsp", label: "tsp", g: 7 }] },
  { id: "apple", name: "Apple (Bramley/Cox)", cat: "Fruit/Honey", kcal: 52, p: 0.3, f: 0.2, c: 14, units: [{ id: "apple", label: "apple", g: 180 }] },
  { id: "banana", name: "Banana", cat: "Fruit/Honey", kcal: 89, p: 1.1, f: 0.3, c: 23, units: [{ id: "banana", label: "banana", g: 120 }] },
  { id: "strawberry", name: "Strawberries", cat: "Fruit/Honey", kcal: 32, p: 0.7, f: 0.3, c: 7.7 },
  { id: "blueberry", name: "Blueberries", cat: "Fruit/Honey", kcal: 57, p: 0.7, f: 0.3, c: 14 },
  { id: "blackberry", name: "Blackberries", cat: "Fruit/Honey", kcal: 43, p: 1.4, f: 0.5, c: 10 },
  { id: "raspberry", name: "Raspberries", cat: "Fruit/Honey", kcal: 52, p: 1.2, f: 0.7, c: 12 },
  { id: "pear", name: "Pear (Conference)", cat: "Fruit/Honey", kcal: 57, p: 0.4, f: 0.1, c: 15, units: [{ id: "pear", label: "pear", g: 178 }] },
  { id: "avocado", name: "Avocado", cat: "Fruit/Honey", kcal: 160, p: 2, f: 15, c: 9, units: [{ id: "avo", label: "avocado", g: 150 }] },
  { id: "jacket", name: "Jacket Potato (baked)", cat: "Refeed Carb", kcal: 93, p: 2.5, f: 0.1, c: 21, units: [{ id: "potato", label: "med jacket", g: 250 }] },
  { id: "newpot", name: "New Potatoes (boiled)", cat: "Refeed Carb", kcal: 75, p: 1.7, f: 0.1, c: 17 },
  { id: "sweetpot", name: "Sweet Potato (baked)", cat: "Refeed Carb", kcal: 90, p: 2, f: 0.1, c: 21 },
  { id: "rice-white", name: "White Rice (boiled)", cat: "Refeed Carb", kcal: 130, p: 2.7, f: 0.3, c: 28 },
  { id: "maple", name: "Maple Syrup", cat: "Refeed Carb", kcal: 260, p: 0, f: 0.2, c: 67, units: [{ id: "tbsp", label: "tbsp", g: 20 }, { id: "tsp", label: "tsp", g: 7 }] },
];

/* ---------- Recipes (curated, macro-fit) ---------- */
export type RecipeMeal = "BREAKFAST" | "LUNCH" | "DINNER" | "POST-WO" | "SNACK";
export type RecipeTag = "carnivore" | "animal-based" | "hyrox" | "low-carb" | "high-protein" | "refeed" | "recovery" | "british";
export type RecipeIngredient = { item: string; qty: string };

export type Recipe = {
  id: string;
  name: string;
  meal: RecipeMeal;
  prepMin: number;
  description: string;
  tags: RecipeTag[];
  kcal: number;
  p: number;
  f: number;
  c: number;
  ingredients: RecipeIngredient[];
  steps: string[];
  why?: string;
};

export const RECIPES: Recipe[] = [
  /* BREAKFAST · 5 */
  {
    id: "rec-carn-stack", name: "Carnivore Stack", meal: "BREAKFAST", prepMin: 10,
    description: "Ribeye, 3 eggs, butter. Zero-carb wake-up.",
    tags: ["carnivore", "low-carb", "high-protein"],
    kcal: 874, p: 69, f: 65, c: 1,
    ingredients: [
      { item: "Ribeye steak", qty: "200g" },
      { item: "Whole eggs", qty: "3 medium" },
      { item: "English butter", qty: "14g (1 tbsp)" },
      { item: "Sea salt + black pepper", qty: "to taste" },
    ],
    steps: [
      "Cast-iron pan, ripping hot. Salt the steak.",
      "Sear ribeye 2 min per side for medium-rare. Rest on warm plate.",
      "Drop heat, melt butter. Crack eggs into the rendered fat.",
      "Spoon hot butter over yolks until set whites, runny yolks.",
      "Plate it. No seed oils. No sides. Eat.",
    ],
    why: "Saturated fat + cholesterol → hormones. Steak amino profile peaks leucine for MPS.",
  },
  {
    id: "rec-liver-smash", name: "Liver & Bacon Smash", meal: "BREAKFAST", prepMin: 12,
    description: "Nutrient-dense organ kick. Choline + retinol bomb.",
    tags: ["animal-based", "low-carb", "british"],
    kcal: 382, p: 39, f: 22, c: 4,
    ingredients: [
      { item: "Beef liver", qty: "100g, sliced thin" },
      { item: "Back bacon", qty: "2 rashers (50g)" },
      { item: "English butter", qty: "14g" },
      { item: "Onion (optional)", qty: "30g, sliced" },
    ],
    steps: [
      "Soak liver in milk 10 min before cook. Pat dry.",
      "Render bacon in pan. Set aside.",
      "Add butter to bacon fat. Sear liver 90s per side. Don't overcook.",
      "Stack on plate, bacon on top. Done.",
    ],
    why: "Liver = highest natural source of B12, retinol, copper. Eat once weekly minimum.",
  },
  {
    id: "rec-mack-eggs", name: "Smoked Mackerel & Eggs", meal: "BREAKFAST", prepMin: 6,
    description: "Omega-3 + cholesterol stack. Brain fuel.",
    tags: ["animal-based", "low-carb", "high-protein"],
    kcal: 438, p: 28, f: 36, c: 1,
    ingredients: [
      { item: "Smoked mackerel fillet", qty: "80g" },
      { item: "Whole eggs", qty: "2 medium" },
      { item: "Butter", qty: "10g" },
    ],
    steps: [
      "Flake mackerel onto warm plate.",
      "Melt butter. Scramble eggs low and slow.",
      "Eggs go on top of mackerel. Crack pepper.",
    ],
    why: "Pre-formed DHA/EPA bypasses ALA conversion bottleneck. Highest brain bioavailability.",
  },
  {
    id: "rec-lean-plate", name: "Lean Protein Plate", meal: "BREAKFAST", prepMin: 12,
    description: "Cut day breakfast. High protein, low fat.",
    tags: ["high-protein", "low-carb"],
    kcal: 428, p: 73, f: 8, c: 12,
    ingredients: [
      { item: "Chicken breast (cooked)", qty: "200g" },
      { item: "Egg whites", qty: "100g (~3 whites)" },
      { item: "Blueberries", qty: "80g" },
    ],
    steps: [
      "Slice cold cooked chicken breast.",
      "Pan-scramble egg whites 60s. Don't overdo it.",
      "Plate chicken, whites, berries. Black coffee on the side.",
    ],
    why: "P:F ratio >7 maximises lean protein turnover during deficit. Berries cap oxidative load.",
  },
  {
    id: "rec-marrow-toast", name: "Bone Marrow on Jacket", meal: "BREAKFAST", prepMin: 35,
    description: "Refeed-day decadence. Glycine + collagen + glycogen.",
    tags: ["animal-based", "refeed", "british"],
    kcal: 468, p: 8, f: 25, c: 53,
    ingredients: [
      { item: "Bone marrow (roasted)", qty: "30g (1 small bone)" },
      { item: "Jacket potato", qty: "1 medium (250g)" },
      { item: "Sea salt", qty: "flake, generous" },
    ],
    steps: [
      "Bake jacket 200°C / 50 min until skin crisps.",
      "Roast marrow bone 15 min at 220°C.",
      "Split jacket open. Scoop marrow on top. Salt heavy.",
    ],
    why: "Glycine balances methionine load from muscle meat. Joints + skin + sleep.",
  },

  /* LUNCH · 6 */
  {
    id: "rec-steak-salad", name: "Steak & Avocado Bowl", meal: "LUNCH", prepMin: 10,
    description: "Cold sirloin, ripe avo, butter drizzle. Zero faff.",
    tags: ["animal-based", "low-carb", "high-protein"],
    kcal: 828, p: 59, f: 61, c: 13,
    ingredients: [
      { item: "Sirloin steak (pre-cooked, sliced)", qty: "200g" },
      { item: "Avocado", qty: "1 whole (150g)" },
      { item: "Butter (warm, drizzle)", qty: "14g" },
      { item: "Sea salt + lemon", qty: "to taste" },
    ],
    steps: [
      "Slice cold sirloin against the grain.",
      "Halve avocado. Lay flesh-down.",
      "Melt butter, drizzle over steak. Squeeze lemon. Eat.",
    ],
  },
  {
    id: "rec-lamb-bowl", name: "Lamb Chop Bowl", meal: "LUNCH", prepMin: 12,
    description: "Grass-fed lamb + dark berries. Hyrox training fuel.",
    tags: ["animal-based", "high-protein", "hyrox"],
    kcal: 631, p: 51, f: 42, c: 10,
    ingredients: [
      { item: "Lamb chops", qty: "200g (~2 chops)" },
      { item: "Blackberries", qty: "100g" },
      { item: "Sea salt + rosemary", qty: "to taste" },
    ],
    steps: [
      "Salt chops 20 min ahead. Sear hot pan 3-4 min per side.",
      "Rest 5 min. Plate with berries on the side.",
      "Sprinkle dried rosemary. Eat.",
    ],
  },
  {
    id: "rec-salmon-sweet", name: "Salmon & Sweet Potato", meal: "LUNCH", prepMin: 25,
    description: "Refeed day omega-3 + glycogen replenishment.",
    tags: ["animal-based", "refeed", "recovery"],
    kcal: 696, p: 44, f: 37, c: 42,
    ingredients: [
      { item: "Scottish salmon fillet", qty: "200g" },
      { item: "Sweet potato", qty: "200g, baked" },
      { item: "Butter", qty: "14g" },
    ],
    steps: [
      "Bake sweet potato 200°C / 40 min.",
      "Pan-sear salmon skin-side first 4 min, flip 2 min.",
      "Split sweet potato, drop butter inside. Salmon on the side.",
    ],
  },
  {
    id: "rec-tuna-plate", name: "Tuna Power Plate", meal: "LUNCH", prepMin: 5,
    description: "Tinned tuna, egg, avo. Cubicle-friendly.",
    tags: ["high-protein", "low-carb"],
    kcal: 434, p: 35, f: 28, c: 13,
    ingredients: [
      { item: "Tuna in spring water", qty: "1 tin (100g drained)" },
      { item: "Hard-boiled egg", qty: "1 medium" },
      { item: "Avocado", qty: "1 whole (150g)" },
    ],
    steps: [
      "Drain tuna. Halve egg. Slice avo.",
      "Plate everything. Salt + pepper + lemon. Done in 90s.",
    ],
  },
  {
    id: "rec-roast-lunch", name: "Cold Roast Chicken Plate", meal: "LUNCH", prepMin: 5,
    description: "Sunday roast leftovers. The athlete's meal-prep.",
    tags: ["animal-based", "high-protein", "british"],
    kcal: 510, p: 55, f: 28, c: 8,
    ingredients: [
      { item: "Whole roast chicken (meat+skin)", qty: "200g" },
      { item: "Strawberries", qty: "100g" },
    ],
    steps: [
      "Strip cold roast chicken from carcass.",
      "Plate with strawberries. Sea salt the chicken. Done.",
    ],
  },
  {
    id: "rec-cottage-stack", name: "Cottage Cheese Stack", meal: "LUNCH", prepMin: 3,
    description: "Slow-digesting casein with raw honey + raspberries.",
    tags: ["animal-based", "high-protein"],
    kcal: 312, p: 23, f: 9, c: 36,
    ingredients: [
      { item: "Cottage cheese (full fat)", qty: "200g" },
      { item: "Raspberries", qty: "100g" },
      { item: "Raw honey", qty: "1 tbsp (21g)" },
    ],
    steps: [
      "Cottage cheese into bowl. Top with raspberries.",
      "Drizzle honey. Eat slow — casein digests for 4-6 hr.",
    ],
  },

  /* DINNER · 6 */
  {
    id: "rec-lamb-shoulder", name: "Slow-Roast Lamb Shoulder", meal: "DINNER", prepMin: 240,
    description: "Sunday ritual. Pulls apart with a fork.",
    tags: ["animal-based", "british", "low-carb"],
    kcal: 928, p: 63, f: 77, c: 0,
    ingredients: [
      { item: "Lamb shoulder", qty: "250g (per portion)" },
      { item: "Butter", qty: "30g" },
      { item: "Garlic, rosemary, salt", qty: "generous" },
    ],
    steps: [
      "Score fat. Rub salt + rosemary + garlic.",
      "Roast 160°C / 4 hours. Don't peek.",
      "Rest 20 min. Pull apart with fork. Spoon over butter from the tray.",
    ],
  },
  {
    id: "rec-ribeye-marrow", name: "Ribeye & Marrow", meal: "DINNER", prepMin: 25,
    description: "Carnivore peak meal. Steakhouse at home.",
    tags: ["carnivore", "low-carb", "high-protein"],
    kcal: 914, p: 65, f: 73, c: 0,
    ingredients: [
      { item: "Ribeye", qty: "250g" },
      { item: "Bone marrow", qty: "30g (one bone)" },
      { item: "Sea salt flake", qty: "heavy" },
    ],
    steps: [
      "Roast marrow bone 220°C / 15 min until bubbling.",
      "Sear ribeye cast iron 2 min per side, baste in butter.",
      "Slice ribeye, scoop marrow over each slice. Crack salt on top.",
    ],
  },
  {
    id: "rec-pork-belly", name: "Crackling Pork Belly", meal: "DINNER", prepMin: 180,
    description: "Pork belly slow-roasted, skin shattered with crackling.",
    tags: ["animal-based", "low-carb", "british"],
    kcal: 1070, p: 19, f: 106, c: 8,
    ingredients: [
      { item: "Pork belly", qty: "200g" },
      { item: "Sea salt (heavy on skin)", qty: "1 tbsp" },
      { item: "Blackberries", qty: "80g (palate cleanser)" },
    ],
    steps: [
      "Score skin. Salt heavy. Pat dry.",
      "Roast 160°C / 2 hr to soften, then 220°C / 30 min for crackling.",
      "Rest. Smash crackling with knife handle. Plate with berries.",
    ],
  },
  {
    id: "rec-roast-chicken", name: "Whole Roast Chicken (per serving)", meal: "DINNER", prepMin: 90,
    description: "Spatchcock roasted in butter. Sunday classic.",
    tags: ["animal-based", "high-protein", "british"],
    kcal: 932, p: 81, f: 66, c: 0,
    ingredients: [
      { item: "Roast chicken (meat + skin)", qty: "300g per portion" },
      { item: "Butter (basted)", qty: "30g per portion" },
    ],
    steps: [
      "Spatchcock the bird. Slather with soft butter. Salt heavy.",
      "Roast 200°C / 60 min until juices run clear.",
      "Rest 15 min. Carve. Spoon pan butter on top.",
    ],
  },
  {
    id: "rec-bangers-mash", name: "Cumberland Bangers & Mash", meal: "DINNER", prepMin: 35,
    description: "British classic. Refeed-day comfort fuel.",
    tags: ["british", "refeed"],
    kcal: 802, p: 23, f: 54, c: 59,
    ingredients: [
      { item: "Cumberland sausages", qty: "2 (120g)" },
      { item: "Jacket potato", qty: "1 medium (250g)" },
      { item: "Butter", qty: "30g" },
    ],
    steps: [
      "Bake jacket 200°C / 50 min.",
      "Grill sausages 12 min, turning. No prick.",
      "Smash jacket flesh with butter into mash texture. Plate sausages on top.",
    ],
  },
  {
    id: "rec-mussels-bacon", name: "Mussels & Streaky Bacon", meal: "DINNER", prepMin: 15,
    description: "Coastal British meal. Zinc + omega-3 + fat.",
    tags: ["animal-based", "low-carb", "british"],
    kcal: 485, p: 49, f: 26, c: 11,
    ingredients: [
      { item: "Mussels (cleaned)", qty: "250g" },
      { item: "Streaky bacon", qty: "50g, diced" },
      { item: "Butter", qty: "10g" },
    ],
    steps: [
      "Render bacon in deep pan. Add butter.",
      "Throw mussels in. Lid on. Steam 3-4 min until shells open.",
      "Discard any unopened. Pour mussels + smoked bacon broth into bowl.",
    ],
  },

  /* POST-WORKOUT · 4 */
  {
    id: "rec-recovery-yog", name: "Hyrox Recovery Yog Bowl", meal: "POST-WO", prepMin: 3,
    description: "Casein + simple carbs + polyphenols. Glycogen + repair.",
    tags: ["recovery", "hyrox", "high-protein"],
    kcal: 351, p: 12, f: 21, c: 31,
    ingredients: [
      { item: "Greek-style yoghurt (full fat)", qty: "200g" },
      { item: "Raspberries", qty: "80g" },
      { item: "Raw honey", qty: "2/3 tbsp (14g)" },
    ],
    steps: [
      "Yog in bowl. Berries on top. Honey drizzle.",
      "Eat within 30 min of finishing the session.",
    ],
    why: "Honey fructose hits liver glycogen, glucose hits muscle glycogen. Casein primes overnight repair.",
  },
  {
    id: "rec-glycogen-bomb", name: "Glycogen Bomb", meal: "POST-WO", prepMin: 18,
    description: "Heavy training day refuel. Rapid carb + lean protein.",
    tags: ["refeed", "recovery", "hyrox"],
    kcal: 560, p: 52, f: 7, c: 69,
    ingredients: [
      { item: "Chicken breast", qty: "150g" },
      { item: "White rice (cooked)", qty: "200g" },
      { item: "Maple syrup", qty: "1 tbsp (20g)" },
    ],
    steps: [
      "Pan-cook chicken breast.",
      "Boil white rice. Drizzle maple over rice.",
      "Plate. Eat fast — within 60 min post-session.",
    ],
    why: "GLUT4 transporters open post-training. White rice + maple = fastest glycogen repleter.",
  },
  {
    id: "rec-liver-refuel", name: "Liver Refuel", meal: "POST-WO", prepMin: 18,
    description: "Heavy lifting recovery. Iron + B12 + carbs.",
    tags: ["animal-based", "recovery", "refeed"],
    kcal: 425, p: 31, f: 16, c: 38,
    ingredients: [
      { item: "Beef liver", qty: "100g" },
      { item: "New potatoes (boiled)", qty: "200g" },
      { item: "Butter", qty: "14g" },
    ],
    steps: [
      "Boil new potatoes 12 min, drain.",
      "Sear liver 90s per side in butter.",
      "Plate. Eat warm.",
    ],
  },
  {
    id: "rec-mack-rice", name: "Mackerel & Rice", meal: "POST-WO", prepMin: 15,
    description: "DHA repair + glycogen reload. Crossfit recovery.",
    tags: ["animal-based", "recovery", "refeed"],
    kcal: 653, p: 33, f: 38, c: 42,
    ingredients: [
      { item: "Mackerel fillet (grilled)", qty: "150g" },
      { item: "White rice (cooked)", qty: "150g" },
    ],
    steps: [
      "Grill mackerel 4 min skin-down, 2 min flip.",
      "Boil rice. Plate fish on top of rice. Squeeze lemon.",
    ],
  },

  /* SNACK · 4 */
  {
    id: "rec-snack-box", name: "Carnivore Snack Box", meal: "SNACK", prepMin: 2,
    description: "Pork scratchings + cheddar. Pub food, sniper-precise.",
    tags: ["carnivore", "low-carb", "high-protein"],
    kcal: 390, p: 28, f: 30, c: 0,
    ingredients: [
      { item: "Pork scratchings", qty: "30g" },
      { item: "Mature Cheddar", qty: "50g" },
    ],
    steps: ["Open scratchings. Cube cheddar. Eat. Done."],
  },
  {
    id: "rec-honey-eggs", name: "Honey Eggs Trio", meal: "SNACK", prepMin: 6,
    description: "Soft-boiled eggs with raw honey drizzle.",
    tags: ["animal-based", "high-protein"],
    kcal: 275, p: 19, f: 16, c: 13,
    ingredients: [
      { item: "Whole eggs", qty: "3 medium" },
      { item: "Raw honey", qty: "2/3 tbsp (14g)" },
    ],
    steps: [
      "Soft boil eggs 6 min in rapid water.",
      "Cool 30s under cold tap. Peel.",
      "Plate, drizzle honey, sea salt flake. Eat warm.",
    ],
  },
  {
    id: "rec-salmon-roll", name: "Smoked Salmon & Avocado Roll", meal: "SNACK", prepMin: 4,
    description: "No bread, no rice. Pure protein-fat snack.",
    tags: ["animal-based", "low-carb", "high-protein"],
    kcal: 406, p: 26, f: 29, c: 15,
    ingredients: [
      { item: "Smoked salmon", qty: "100g" },
      { item: "Cottage cheese", qty: "50g" },
      { item: "Avocado", qty: "1 whole (150g)" },
    ],
    steps: [
      "Lay smoked salmon flat. Smear cottage cheese.",
      "Slice avocado lengthways, place on top.",
      "Roll up tight. Slice into rounds. Eat.",
    ],
  },
  {
    id: "rec-yog-berries", name: "Greek Yog & Berries", meal: "SNACK", prepMin: 1,
    description: "Bedtime casein + polyphenols.",
    tags: ["animal-based", "recovery"],
    kcal: 390, p: 15, f: 25, c: 27,
    ingredients: [
      { item: "Greek-style yoghurt (full fat)", qty: "250g" },
      { item: "Blueberries", qty: "100g" },
    ],
    steps: ["Yog in bowl. Berries on top. Eat. Sleep."],
    why: "Casein digests 4-6hr overnight, sustaining MPS through fasted state.",
  },
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

/* ---------- EQUIPMENT ---------- */
export type Equipment =
  | "bodyweight" | "dumbbell" | "kettlebell" | "barbell" | "pullup" | "rower"
  | "skierg" | "sled" | "bike" | "treadmill" | "box" | "bands" | "wallball"
  | "sandbag" | "rings" | "sauna" | "ice";

export const EQUIPMENT_META: Record<Equipment, { label: string; icon: string; common: boolean }> = {
  bodyweight: { label: "Bodyweight", icon: "body", common: true },
  dumbbell:   { label: "Dumbbells", icon: "barbell-outline", common: true },
  kettlebell: { label: "Kettlebell", icon: "barbell", common: true },
  barbell:    { label: "Barbell + Plates", icon: "barbell", common: true },
  pullup:     { label: "Pull-up Bar", icon: "git-network-outline", common: true },
  bands:      { label: "Resistance Bands", icon: "swap-horizontal", common: true },
  rower:      { label: "Rower", icon: "boat-outline", common: false },
  skierg:     { label: "Ski Erg", icon: "trail-sign-outline", common: false },
  sled:       { label: "Sled", icon: "car-outline", common: false },
  bike:       { label: "Air/Echo Bike", icon: "bicycle", common: false },
  treadmill:  { label: "Treadmill", icon: "walk", common: true },
  box:        { label: "Plyo Box", icon: "cube-outline", common: false },
  wallball:   { label: "Wall Ball", icon: "ellipse", common: false },
  sandbag:    { label: "Sandbag", icon: "cube", common: false },
  rings:      { label: "Gymnastic Rings", icon: "ellipse-outline", common: false },
  sauna:      { label: "Sauna", icon: "flame", common: false },
  ice:        { label: "Cold Plunge / Shower", icon: "snow", common: true },
};

/* ---------- Workouts (FORGE) ---------- */
export type WorkoutFocus = "fatburn" | "performance" | "strength" | "metcon" | "mobility" | "recovery";

export type Alt = { name: string; equipment: Equipment[]; videoQuery: string };

export type Exercise = {
  name: string;
  setsReps: string;
  cue?: string;
  videoQuery: string;
  equipment: Equipment[];
  alternatives?: Alt[];
};

export type Workout = {
  id: string;
  name: string;
  source?: string; // CrossFit.com / Hyrox / Marcus Filly / Ben Greenfield / etc
  time: number;
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

const SU = "squat university";
const CFHQ = "crossfit hq";
const HYROX = "hyrox official";
const FILLY = "marcus filly functional bodybuilding";
const GFD = "ben greenfield";

/* Common alt sets — reused below */
const altPullup: Alt[] = [
  { name: "Ring Row (rings)", equipment: ["rings"], videoQuery: "ring row form crossfit" },
  { name: "Bent-Over Row (DB)", equipment: ["dumbbell"], videoQuery: "dumbbell bent over row " + SU },
  { name: "Banded Lat Pulldown", equipment: ["bands"], videoQuery: "band lat pulldown home" },
];
const altBurpee: Alt[] = [
  { name: "Mountain Climbers", equipment: ["bodyweight"], videoQuery: "mountain climber form" },
  { name: "Up-Down (no jump)", equipment: ["bodyweight"], videoQuery: "up down burpee scaled" },
];
const altKbSwing: Alt[] = [
  { name: "DB Russian Swing", equipment: ["dumbbell"], videoQuery: "dumbbell swing form " + SU },
  { name: "Hip-Hinge with Band", equipment: ["bands"], videoQuery: "banded hip hinge swing" },
];
const altSledPush: Alt[] = [
  { name: "Heavy Walking Lunge (DB)", equipment: ["dumbbell"], videoQuery: "heavy dumbbell walking lunge " + SU },
  { name: "Wall Sit + March", equipment: ["bodyweight"], videoQuery: "wall sit march hyrox alternative" },
];
const altWallball: Alt[] = [
  { name: "DB Thruster", equipment: ["dumbbell"], videoQuery: "dumbbell thruster form" },
  { name: "Bodyweight Squat to Press (no load)", equipment: ["bodyweight"], videoQuery: "squat to press form" },
];
const altRow: Alt[] = [
  { name: "Air/Echo Bike", equipment: ["bike"], videoQuery: "echo bike intervals" },
  { name: "Run (outdoor)", equipment: ["bodyweight"], videoQuery: "running form 180 cadence" },
  { name: "Burpees", equipment: ["bodyweight"], videoQuery: "burpee form tutorial " + SU },
];
const altThruster: Alt[] = [
  { name: "DB Thruster", equipment: ["dumbbell"], videoQuery: "dumbbell thruster form" },
  { name: "KB Thruster (single)", equipment: ["kettlebell"], videoQuery: "kettlebell thruster form" },
];

export const WORKOUTS: Workout[] = [
  /* ===== FAT BURN (5) ===== */
  {
    id: "tabata-torch", name: "TABATA TORCH", time: 4, focus: "fatburn", intensity: "max",
    source: "Tabata 1996",
    description: "Maximal-output 4-minute protocol. 8 rounds of 20s all-out / 10s rest.",
    scienceNote: "The original Tabata study showed VO₂max gains equal to 1hr of moderate cycling, in 4 minutes — provided each 20s round is genuine all-out effort (170%+ VO₂max).",
    citation: "Tabata et al. (1996) Med Sci Sports Exerc 28(10):1327",
    exercises: [
      { name: "Burpee (8 rounds)", setsReps: "20s ON / 10s OFF × 8", cue: "Chest to floor every rep. No pacing.",
        videoQuery: "burpee form tutorial " + SU, equipment: ["bodyweight"], alternatives: altBurpee },
    ],
  },
  {
    id: "post-meal-walk", name: "POST-PRANDIAL SIPHON", time: 10, focus: "fatburn", intensity: "low",
    description: "Brisk walk within 30 min of a meal. Single most underrated metabolic tool.",
    scienceNote: "Activates GLUT4-mediated glucose uptake in muscle independent of insulin. Blunts postprandial glucose excursion ~30% in T2D and healthy adults.",
    citation: "Reynolds et al. (2016) Diabetologia 59(12):2572",
    exercises: [
      { name: "Brisk Walk (post-meal)", setsReps: "10 min · 100+ steps/min", cue: "Pace = comfortable but purposeful. Not a stroll.",
        videoQuery: "brisk walking pace technique", equipment: ["bodyweight"] },
    ],
  },
  {
    id: "20-emom", name: "20-MIN EMOM CRUSHER", time: 20, focus: "fatburn", intensity: "high",
    description: "Every minute on the minute, 20 min. 4 movements rotating.",
    scienceNote: "Constant-rate intervals at ~85% MaxHR maximise EPOC — fat oxidation stays elevated 14–48 hr post-session.",
    citation: "LaForgia et al. (2006) J Sports Sci 24(12):1247",
    exercises: [
      { name: "Min 1 — KB Swings", setsReps: "15 reps", cue: "Hip hinge, not a squat. Glutes fire at the top.",
        videoQuery: "kettlebell swing form " + SU, equipment: ["kettlebell"], alternatives: altKbSwing },
      { name: "Min 2 — Push-ups", setsReps: "10 reps", cue: "Hands under shoulders. Full lockout.",
        videoQuery: "push up form " + SU, equipment: ["bodyweight"] },
      { name: "Min 3 — Air Squats", setsReps: "20 reps", cue: "Knees track toes. Hip below knee.",
        videoQuery: "air squat form " + SU, equipment: ["bodyweight"] },
      { name: "Min 4 — Row 200m / 10 burpees", setsReps: "200m row OR 10 burpees", cue: "Drive with legs first.",
        videoQuery: "rowing technique concept2", equipment: ["rower"], alternatives: altRow },
    ],
  },
  {
    id: "vo2-intervals", name: "VO₂ INTERVAL CRUSHER", time: 16, focus: "fatburn", intensity: "max",
    source: "Norwegian 4×4 protocol",
    description: "8 × 1 min hard / 1 min easy on bike, rower, or running.",
    scienceNote: "1-on/1-off intervals at 90%+ MaxHR drive VO₂max gains 3× faster than steady-state cardio. Most time-efficient cardio protocol.",
    citation: "Helgerud et al. (2007) Med Sci Sports Exerc 39(4):665",
    exercises: [
      { name: "Hard Interval", setsReps: "8 × 1 min @ RPE 9/10", cue: "Cannot speak. Legs/lungs burning.",
        videoQuery: "vo2 max interval training", equipment: ["bike"], alternatives: [
          { name: "Run", equipment: ["bodyweight"], videoQuery: "running 1 minute intervals" },
          { name: "Rower", equipment: ["rower"], videoQuery: "concept2 1 minute intervals" },
        ] },
      { name: "Easy Recovery", setsReps: "8 × 1 min @ RPE 4/10", cue: "Active recovery. Don't stop moving.",
        videoQuery: "active recovery cardio", equipment: ["bodyweight"] },
    ],
  },
  {
    id: "zone2-greenfield", name: "GREENFIELD Z2 ENGINE", time: 45, focus: "fatburn", intensity: "low",
    source: "Ben Greenfield",
    description: "45 min nasal-breath-only cardio at 60–70% max HR. Fat-burn + parasympathetic.",
    scienceNote: "Z2 selectively recruits Type-I fibres long enough to upregulate mitochondrial density via PGC-1α. Nasal breathing forces lower intensity and trains diaphragm.",
    citation: "San-Millán & Brooks (2018) Sports Medicine 48:467",
    exercises: [
      { name: "Steady-State Cardio (nasal-only)", setsReps: "45 min · HR 60–70% max", cue: "Breathe through nose only. Mouth shut. If you must mouth-breathe, slow down.",
        videoQuery: "ben greenfield zone 2 training nasal", equipment: ["bike"], alternatives: [
          { name: "Outdoor Walk/Hike", equipment: ["bodyweight"], videoQuery: "zone 2 walking heart rate" },
          { name: "Treadmill Incline Walk", equipment: ["treadmill"], videoQuery: "12-3-30 treadmill walking" },
        ] },
    ],
  },

  /* ===== PERFORMANCE / HYROX (5) ===== */
  {
    id: "hyrox-full-sim", name: "HYROX FULL SIM", time: 90, focus: "performance", intensity: "max",
    source: "Hyrox · Official Race",
    description: "8 × (1 km run + 1 station). The full Hyrox race-day stimulus.",
    scienceNote: "Hyrox alternates running with high-power resistance work. Specificity of pacing across all 8 stations is the #1 predictor of finish time.",
    citation: "Hyrox Performance Report (2024)",
    exercises: [
      { name: "Run", setsReps: "1 km · target 4:30–5:30/km", videoQuery: "hyrox running pace strategy",
        equipment: ["bodyweight"], alternatives: [{ name: "Treadmill", equipment: ["treadmill"], videoQuery: "treadmill running form" }] },
      { name: "Ski Erg", setsReps: "1000 m", cue: "Hip-hinge drive. Don't pull with arms only.",
        videoQuery: "ski erg technique " + HYROX, equipment: ["skierg"], alternatives: [
          { name: "Rower", equipment: ["rower"], videoQuery: "concept2 row technique" }] },
      { name: "Sled Push", setsReps: "50m · 152kg M / 102kg F", cue: "Hips low. Drive through ball of foot.",
        videoQuery: "sled push technique " + HYROX, equipment: ["sled"], alternatives: altSledPush },
      { name: "Sled Pull", setsReps: "50m · 103kg M / 78kg F", cue: "Hips back. Arm-over-arm.",
        videoQuery: "sled pull technique " + HYROX, equipment: ["sled"], alternatives: [
          { name: "Heavy DB Row", equipment: ["dumbbell"], videoQuery: "heavy dumbbell row " + SU },
          { name: "Banded Row", equipment: ["bands"], videoQuery: "band row alternative" }] },
      { name: "Burpee Broad Jump", setsReps: "80m", cue: "Land soft. Chest to floor every rep.",
        videoQuery: "burpee broad jump " + HYROX, equipment: ["bodyweight"] },
      { name: "Rower", setsReps: "1000m", videoQuery: "concept2 row technique", equipment: ["rower"],
        alternatives: [{ name: "Bike", equipment: ["bike"], videoQuery: "echo bike technique" }] },
      { name: "Farmer's Carry", setsReps: "200m · 24kg/hand M / 16kg F", cue: "Stand tall. Crush handles.",
        videoQuery: "farmers carry technique " + HYROX, equipment: ["dumbbell"], alternatives: [
          { name: "KB Carry", equipment: ["kettlebell"], videoQuery: "kettlebell farmers carry" }] },
      { name: "Sandbag Lunges", setsReps: "100m · 20kg M / 10kg F", cue: "Bag on neck. Knee taps floor.",
        videoQuery: "sandbag walking lunge " + HYROX, equipment: ["sandbag"], alternatives: [
          { name: "Goblet Lunge (DB)", equipment: ["dumbbell"], videoQuery: "goblet walking lunge form" }] },
      { name: "Wall Balls", setsReps: "100 reps · 9kg M / 6kg F · 10ft target", cue: "Squat depth. Drive ball high.",
        videoQuery: "wall ball form " + HYROX, equipment: ["wallball"], alternatives: altWallball },
    ],
  },
  {
    id: "roxzone-transitions", name: "ROXZONE TRANSITIONS", time: 30, focus: "performance", intensity: "high",
    source: "Hyrox",
    description: "6 × (1km run + 60s heavy hold). Trains the brutal run-to-station handover.",
    scienceNote: "Hyrox amateurs lose 4-6 minutes total in roxzone (transitions). Training the metabolic shift trains lactate clearance under load.",
    citation: "Bishop et al. (2008) Sports Med 38(11):947",
    exercises: [
      { name: "Run", setsReps: "6 × 1 km", videoQuery: "hyrox running pace strategy", equipment: ["bodyweight"],
        alternatives: [{ name: "Treadmill", equipment: ["treadmill"], videoQuery: "treadmill 1km repeats" }] },
      { name: "Sled Push (hold position)", setsReps: "6 × 60s static hold or 25m push", cue: "Don't stand up out of position.",
        videoQuery: "sled push static hold", equipment: ["sled"], alternatives: [
          { name: "Wall Sit", equipment: ["bodyweight"], videoQuery: "wall sit 60s test" }] },
    ],
  },
  {
    id: "row-wallball", name: "ROW + WALL BALL DOUBLES", time: 25, focus: "performance", intensity: "high",
    description: "8 rounds: 250m row + 25 wall balls. Hyrox-style transitions.",
    scienceNote: "Cyclical+ballistic pairing trains the energy-system shift Hyrox demands.",
    citation: "Bishop et al. (2008) Sports Med 38(11):947",
    exercises: [
      { name: "Concept2 Row", setsReps: "8 × 250m", cue: "Legs–back–arms.",
        videoQuery: "concept2 row technique", equipment: ["rower"], alternatives: altRow },
      { name: "Wall Ball", setsReps: "8 × 25 reps · 9kg M / 6kg F", cue: "Squat depth. Drive ball to 10ft target.",
        videoQuery: "wall ball form " + CFHQ, equipment: ["wallball"], alternatives: altWallball },
    ],
  },
  {
    id: "farmers-march", name: "FARMER'S MARCH EMOM", time: 10, focus: "performance", intensity: "med",
    description: "Heavy carry every minute, 10 rounds. Grip and trunk endurance.",
    scienceNote: "Loaded carries simultaneously train grip, anti-lateral-flexion core, and aerobic capacity — transferable to every Hyrox station.",
    citation: "McGill (2010) Strength Cond J 32(3):33",
    exercises: [
      { name: "Farmer's Walk", setsReps: "10 × 30m · 32kg/hand", cue: "Stand tall. Crush the handles.",
        videoQuery: "farmers walk technique " + SU, equipment: ["dumbbell"], alternatives: [
          { name: "KB Carry", equipment: ["kettlebell"], videoQuery: "kettlebell farmers carry" }] },
    ],
  },
  {
    id: "sled-endurance", name: "SLED ENDURANCE BLOCK", time: 25, focus: "performance", intensity: "high",
    description: "5 × 100m sled push at 40% bodyweight load.",
    scienceNote: "Sled training trains horizontal force production — most Hyrox-specific quality. Joint-friendly hypertrophy stimulus for quads/glutes.",
    citation: "Cross et al. (2017) Front Physiol 8:412",
    exercises: [
      { name: "Heavy Sled Push", setsReps: "5 × 100m · ~40% BW", cue: "Hips low. Don't stand up.",
        videoQuery: "heavy sled push technique", equipment: ["sled"], alternatives: altSledPush },
    ],
  },

  /* ===== METCON / CROSSFIT BENCHMARKS (8) ===== */
  {
    id: "cindy", name: "CINDY", time: 20, focus: "metcon", intensity: "high",
    source: "CrossFit.com",
    description: "20-min AMRAP: 5 pull-ups · 10 push-ups · 15 air squats. Bodyweight benchmark.",
    scienceNote: "20-min AMRAPs at 85% MaxHR produce mitochondrial adaptations equal to 60+ min of steady-state cardio.",
    citation: "Smith et al. (2013) J Strength Cond Res 27(11):3159",
    exercises: [
      { name: "Pull-up", setsReps: "5 reps", cue: "Chin clears bar. Full hang.",
        videoQuery: "pull up form " + CFHQ, equipment: ["pullup"], alternatives: altPullup },
      { name: "Push-up", setsReps: "10 reps", cue: "Chest to floor.",
        videoQuery: "push up form " + SU, equipment: ["bodyweight"] },
      { name: "Air Squat", setsReps: "15 reps", cue: "Hip below knee.",
        videoQuery: "air squat form " + SU, equipment: ["bodyweight"] },
    ],
  },
  {
    id: "fran", name: "FRAN", time: 8, focus: "metcon", intensity: "max",
    source: "CrossFit.com",
    description: "21-15-9: thrusters 43kg M / 30kg F + pull-ups. CrossFit gold standard.",
    scienceNote: "Sub-5-min Fran demands max anaerobic glycolytic capacity. Lactate peaks ~15–18 mmol/L.",
    citation: "Fernández-Fernández et al. (2015) J Strength Cond Res 29(11):3151",
    exercises: [
      { name: "Thruster", setsReps: "21-15-9 · 43kg M / 30kg F", cue: "Squat depth. Bar locked overhead.",
        videoQuery: "thruster form " + CFHQ, equipment: ["barbell"], alternatives: altThruster },
      { name: "Pull-up", setsReps: "21-15-9", cue: "Kipping allowed. Chin over bar.",
        videoQuery: "kipping pull up " + CFHQ, equipment: ["pullup"], alternatives: altPullup },
    ],
  },
  {
    id: "helen", name: "HELEN", time: 12, focus: "metcon", intensity: "high",
    source: "CrossFit.com",
    description: "3 RFT: 400m run + 21 KB swings (24/16kg) + 12 pull-ups.",
    scienceNote: "Mixed cyclical+strength benchmark. Sub-12 minute Helen is a strong indicator of work capacity in the moderate domain.",
    exercises: [
      { name: "400m Run", setsReps: "3 × 400m", cue: "Aggressive but sustainable.",
        videoQuery: "400m running pace tactics", equipment: ["bodyweight"], alternatives: [
          { name: "Row 500m", equipment: ["rower"], videoQuery: "concept2 row technique" }] },
      { name: "Kettlebell Swing (Russian)", setsReps: "3 × 21 · 24kg M / 16kg F", cue: "Hip hinge. Glutes lock at top.",
        videoQuery: "kettlebell swing form " + CFHQ, equipment: ["kettlebell"], alternatives: altKbSwing },
      { name: "Pull-up", setsReps: "3 × 12", cue: "Chin over bar.",
        videoQuery: "pull up form " + CFHQ, equipment: ["pullup"], alternatives: altPullup },
    ],
  },
  {
    id: "grace", name: "GRACE", time: 6, focus: "metcon", intensity: "max",
    source: "CrossFit.com",
    description: "30 clean & jerks for time · 61kg M / 43kg F. Pure power-endurance.",
    scienceNote: "Sub-3-min Grace requires elite phosphocreatine recovery between reps. Trains the alactic→glycolytic crossover.",
    exercises: [
      { name: "Clean & Jerk", setsReps: "30 reps · 61kg M / 43kg F", cue: "Triple extension. Catch in front rack. Drive overhead.",
        videoQuery: "clean and jerk form " + CFHQ, equipment: ["barbell"], alternatives: [
          { name: "DB Clean & Press", equipment: ["dumbbell"], videoQuery: "dumbbell clean press form" }] },
    ],
  },
  {
    id: "diane", name: "DIANE", time: 7, focus: "metcon", intensity: "high",
    source: "CrossFit.com",
    description: "21-15-9: deadlift (102kg M / 70kg F) + handstand push-up.",
    scienceNote: "Combines posterior-chain power with overhead pressing — the inverse of typical fatigue patterns. Deadlift form must hold under fatigue.",
    exercises: [
      { name: "Deadlift", setsReps: "21-15-9 · 102kg M / 70kg F", cue: "Bar over mid-foot. Lat-tight every rep.",
        videoQuery: "deadlift form " + SU, equipment: ["barbell"], alternatives: [
          { name: "DB Deadlift", equipment: ["dumbbell"], videoQuery: "dumbbell deadlift form" },
          { name: "KB Sumo Deadlift", equipment: ["kettlebell"], videoQuery: "kettlebell sumo deadlift form" }] },
      { name: "Handstand Push-up", setsReps: "21-15-9", cue: "Hands shoulder-width. Lower with control.",
        videoQuery: "handstand push up " + CFHQ, equipment: ["bodyweight"], alternatives: [
          { name: "Pike Push-up", equipment: ["bodyweight"], videoQuery: "pike push up scaling" },
          { name: "DB Strict Press", equipment: ["dumbbell"], videoQuery: "dumbbell strict press " + SU }] },
    ],
  },
  {
    id: "karen", name: "KAREN", time: 10, focus: "metcon", intensity: "max",
    source: "CrossFit.com",
    description: "150 wall balls for time · 9kg M / 6kg F · 10ft target. Lactate hellscape.",
    scienceNote: "Sustained submaximal effort that floods muscle with lactate. Trains acid buffering and mental tolerance to discomfort.",
    exercises: [
      { name: "Wall Ball", setsReps: "150 reps · 9kg M / 6kg F", cue: "Squat depth. Drive ball to target.",
        videoQuery: "wall ball form " + CFHQ, equipment: ["wallball"], alternatives: altWallball },
    ],
  },
  {
    id: "angie", name: "ANGIE", time: 25, focus: "metcon", intensity: "high",
    source: "CrossFit.com",
    description: "For time: 100 pull-ups, 100 push-ups, 100 sit-ups, 100 squats. Big-set bodyweight benchmark.",
    scienceNote: "Tests pure muscular endurance. Partition strategy matters — pacing pull-ups in sets of 5 dramatically beats unbroken attempts.",
    exercises: [
      { name: "Pull-up", setsReps: "100 reps", videoQuery: "pull up partition strategy " + CFHQ,
        equipment: ["pullup"], alternatives: altPullup },
      { name: "Push-up", setsReps: "100 reps", videoQuery: "push up form " + SU, equipment: ["bodyweight"] },
      { name: "Sit-up", setsReps: "100 reps · CrossFit AbMat style", videoQuery: "abmat sit up " + CFHQ, equipment: ["bodyweight"] },
      { name: "Air Squat", setsReps: "100 reps", videoQuery: "air squat form " + SU, equipment: ["bodyweight"] },
    ],
  },
  {
    id: "murph-light", name: "MURPH (no vest)", time: 35, focus: "metcon", intensity: "max",
    source: "CrossFit.com · Lt. Michael Murphy",
    description: "1 mile run · 100 pull-ups · 200 push-ups · 300 squats · 1 mile run. Hero WOD.",
    scienceNote: "Long mixed-modal sessions train metabolic efficiency across all energy systems. Honors Lt. Michael Murphy (KIA Afghanistan, 2005).",
    exercises: [
      { name: "Mile Run", setsReps: "1 mile", videoQuery: "running form 180 cadence", equipment: ["bodyweight"] },
      { name: "Pull-up", setsReps: "100 reps (partition as needed)", videoQuery: "pull up form " + CFHQ,
        equipment: ["pullup"], alternatives: altPullup },
      { name: "Push-up", setsReps: "200 reps", videoQuery: "push up form " + SU, equipment: ["bodyweight"] },
      { name: "Air Squat", setsReps: "300 reps", videoQuery: "air squat form " + SU, equipment: ["bodyweight"] },
      { name: "Mile Run", setsReps: "1 mile", videoQuery: "running form 180 cadence", equipment: ["bodyweight"] },
    ],
  },

  /* ===== STRENGTH (5) ===== */
  {
    id: "back-squat-5x5", name: "BACK SQUAT — 5×5", time: 45, focus: "strength", intensity: "high",
    description: "5 sets of 5 reps at 80–85% 1RM. Add 2.5 kg/week.",
    scienceNote: "5×5 maximises strength-specific neural adaptation and Type-IIa hypertrophy. Linear progression works for 6–12 months for most lifters.",
    citation: "Schoenfeld et al. (2017) J Strength Cond Res 31(12):3508",
    exercises: [
      { name: "Back Squat", setsReps: "5 × 5 · 80–85% 1RM", cue: "Bar on traps. Hip & knee flex together.",
        videoQuery: "back squat form " + SU, equipment: ["barbell"], alternatives: [
          { name: "Goblet Squat (DB/KB)", equipment: ["dumbbell"], videoQuery: "goblet squat form " + SU },
          { name: "Bulgarian Split Squat", equipment: ["dumbbell"], videoQuery: "bulgarian split squat form " + SU }] },
      { name: "Romanian Deadlift", setsReps: "3 × 8", cue: "Hinge from hips. Hamstring stretch.",
        videoQuery: "romanian deadlift " + SU, equipment: ["barbell"], alternatives: [
          { name: "DB RDL", equipment: ["dumbbell"], videoQuery: "dumbbell romanian deadlift " + SU }] },
      { name: "Walking Lunge", setsReps: "3 × 10/leg", videoQuery: "walking lunge form " + SU,
        equipment: ["dumbbell"], alternatives: [{ name: "Bodyweight Lunge", equipment: ["bodyweight"], videoQuery: "walking lunge form" }] },
    ],
  },
  {
    id: "deadlift-531", name: "DEADLIFT — 5/3/1", time: 40, focus: "strength", intensity: "max",
    source: "Wendler 5/3/1",
    description: "Wendler 5/3/1 wave: 5@65%, 5@75%, 5+@85% (week 1).",
    scienceNote: "5/3/1 builds sustainable strength via auto-regulated top sets. AMRAP final set provides ongoing 1RM estimate.",
    citation: "Wendler (2009) Beyond 5/3/1",
    exercises: [
      { name: "Conventional Deadlift", setsReps: "5@65% · 5@75% · 5+@85%", cue: "Lats engaged. Push the floor away.",
        videoQuery: "conventional deadlift form " + SU, equipment: ["barbell"], alternatives: [
          { name: "Trap-Bar Deadlift", equipment: ["barbell"], videoQuery: "trap bar deadlift form " + SU }] },
      { name: "Bent-Over Row", setsReps: "5 × 8", videoQuery: "bent over row form " + SU,
        equipment: ["barbell"], alternatives: [
          { name: "DB Row", equipment: ["dumbbell"], videoQuery: "dumbbell bent over row " + SU }] },
      { name: "Hanging Leg Raise", setsReps: "3 × 10", videoQuery: "hanging leg raise form " + SU,
        equipment: ["pullup"], alternatives: [
          { name: "Lying Leg Raise", equipment: ["bodyweight"], videoQuery: "lying leg raise core" }] },
    ],
  },
  {
    id: "press-day", name: "PRESS DAY — OHP + INCLINE", time: 45, focus: "strength", intensity: "high",
    description: "Strict overhead press + incline bench. Full anterior/clavicular pressing stack.",
    scienceNote: "Combining vertical and 30° incline pressing maximises clavicular pec and anterior deltoid recruitment without rotator-cuff overuse.",
    citation: "Trebs et al. (2010) J Strength Cond Res 24(7):1925",
    exercises: [
      { name: "Strict Overhead Press", setsReps: "5 × 5 · 80% 1RM", cue: "Squeeze glutes. No leg drive.",
        videoQuery: "overhead press form " + SU, equipment: ["barbell"], alternatives: [
          { name: "DB Strict Press", equipment: ["dumbbell"], videoQuery: "dumbbell strict press " + SU }] },
      { name: "Incline Bench Press", setsReps: "4 × 8 · 30°", cue: "Bar to upper chest. Drive through feet.",
        videoQuery: "incline bench press " + SU, equipment: ["barbell"], alternatives: [
          { name: "DB Incline Press", equipment: ["dumbbell"], videoQuery: "dumbbell incline press form" }] },
      { name: "Lateral Raise", setsReps: "3 × 12", videoQuery: "lateral raise form",
        equipment: ["dumbbell"], alternatives: [
          { name: "Banded Lateral Raise", equipment: ["bands"], videoQuery: "band lateral raise" }] },
      { name: "Tricep Dip", setsReps: "3 × 10", videoQuery: "tricep dip form " + SU,
        equipment: ["bodyweight"], alternatives: [
          { name: "Bench Dip", equipment: ["bodyweight"], videoQuery: "bench tricep dip form" }] },
    ],
  },
  {
    id: "pull-day", name: "PULL DAY — VERT + HORIZ", time: 45, focus: "strength", intensity: "high",
    description: "Weighted pull-ups + barbell row. Both pull vectors for balanced back.",
    scienceNote: "Lats produce force in two distinct planes (vertical adduction vs horizontal extension). Both must be loaded.",
    citation: "Andersen et al. (2014) J Strength Cond Res 28(1):91",
    exercises: [
      { name: "Weighted Pull-up", setsReps: "5 × 5", cue: "Initiate with scap depression.",
        videoQuery: "weighted pull up form " + SU, equipment: ["pullup"], alternatives: altPullup },
      { name: "Barbell Row (Pendlay)", setsReps: "4 × 6", cue: "Bar starts on floor each rep.",
        videoQuery: "pendlay row form " + SU, equipment: ["barbell"], alternatives: [
          { name: "DB Row", equipment: ["dumbbell"], videoQuery: "dumbbell bent over row " + SU }] },
      { name: "Face Pull", setsReps: "3 × 15", videoQuery: "face pull form " + SU,
        equipment: ["bands"], alternatives: [
          { name: "Reverse Fly (DB)", equipment: ["dumbbell"], videoQuery: "reverse fly form" }] },
      { name: "Hammer Curl", setsReps: "3 × 10", videoQuery: "hammer curl form",
        equipment: ["dumbbell"], alternatives: [
          { name: "Banded Curl", equipment: ["bands"], videoQuery: "band hammer curl" }] },
    ],
  },
  {
    id: "filly-persist", name: "FILLY · PERSIST DB CIRCUIT", time: 35, focus: "strength", intensity: "high",
    source: "Marcus Filly · Functional Bodybuilding",
    description: "5 rounds: 10 DB front squats · 8 DB strict press · 12 DB RDLs · 200m run.",
    scienceNote: "Filly's Functional Bodybuilding format pairs a hypertrophy stimulus with low-grade conditioning. Builds muscle and engine simultaneously without crushing recovery.",
    exercises: [
      { name: "DB Front Squat", setsReps: "5 × 10 · 2× 22.5kg M / 12.5kg F", cue: "Elbows high. Hip below knee.",
        videoQuery: "dumbbell front squat " + FILLY, equipment: ["dumbbell"], alternatives: [
          { name: "Goblet Squat", equipment: ["kettlebell"], videoQuery: "goblet squat form " + SU }] },
      { name: "DB Strict Press", setsReps: "5 × 8", cue: "Glutes squeezed. No leg drive.",
        videoQuery: "dumbbell strict press " + FILLY, equipment: ["dumbbell"] },
      { name: "DB Romanian Deadlift", setsReps: "5 × 12", cue: "Hinge. Soft knees. Stretch hamstrings.",
        videoQuery: "dumbbell rdl " + FILLY, equipment: ["dumbbell"], alternatives: [
          { name: "KB Single-leg RDL", equipment: ["kettlebell"], videoQuery: "single leg rdl kettlebell" }] },
      { name: "Run", setsReps: "5 × 200m", videoQuery: "200m repeats functional bodybuilding",
        equipment: ["bodyweight"], alternatives: [
          { name: "Row 250m", equipment: ["rower"], videoQuery: "concept2 row 250m" },
          { name: "Bike 500m", equipment: ["bike"], videoQuery: "echo bike 500m" }] },
    ],
  },

  /* ===== MOBILITY (4) ===== */
  {
    id: "atg-basics", name: "ATG · KNEES OVER TOES", time: 15, focus: "mobility", intensity: "low",
    source: "Knees Over Toes Guy (Ben Patrick)",
    description: "Tibialis raises · ATG split squat · sled drag. Bulletproof knees.",
    scienceNote: "Loaded end-range knee flexion strengthens VMO and patellar tendon at angles where most lifters are weakest. Reduces patellofemoral pain.",
    citation: "Patrick (2022) ATG for Life",
    exercises: [
      { name: "Tibialis Raise", setsReps: "3 × 25 · against wall", cue: "Toes pull up. Heels stay planted.",
        videoQuery: "tibialis raise atg knees over toes", equipment: ["bodyweight"] },
      { name: "ATG Split Squat", setsReps: "3 × 10/leg", cue: "Front knee tracks past toe. No pain.",
        videoQuery: "atg split squat knees over toes", equipment: ["bodyweight"] },
      { name: "Reverse Sled Drag", setsReps: "3 × 30m · light", cue: "Walk backwards. Quads on fire.",
        videoQuery: "reverse sled drag atg", equipment: ["sled"], alternatives: [
          { name: "Banded Backward Walk", equipment: ["bands"], videoQuery: "band backward walk knee health" }] },
    ],
  },
  {
    id: "hip-flexor-reclaim", name: "HIP FLEXOR RECLAIM", time: 12, focus: "mobility", intensity: "low",
    description: "Couch stretch · 90/90 · half-kneeling lunge. Reverse desk-life damage.",
    scienceNote: "Sitting >6 hr/day shortens iliopsoas and rectus femoris, anteriorly tilting pelvis and inhibiting glute activation. Daily reset is non-negotiable past 30.",
    citation: "Sahrmann (2002) Diagnosis and Treatment of Movement Impairment Syndromes",
    exercises: [
      { name: "Couch Stretch", setsReps: "2 × 60s/leg", cue: "Squeeze glute on stretching side.",
        videoQuery: "couch stretch hip flexor " + SU, equipment: ["bodyweight"] },
      { name: "90/90 Hip Switch", setsReps: "10 switches", cue: "Sit tall. Both knees pin to ground.",
        videoQuery: "90 90 hip mobility " + SU, equipment: ["bodyweight"] },
      { name: "Half-Kneeling Lunge Stretch", setsReps: "2 × 45s/leg",
        videoQuery: "half kneeling lunge stretch " + SU, equipment: ["bodyweight"] },
    ],
  },
  {
    id: "shoulder-prehab", name: "SHOULDER PREHAB FLOW", time: 10, focus: "mobility", intensity: "low",
    description: "Band pull-aparts · dislocates · scap pulls. Pre-workout staple.",
    scienceNote: "External rotators are 30% weaker than internal rotators in untrained lifters. Pre-fatigue daily to prevent impingement.",
    citation: "Cools et al. (2007) Br J Sports Med 41(11):874",
    exercises: [
      { name: "Band Pull-Apart", setsReps: "3 × 20", cue: "Squeeze shoulder blades.",
        videoQuery: "band pull apart shoulder " + SU, equipment: ["bands"] },
      { name: "Band Shoulder Dislocate", setsReps: "3 × 10", cue: "Pass band overhead with straight arms.",
        videoQuery: "band shoulder dislocate " + SU, equipment: ["bands"] },
      { name: "Scapular Pull-up", setsReps: "3 × 10", cue: "Hang. Shoulder blades down only.",
        videoQuery: "scapular pull up form " + SU, equipment: ["pullup"], alternatives: [
          { name: "Wall Slide", equipment: ["bodyweight"], videoQuery: "wall slide scap mobility" }] },
    ],
  },
  {
    id: "tspine-opener", name: "T-SPINE OPENERS", time: 8, focus: "mobility", intensity: "low",
    description: "Cat-cow · foam-roll t-spine · thread the needle. Restore overhead position.",
    scienceNote: "Thoracic rotation drives overhead reach, hip rotation, and rib-cage breathing. Restricted t-spine limits squat depth and OHP lockout.",
    citation: "Cook (2010) Movement",
    exercises: [
      { name: "Cat-Cow", setsReps: "10 reps slow", videoQuery: "cat cow stretch form", equipment: ["bodyweight"] },
      { name: "Foam Roll T-Spine", setsReps: "60s · 3 spots", cue: "Pause and exhale on tight spots.",
        videoQuery: "foam roll thoracic spine " + SU, equipment: ["bodyweight"] },
      { name: "Thread the Needle", setsReps: "8/side", videoQuery: "thread the needle stretch", equipment: ["bodyweight"] },
    ],
  },

  /* ===== RECOVERY (3) ===== */
  {
    id: "478-breath", name: "4-7-8 BREATH PROTOCOL", time: 8, focus: "recovery", intensity: "low",
    source: "Andrew Weil · Ben Greenfield",
    description: "Inhale 4s · hold 7s · exhale 8s. Sleep onset, anxiety dampening, vagal tone.",
    scienceNote: "Slow exhale-dominant breathing (5–6 breaths/min) maximises HRV and vagal activation. Reduces cortisol and improves sleep onset by ~15 min.",
    citation: "Russo et al. (2017) Breathe 13(4):298",
    exercises: [
      { name: "4-7-8 Breath", setsReps: "8 min · 4 in / 7 hold / 8 out · nasal only",
        cue: "Tongue behind upper teeth. Exhale through pursed lips with audible whoosh.",
        videoQuery: "4 7 8 breathing technique andrew weil " + GFD, equipment: ["bodyweight"] },
    ],
  },
  {
    id: "greenfield-stack", name: "GREENFIELD HEAT+COLD STACK", time: 25, focus: "recovery", intensity: "med",
    source: "Ben Greenfield",
    description: "15 min sauna (80–90°C) → 2 min cold plunge → 5 min Z2 walk. Hormetic stack.",
    scienceNote: "Heat-shock proteins (HSP70/72) up 50% post-sauna; cold raises norepinephrine ~530%. Pairing produces broader stress-resilience adaptations than either alone.",
    citation: "Laukkanen et al. (2018) Mayo Clin Proc 93(8):1111",
    exercises: [
      { name: "Sauna", setsReps: "15 min · 80–90°C", cue: "Stay until uncomfortable, not unsafe. Hydrate after.",
        videoQuery: "sauna protocol benefits " + GFD, equipment: ["sauna"], alternatives: [
          { name: "Hot Bath (40°C)", equipment: ["bodyweight"], videoQuery: "hot bath heat shock protocol" }] },
      { name: "Cold Plunge", setsReps: "2 min · 5–10°C", cue: "Slow exhale. Stay still. Don't fight the urge.",
        videoQuery: "cold plunge protocol " + GFD, equipment: ["ice"], alternatives: [
          { name: "Cold Shower", equipment: ["ice"], videoQuery: "cold shower protocol benefits" }] },
      { name: "Z2 Walk", setsReps: "5 min · easy pace", cue: "Cool down. Re-establish parasympathetic.",
        videoQuery: "post recovery walk", equipment: ["bodyweight"] },
    ],
  },
  {
    id: "para-reset", name: "PARASYMPATHETIC RESET", time: 10, focus: "recovery", intensity: "low",
    description: "Box breathing 4-4-4-4 · legs up the wall. Drop HRV from sympathetic.",
    scienceNote: "Slow nasal breathing (5–6 breaths/min) maximises HRV and vagal tone. 10 min lowers cortisol and improves sleep onset.",
    citation: "Russo et al. (2017) Breathe 13(4):298",
    exercises: [
      { name: "Box Breathing", setsReps: "5 min · 4-4-4-4 cadence", cue: "Inhale through nose only.",
        videoQuery: "box breathing 4 4 4 4 navy seal", equipment: ["bodyweight"] },
      { name: "Legs Up the Wall", setsReps: "5 min", cue: "Hips against wall. Arms relaxed.",
        videoQuery: "legs up the wall pose recovery", equipment: ["bodyweight"] },
    ],
  },
];

/* Derive workout-level required equipment (excluding bodyweight) for filtering UX */
export const workoutRequiredEquipment = (w: Workout): Equipment[] => {
  const set = new Set<Equipment>();
  for (const ex of w.exercises) {
    for (const eq of ex.equipment) {
      if (eq !== "bodyweight") set.add(eq);
    }
  }
  return Array.from(set);
};

/* Whether a user with `available` equipment can complete the workout
   (either directly or via alternatives covering all missing equipment) */
export const canPerform = (w: Workout, available: Equipment[]): boolean => {
  const has = new Set<Equipment>(["bodyweight", ...available]);
  for (const ex of w.exercises) {
    const exHas = ex.equipment.every((e) => has.has(e));
    if (exHas) continue;
    const altOk = (ex.alternatives ?? []).some((a) => a.equipment.every((e) => has.has(e)));
    if (!altOk) return false;
  }
  return true;
};

/* ---------- INGREDIENTS (SCAN — Phase C) ---------- */
export type RiskLevel = "red" | "amber" | "green";
export type Ingredient = {
  id: string;
  name: string;
  aliases?: string[];
  level: RiskLevel;
  category: string;
  summary: string;
  citation?: string;
  swaps?: string[];
};

export const INGREDIENTS: Ingredient[] = [
  // ===== RED — endocrine, carcinogen, photo-toxic =====
  { id: "methylparaben", name: "Methylparaben", aliases: ["e218"], level: "red", category: "Paraben",
    summary: "Xenoestrogen detected in breast tumour tissue. Mimics estradiol.",
    citation: "Darbre et al. (2004) J Appl Toxicol 24(1):5", swaps: ["Phenoxyethanol (low %)", "Sodium Benzoate", "Potassium Sorbate"] },
  { id: "ethylparaben", name: "Ethylparaben", aliases: ["e214"], level: "red", category: "Paraben",
    summary: "Same xenoestrogen class as methylparaben. Banned in some EU cosmetic categories.",
    citation: "Darbre et al. (2004) J Appl Toxicol 24(1):5", swaps: ["Phenoxyethanol", "Sodium Benzoate"] },
  { id: "propylparaben", name: "Propylparaben", aliases: ["e216"], level: "red", category: "Paraben",
    summary: "Stronger estrogen receptor binding than methyl/ethyl variants. Linked to reduced sperm motility.",
    citation: "Meeker et al. (2011) Environ Health Perspect 119(2):252", swaps: ["Phenoxyethanol"] },
  { id: "butylparaben", name: "Butylparaben", level: "red", category: "Paraben",
    summary: "Highest estrogenic potency in paraben family. Restricted concentrations in EU.",
    citation: "Routledge et al. (1998) Toxicol Appl Pharmacol 153(1):12", swaps: ["Sodium Benzoate"] },
  { id: "isopropylparaben", name: "Isopropylparaben", level: "red", category: "Paraben",
    summary: "Banned in EU cosmetics (2014) due to unverified safety profile.",
    citation: "EU Regulation (EC) No 358/2014" },
  { id: "isobutylparaben", name: "Isobutylparaben", level: "red", category: "Paraben",
    summary: "Banned in EU cosmetics (2014). Suspected endocrine disruptor.",
    citation: "EU Regulation (EC) No 358/2014" },
  { id: "phthalate-dep", name: "Diethyl Phthalate", aliases: ["dep"], level: "red", category: "Phthalate",
    summary: "Hidden inside 'Fragrance/Parfum'. Reduces serum testosterone & alters thyroid hormone.",
    citation: "Meeker et al. (2007) Environ Health Perspect 115(7):1029", swaps: ["Fragrance-free formulas"] },
  { id: "phthalate-dbp", name: "Dibutyl Phthalate", aliases: ["dbp"], level: "red", category: "Phthalate",
    summary: "Anti-androgenic. Banned in EU cosmetics. Still found in some imported nail products.",
    citation: "EU Regulation (EC) No 1223/2009 Annex II" },
  { id: "phthalate-dehp", name: "Bis(2-ethylhexyl) Phthalate", aliases: ["dehp"], level: "red", category: "Phthalate",
    summary: "IARC Group 2B carcinogen. Reproductive toxicant.",
    citation: "IARC Monograph Vol 101 (2012)" },
  { id: "fragrance", name: "Fragrance", aliases: ["parfum", "perfume"], level: "red", category: "Hidden Mixture",
    summary: "Trade-secret cocktail of 50–250 chemicals. Common phthalate carrier and skin sensitiser.",
    citation: "Steinemann (2016) Air Qual Atmos Health 9(8):861", swaps: ["Essential oil blends (labelled)", "Fragrance-free"] },
  { id: "oxybenzone", name: "Oxybenzone", aliases: ["benzophenone-3", "bp-3"], level: "red", category: "UV Filter",
    summary: "Detected in 96% of US adult urine. Endocrine activity. Coral-bleaching: banned in Hawaii.",
    citation: "Calafat et al. (2008) Environ Health Perspect 116(7):893", swaps: ["Zinc Oxide (non-nano)", "Titanium Dioxide"] },
  { id: "octinoxate", name: "Octinoxate", aliases: ["octyl methoxycinnamate", "ethylhexyl methoxycinnamate"], level: "red", category: "UV Filter",
    summary: "Estrogenic activity. Crosses placenta. Banned with oxybenzone in Hawaii (2021).",
    citation: "Krause et al. (2012) Int J Androl 35(3):424", swaps: ["Zinc Oxide", "Titanium Dioxide"] },
  { id: "homosalate", name: "Homosalate", level: "red", category: "UV Filter",
    summary: "EU restricted to 7.34% in face products (2021). Endocrine activity.",
    citation: "EU SCCS/1622/20" },
  { id: "octocrylene", name: "Octocrylene", level: "red", category: "UV Filter",
    summary: "Degrades to benzophenone (carcinogen) over time. Photo-allergen.",
    citation: "Downs et al. (2021) Chemosphere 277:130293", swaps: ["Mineral filters only"] },
  { id: "retinyl-palmitate", name: "Retinyl Palmitate", level: "red", category: "Vit A Ester",
    summary: "In sunscreen, accelerates UV-induced skin tumour formation in mice. Avoid in daylight products.",
    citation: "NTP-NCTR (2012) Photocarcinogenesis Study", swaps: ["Bakuchiol (night)", "Granactive Retinoid"] },
  { id: "aluminum-chlorohydrate", name: "Aluminum Chlorohydrate", level: "red", category: "Antiperspirant",
    summary: "Plugs sweat ducts. Detected in breast tumour tissue. Estrogenic activity in vitro.",
    citation: "Darbre (2005) J Inorg Biochem 99(9):1912", swaps: ["Magnesium Hydroxide deodorant", "Baking Soda formulas"] },
  { id: "aluminum-zirconium", name: "Aluminum Zirconium Tetrachlorohydrex", level: "red", category: "Antiperspirant",
    summary: "Same concerns as aluminum chlorohydrate. Banned in aerosols by FDA.",
    citation: "FDA 21 CFR 350.10" },
  { id: "triclosan", name: "Triclosan", level: "red", category: "Antimicrobial",
    summary: "Banned by FDA in soaps (2017). Endocrine disruption, gut-microbiome damage, antibiotic resistance.",
    citation: "FDA 81 FR 61106 (2016)", swaps: ["Plain soap & water", "Tea tree oil"] },
  { id: "triclocarban", name: "Triclocarban", level: "red", category: "Antimicrobial",
    summary: "Banned by FDA (2017) alongside triclosan. Bioaccumulates.",
    citation: "FDA 81 FR 61106 (2016)" },
  { id: "formaldehyde", name: "Formaldehyde", level: "red", category: "Preservative",
    summary: "IARC Group 1 carcinogen. Banned in EU cosmetics. Often hidden as 'releaser'.",
    citation: "IARC Monograph Vol 100F (2012)" },
  { id: "dmdm-hydantoin", name: "DMDM Hydantoin", level: "red", category: "Formaldehyde Releaser",
    summary: "Slowly releases formaldehyde. Class 1 contact allergen.",
    citation: "de Groot & White (2011) Contact Dermatitis 64(1):2", swaps: ["Sodium Benzoate", "Phenoxyethanol"] },
  { id: "quaternium-15", name: "Quaternium-15", level: "red", category: "Formaldehyde Releaser",
    summary: "Most potent formaldehyde releaser. North American Contact Dermatitis Group flagged it as top 5 allergen.",
    citation: "Warshaw et al. (2015) Dermatitis 26(1):49" },
  { id: "imidazolidinyl-urea", name: "Imidazolidinyl Urea", level: "red", category: "Formaldehyde Releaser",
    summary: "Formaldehyde releaser. Common allergen.", citation: "de Groot et al. (2010) Contact Dermatitis 62(1):2" },
  { id: "hydroquinone", name: "Hydroquinone", level: "red", category: "Skin Lightener",
    summary: "Banned OTC in EU & UK. Linked to ochronosis and rebound hyperpigmentation.",
    citation: "EU Regulation (EC) 1223/2009", swaps: ["Niacinamide", "Tranexamic Acid", "Alpha Arbutin"] },
  { id: "coal-tar", name: "Coal Tar", aliases: ["ci 77266"], level: "red", category: "Dye",
    summary: "IARC Group 1 carcinogen. Still in some anti-dandruff shampoos.",
    citation: "IARC Monograph Vol 100F (2012)" },
  { id: "lead-acetate", name: "Lead Acetate", level: "red", category: "Heavy Metal",
    summary: "Neurotoxin. Banned in hair dye by FDA (2018). Found in some imported products.",
    citation: "FDA 83 FR 50490 (2018)" },
  { id: "bha", name: "BHA", aliases: ["butylated hydroxyanisole"], level: "red", category: "Antioxidant",
    summary: "IARC Group 2B (possibly carcinogenic). Endocrine disruptor in animal studies.",
    citation: "IARC Monograph Vol 40 (1986)", swaps: ["Tocopherol (Vit E)", "Rosemary Extract"] },
  { id: "bht", name: "BHT", aliases: ["butylated hydroxytoluene"], level: "red", category: "Antioxidant",
    summary: "Tumour promoter in long-term rodent studies. Bioaccumulates.",
    citation: "Lanigan & Yamarik (2002) Int J Toxicol 21(Suppl 2):19", swaps: ["Tocopherol"] },
  { id: "peg", name: "PEG Compounds", aliases: ["peg-", "polyethylene glycol"], level: "red", category: "Solvent",
    summary: "Often contaminated with 1,4-dioxane (probable carcinogen) from manufacture.",
    citation: "Fruijtier-Pölloth (2005) Toxicology 214(1-2):1", swaps: ["Glycerin", "Squalane"] },
  { id: "petrolatum", name: "Petrolatum", aliases: ["petroleum jelly", "mineral oil"], level: "red", category: "Petroleum",
    summary: "Unrefined grades contain PAH carcinogens. Cosmetic-grade should be 'USP white'.",
    citation: "EWG Skin Deep · CIR Final Report (2014)", swaps: ["Shea Butter", "Beeswax", "Lanolin"] },

  // ===== AMBER — moderate concern =====
  { id: "sls", name: "Sodium Lauryl Sulfate", aliases: ["sls"], level: "amber", category: "Surfactant",
    summary: "Strong skin/eye irritant. Disrupts barrier function. Not carcinogenic but harsh.",
    citation: "Bondi et al. (2015) Cosmet Toilet 130:60", swaps: ["Decyl Glucoside", "Sodium Cocoyl Isethionate"] },
  { id: "sles", name: "Sodium Laureth Sulfate", aliases: ["sles"], level: "amber", category: "Surfactant",
    summary: "Less harsh than SLS but ethoxylation can leave 1,4-dioxane traces.",
    citation: "Black & Newsome (2001) J Surfactants Deterg 4(2):201" },
  { id: "phenoxyethanol", name: "Phenoxyethanol", level: "amber", category: "Preservative",
    summary: "Effective preservative. EU caps at 1%. Avoid for infants under 6 months.",
    citation: "EU SCCS/1575/16" },
  { id: "polysorbate-60", name: "Polysorbate 60", level: "amber", category: "Emulsifier",
    summary: "Ethoxylated — possible 1,4-dioxane contamination. Generally safe in finished products.",
    citation: "CIR (1984) J Am Coll Toxicol 3(5):1" },
  { id: "polysorbate-80", name: "Polysorbate 80", level: "amber", category: "Emulsifier",
    summary: "Same concern as polysorbate 60. Look for 'free of 1,4-dioxane' certifications." },
  { id: "cyclomethicone", name: "Cyclomethicone", aliases: ["d4", "d5"], level: "amber", category: "Silicone",
    summary: "D4 and D5 are bioaccumulative; EU restricts D4 in rinse-off products.",
    citation: "EU Regulation (EU) 2018/35", swaps: ["Squalane", "Caprylic/Capric Triglyceride"] },
  { id: "dimethicone", name: "Dimethicone", level: "amber", category: "Silicone",
    summary: "Generally safe but occlusive. Can trap dirt/sebum if not fully rinsed off." },
  { id: "talc", name: "Talc", aliases: ["magnesium silicate"], level: "amber", category: "Mineral",
    summary: "Cosmetic-grade should be asbestos-free. Avoid in genital products (ovarian cancer link).",
    citation: "Penninkilampi & Eslick (2018) Epidemiology 29(1):41", swaps: ["Cornstarch", "Arrowroot Powder"] },
  { id: "methylisothiazolinone", name: "Methylisothiazolinone", aliases: ["mi", "kathon"], level: "amber", category: "Preservative",
    summary: "EU allergen of the year 2013. Restricted to rinse-off at 0.0015%.",
    citation: "Lundov et al. (2011) Br J Dermatol 165(6):1178" },
  { id: "deа", name: "Diethanolamine", aliases: ["dea"], level: "amber", category: "pH Adjuster",
    summary: "Forms nitrosamines (carcinogen) when combined with nitrites. EU restricts.",
    citation: "Fan et al. (2010) Toxicol Sci 117(2):422" },
  { id: "tea", name: "Triethanolamine", aliases: ["tea"], level: "amber", category: "pH Adjuster",
    summary: "Same nitrosamine-formation concern as DEA when combined with preservatives." },
  { id: "toluene", name: "Toluene", level: "amber", category: "Solvent",
    summary: "Neurotoxic with chronic exposure. Restricted in EU nail products to 25%.",
    citation: "EU Regulation (EC) 1223/2009 Annex III" },
  { id: "resorcinol", name: "Resorcinol", level: "amber", category: "Hair Dye",
    summary: "Skin sensitiser & possible endocrine disruptor (thyroid).",
    citation: "Lynch et al. (2002) Food Chem Toxicol 40(8):1175" },
  { id: "cocamidopropyl-betaine", name: "Cocamidopropyl Betaine", level: "amber", category: "Surfactant",
    summary: "Generally safe but contact-allergen for ~3% of users.",
    citation: "Foti et al. (2003) Contact Dermatitis 48(4):194" },

  // ===== GREEN — clean / supportive =====
  { id: "water", name: "Aqua", aliases: ["water"], level: "green", category: "Base",
    summary: "Solvent. Safe." },
  { id: "glycerin", name: "Glycerin", aliases: ["glycerine", "glycerol"], level: "green", category: "Humectant",
    summary: "Vegetable-derived humectant. Pulls moisture into skin. Excellent safety profile." },
  { id: "hyaluronic-acid", name: "Hyaluronic Acid", aliases: ["sodium hyaluronate"], level: "green", category: "Humectant",
    summary: "Holds 1000× its weight in water. Naturally present in skin and joints." },
  { id: "niacinamide", name: "Niacinamide", aliases: ["vitamin b3", "nicotinamide"], level: "green", category: "Active",
    summary: "Reduces hyperpigmentation, improves barrier. ~5% is the sweet spot.",
    citation: "Hakozaki et al. (2002) Br J Dermatol 147(1):20" },
  { id: "squalane", name: "Squalane", aliases: ["squalene"], level: "green", category: "Emollient",
    summary: "Plant-derived (olive/sugarcane) lipid. Non-comedogenic. Mimics skin sebum." },
  { id: "shea-butter", name: "Shea Butter", aliases: ["butyrospermum parkii"], level: "green", category: "Emollient",
    summary: "Whole-plant fat. Vitamin E, fatty acids, anti-inflammatory triterpenes." },
  { id: "coconut-oil", name: "Coconut Oil", aliases: ["cocos nucifera"], level: "green", category: "Emollient",
    summary: "Lauric acid antimicrobial. Comedogenic for some skin types — patch test." },
  { id: "olive-oil", name: "Olive Oil", aliases: ["olea europaea"], level: "green", category: "Emollient",
    summary: "Squalene-rich. Mediterranean traditional skincare." },
  { id: "jojoba-oil", name: "Jojoba Oil", aliases: ["simmondsia chinensis"], level: "green", category: "Emollient",
    summary: "Liquid wax structurally identical to skin sebum. Non-comedogenic." },
  { id: "argan-oil", name: "Argan Oil", aliases: ["argania spinosa"], level: "green", category: "Emollient",
    summary: "Vitamin E, oleic & linoleic acid. Non-occlusive. Patch test for tree-nut allergies." },
  { id: "tocopherol", name: "Tocopherol", aliases: ["vitamin e"], level: "green", category: "Antioxidant",
    summary: "Lipid-soluble antioxidant. Stabilises oils and supports skin barrier." },
  { id: "ascorbic-acid", name: "Ascorbic Acid", aliases: ["vitamin c", "l-ascorbic acid"], level: "green", category: "Active",
    summary: "Antioxidant + collagen co-factor. 10–20% at pH ≤3.5 for efficacy.",
    citation: "Pinnell et al. (2001) Dermatol Surg 27(2):137" },
  { id: "aloe-vera", name: "Aloe Vera", aliases: ["aloe barbadensis"], level: "green", category: "Soothing",
    summary: "Polysaccharides, vitamins, anti-inflammatory. Cooling effect." },
  { id: "beeswax", name: "Beeswax", aliases: ["cera alba"], level: "green", category: "Wax",
    summary: "Natural occlusive. Long-chain esters lock in moisture." },
  { id: "lanolin", name: "Lanolin", level: "green", category: "Emollient",
    summary: "Wool-derived. Closest natural mimic of human sebum. Safe but possible allergen." },
  { id: "caprylic-capric-triglyceride", name: "Caprylic/Capric Triglyceride", level: "green", category: "Emollient",
    summary: "Coconut-derived medium-chain triglyceride. Lightweight, non-comedogenic." },
  { id: "citric-acid", name: "Citric Acid", level: "green", category: "pH Adjuster",
    summary: "Natural pH adjuster. AHA at higher concentrations." },
  { id: "lactic-acid", name: "Lactic Acid", level: "green", category: "AHA",
    summary: "Gentle alpha-hydroxy acid. Hydrating exfoliant. Less irritating than glycolic." },
  { id: "salicylic-acid", name: "Salicylic Acid", level: "green", category: "BHA",
    summary: "Oil-soluble exfoliant. Penetrates pores. Anti-acne at 0.5–2%." },
  { id: "bakuchiol", name: "Bakuchiol", level: "green", category: "Active",
    summary: "Plant-derived retinol alternative. Comparable wrinkle-reduction without photo-sensitivity.",
    citation: "Dhaliwal et al. (2019) Br J Dermatol 180(2):289" },
  { id: "zinc-oxide", name: "Zinc Oxide", level: "green", category: "Mineral UV",
    summary: "Broad-spectrum mineral sunscreen. Reef-safe. Non-nano preferred." },
  { id: "titanium-dioxide", name: "Titanium Dioxide", level: "green", category: "Mineral UV",
    summary: "UVB + UVA-II mineral filter. Pair with zinc oxide for full UVA coverage." },
  { id: "sodium-bicarbonate", name: "Sodium Bicarbonate", aliases: ["baking soda"], level: "green", category: "Mineral",
    summary: "Mild alkaliser. Common natural deodorant base." },
  { id: "magnesium-stearate", name: "Magnesium Stearate", level: "green", category: "Mineral",
    summary: "Inert mineral binder. Safe at cosmetic concentrations." },
];

/* Tokenise an ingredient list and match against the DB */
export type ScanResult = {
  matches: Ingredient[];
  unknown: string[];
  reds: number;
  ambers: number;
  greens: number;
  score: number; // 0–100
  verdict: RiskLevel;
};

export const scanLabel = (input: string): ScanResult => {
  const tokens = input
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/\*/g, "")
    .split(/[,;·•|]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);

  const matches: Ingredient[] = [];
  const seen = new Set<string>();
  const unknown: string[] = [];

  for (const t of tokens) {
    let found: Ingredient | undefined;
    for (const ing of INGREDIENTS) {
      const n = ing.name.toLowerCase();
      const aliases = (ing.aliases ?? []).map((a) => a.toLowerCase());
      if (
        t === n || aliases.includes(t) ||
        t.includes(n) || aliases.some((a) => t.includes(a)) ||
        (n.length >= 6 && n.includes(t) && t.length >= 6)
      ) {
        found = ing;
        break;
      }
    }
    if (found) {
      if (!seen.has(found.id)) {
        matches.push(found);
        seen.add(found.id);
      }
    } else if (t.length >= 3) unknown.push(t);
  }

  const reds = matches.filter((m) => m.level === "red").length;
  const ambers = matches.filter((m) => m.level === "amber").length;
  const greens = matches.filter((m) => m.level === "green").length;
  const score = Math.max(0, Math.min(100, 100 - reds * 18 - ambers * 6));
  const verdict: RiskLevel = score >= 70 ? "green" : score >= 40 ? "amber" : "red";

  return { matches, unknown, reds, ambers, greens, score, verdict };
};

export const SCAN_SAMPLES: { label: string; ingredients: string }[] = [
  {
    label: "Drugstore Body Lotion",
    ingredients: "Aqua, Glycerin, Mineral Oil, Cetyl Alcohol, Dimethicone, Stearic Acid, PEG-100 Stearate, Fragrance, Methylparaben, Propylparaben, BHT, DMDM Hydantoin, Disodium EDTA",
  },
  {
    label: "High-Street Shampoo",
    ingredients: "Aqua, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Sodium Chloride, Fragrance, Methylisothiazolinone, Methylchloroisothiazolinone, Polyquaternium-10, Citric Acid, Hexylene Glycol",
  },
  {
    label: "Generic Sunscreen SPF 50",
    ingredients: "Aqua, Octinoxate, Octocrylene, Avobenzone, Oxybenzone, Homosalate, Glycerin, Tocopherol, Phenoxyethanol, Fragrance",
  },
  {
    label: "Clean Moisturiser",
    ingredients: "Aqua, Glycerin, Squalane, Niacinamide, Hyaluronic Acid, Shea Butter, Tocopherol, Phenoxyethanol, Citric Acid",
  },
];

/* ---------- XP / Credits ---------- */
export const XP_RULES = {
  intelRead: 50,
  mealLogged: 10,
  mealCap: 5,
  workoutLogged: 100,
  workoutCap: 2,
  macrosHit: 200,
  weighIn: 25,
  streak7Bonus: 500,
};

export const CREDIT_PER_XP = 1000;

export type Perk = {
  id: string;
  title: string;
  partner: string;
  cost: number;
  type: "content" | "affiliate";
  description: string;
};

export const PERKS: Perk[] = [
  { id: "recipes-fatloss", type: "content", title: "FAT-LOSS RECIPE PACK", partner: "PrimalForge", cost: 2, description: "20 macro-balanced whole-food recipes engineered for cuts." },
  { id: "recipes-hyrox", type: "content", title: "HYROX RACE-DAY FUEL PLAN", partner: "PrimalForge", cost: 3, description: "T-72hr to T+0 fuelling protocol with carb back-loading schedule." },
  { id: "advanced-workouts", type: "content", title: "ELITE WORKOUT PACK", partner: "PrimalForge", cost: 3, description: "12 elite-level Hyrox simulations and CrossFit benchmarks." },
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

// Returns today's date as DD/MM/YYYY for display (British format).
export const todayDisplay = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

// Converts a stored YYYY-MM-DD key to DD/MM/YYYY for display.
export const formatDateDisplay = (isoDate: string): string => {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
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

export const navyBF = (sex: Sex, height: number, neck: number, waist: number, hip: number) => {
  const log10 = (n: number) => Math.log(n) / Math.LN10;
  if (sex === "m") {
    const denom = 1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height);
    return 495 / denom - 450;
  }
  const denom = 1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height);
  return 495 / denom - 450;
};
