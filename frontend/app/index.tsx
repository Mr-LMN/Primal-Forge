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
   PRIMALFORGE v2 — Metabolic Tracking
   British · Goal-based · Brutalist · Data-driven
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
  profile: "pf_profile_v2",
  log: "pf_log_v2",
  bank: "pf_bank_v2",
  bankHistory: "pf_bank_history_v2",
  water: "pf_water_v2",
  weights: "pf_weights_v2",
  recents: "pf_recents_v2",
};

/* ---------- Types ---------- */
type Sex = "m" | "f";
type Goal = "fatloss" | "muscle" | "maintain" | "athlete";
type BfMode = "manual" | "tape" | "visual";

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

const GOALS: { id: Goal; label: string; sub: string; kcalAdj: number; proPerKg: number; locked?: boolean }[] = [
  { id: "fatloss", label: "FAT LOSS", sub: "Strip adipose · preserve LBM · 20% deficit", kcalAdj: 0.8, proPerKg: 2.4 },
  { id: "muscle", label: "MUSCLE GAIN", sub: "Lean tissue accrual · 10% surplus", kcalAdj: 1.1, proPerKg: 2.2 },
  { id: "maintain", label: "MAINTAIN", sub: "Recomposition at TDEE", kcalAdj: 1.0, proPerKg: 2.0 },
  { id: "athlete", label: "ATHLETE TIER", sub: "HYROX · CROSSFIT · IRONMAN — coming soon", kcalAdj: 1.05, proPerKg: 2.2, locked: true },
];

/* ---------- Visual BF estimates ---------- */
const VISUAL_BF: Record<Sex, { id: string; label: string; bf: number; sub: string }[]> = {
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

/* ---------- British whole-foods database (per 100g) ---------- */
type Unit = { id: string; label: string; g: number };
type Food = {
  id: string;
  name: string;
  cat: string;
  kcal: number;
  p: number;
  f: number;
  c: number;
  units?: Unit[]; // additional units; 'g' is always implicit default
};

const FOODS: Food[] = [
  // ===== BEEF / RUMINANT =====
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
  // ===== LAMB =====
  { id: "lambmince", name: "Lamb Mince (cooked)", cat: "Lamb", kcal: 258, p: 25, f: 17, c: 0 },
  { id: "lambchop", name: "Lamb Chop (grilled)", cat: "Lamb", kcal: 294, p: 25, f: 21, c: 0 },
  { id: "lambshoulder", name: "Slow-Roast Lamb Shoulder", cat: "Lamb", kcal: 285, p: 25, f: 21, c: 0 },
  { id: "mutton", name: "Mutton (cooked)", cat: "Lamb", kcal: 246, p: 24, f: 16, c: 0 },
  // ===== PORK / BANGERS =====
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
  // ===== POULTRY =====
  { id: "breast", name: "Chicken Breast (cooked)", cat: "Poultry", kcal: 165, p: 31, f: 4, c: 0 },
  { id: "thigh", name: "Chicken Thigh (skin on)", cat: "Poultry", kcal: 229, p: 25, f: 14, c: 0 },
  { id: "wings", name: "Chicken Wings (skin on)", cat: "Poultry", kcal: 266, p: 27, f: 17, c: 0 },
  { id: "roastchicken", name: "Whole Roast Chicken (meat+skin)", cat: "Poultry", kcal: 239, p: 27, f: 14, c: 0 },
  { id: "turkey", name: "Roast Turkey (meat+skin)", cat: "Poultry", kcal: 189, p: 28, f: 8, c: 0 },
  { id: "duck", name: "Duck Breast (skin on)", cat: "Poultry", kcal: 337, p: 19, f: 28, c: 0 },
  { id: "pheasant", name: "Pheasant (roast)", cat: "Poultry", kcal: 213, p: 31, f: 9, c: 0 },
  // ===== SEAFOOD (British waters) =====
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
  // ===== EGGS / DAIRY (British) =====
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
  // ===== ANIMAL FATS =====
  { id: "dripping", name: "Beef Dripping", cat: "Animal Fat", kcal: 902, p: 0, f: 100, c: 0,
    units: [{ id: "tbsp", label: "tbsp", g: 13 }, { id: "tsp", label: "tsp", g: 4.5 }] },
  { id: "lard", name: "Lard", cat: "Animal Fat", kcal: 902, p: 0, f: 100, c: 0,
    units: [{ id: "tbsp", label: "tbsp", g: 13 }, { id: "tsp", label: "tsp", g: 4.5 }] },
  { id: "tallow", name: "Tallow", cat: "Animal Fat", kcal: 902, p: 0, f: 100, c: 0,
    units: [{ id: "tbsp", label: "tbsp", g: 13 }, { id: "tsp", label: "tsp", g: 4.5 }] },
  { id: "duckfat", name: "Duck Fat", cat: "Animal Fat", kcal: 882, p: 0, f: 99, c: 0,
    units: [{ id: "tbsp", label: "tbsp", g: 13 }, { id: "tsp", label: "tsp", g: 4.5 }] },
  // ===== FRUIT / HONEY =====
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
  // ===== REFEED CARBS =====
  { id: "jacket", name: "Jacket Potato (baked)", cat: "Refeed Carb", kcal: 93, p: 2.5, f: 0.1, c: 21,
    units: [{ id: "potato", label: "med jacket", g: 250 }] },
  { id: "newpot", name: "New Potatoes (boiled)", cat: "Refeed Carb", kcal: 75, p: 1.7, f: 0.1, c: 17 },
  { id: "sweetpot", name: "Sweet Potato (baked)", cat: "Refeed Carb", kcal: 90, p: 2, f: 0.1, c: 21 },
  { id: "rice-white", name: "White Rice (boiled)", cat: "Refeed Carb", kcal: 130, p: 2.7, f: 0.3, c: 28 },
  { id: "maple", name: "Maple Syrup", cat: "Refeed Carb", kcal: 260, p: 0, f: 0.2, c: 67,
    units: [{ id: "tbsp", label: "tbsp", g: 20 }, { id: "tsp", label: "tsp", g: 7 }] },
];

/* ---------- Arsenal (science-backed) ---------- */
type Tip = { title: string; body: string; citation: string; tag: string };
const TIPS: Tip[] = [
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
];

/* ---------- Helpers ---------- */
const round = (n: number, d = 0) => {
  const m = Math.pow(10, d);
  return Math.round(n * m) / m;
};

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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

/* US Navy body fat — inputs in cm */
const navyBF = (sex: Sex, height: number, neck: number, waist: number, hip: number) => {
  const log10 = (n: number) => Math.log(n) / Math.LN10;
  if (sex === "m") {
    const denom = 1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height);
    return 495 / denom - 450;
  }
  const denom = 1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height);
  return 495 / denom - 450;
};

type Profile = {
  sex: Sex;
  weight: number;
  height: number; // cm
  bodyFat: number;
  bfMode: BfMode;
  goal: Goal;
  tier: ActivityTier;
  lbm: number;
  bmr: number;
  tdee: number;
  calories: number; // goal-adjusted
  protein: number;
  carbs: number;
  fat: number;
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

type LogEntry = {
  id: string;
  foodId: string;
  name: string;
  amount: number; // user entered count
  unit: string; // unit label
  grams: number; // calculated total grams
  kcal: number;
  p: number;
  f: number;
  c: number;
  time: string;
  dateKey: string;
};

type WeightEntry = { date: string; weight: number };

/* =========================================================
   ROOT
   ========================================================= */
export default function Index() {
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [bank, setBank] = useState<number>(0);
  const [bankHistory, setBankHistory] = useState<{ date: string; deficit: number }[]>([]);
  const [waterMap, setWaterMap] = useState<Record<string, number>>({});
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  const [tab, setTab] = useState<"hud" | "fuel" | "ledger" | "arsenal">("hud");
  const [weightModal, setWeightModal] = useState(false);

  useEffect(() => {
    (async () => {
      const items = await AsyncStorage.multiGet([
        STORAGE.profile, STORAGE.log, STORAGE.bank, STORAGE.bankHistory,
        STORAGE.water, STORAGE.weights, STORAGE.recents,
      ]);
      const map = Object.fromEntries(items);
      if (map[STORAGE.profile]) setProfile(JSON.parse(map[STORAGE.profile]!));
      if (map[STORAGE.log]) setLog(JSON.parse(map[STORAGE.log]!));
      if (map[STORAGE.bank]) setBank(parseFloat(map[STORAGE.bank]!));
      if (map[STORAGE.bankHistory]) setBankHistory(JSON.parse(map[STORAGE.bankHistory]!));
      if (map[STORAGE.water]) setWaterMap(JSON.parse(map[STORAGE.water]!));
      if (map[STORAGE.weights]) setWeights(JSON.parse(map[STORAGE.weights]!));
      if (map[STORAGE.recents]) setRecents(JSON.parse(map[STORAGE.recents]!));
      setLoaded(true);
    })();
  }, []);

  const persist = async (k: string, v: string) => AsyncStorage.setItem(k, v);

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

  const resetAll = async () => {
    await AsyncStorage.multiRemove(Object.values(STORAGE));
    setProfile(null); setLog([]); setBank(0); setBankHistory([]);
    setWaterMap({}); setWeights([]); setRecents([]);
  };

  if (!loaded) {
    return (
      <View style={[styles.root, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={styles.brandSmall}>PRIMALFORGE</Text>
      </View>
    );
  }

  if (!profile) return <Onboarding onComplete={saveProfile} />;

  const today = log.filter((e) => e.dateKey === todayKey());
  const totals = today.reduce(
    (a, e) => ({ kcal: a.kcal + e.kcal, p: a.p + e.p, f: a.f + e.f, c: a.c + e.c }),
    { kcal: 0, p: 0, f: 0, c: 0 }
  );
  const waterToday = waterMap[todayKey()] || 0;
  const waterTarget = Math.round(profile.weight * 35); // ml

  const handleLog = async (entry: LogEntry) => {
    await saveLog([...log, entry]);
    const nextRecents = [entry.foodId, ...recents.filter((id) => id !== entry.foodId)].slice(0, 6);
    await saveRecents(nextRecents);
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <StatusBar style="light" />
      <View style={styles.shell}>
        <Header profile={profile} onReset={resetAll} onWeight={() => setWeightModal(true)} />
        <View style={{ flex: 1 }}>
          {tab === "hud" && (
            <HUDView
              profile={profile}
              totals={totals}
              waterMl={waterToday}
              waterTarget={waterTarget}
              addWater={async (delta) => {
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
                if (deficit <= 0) { Alert.alert("NO DEFICIT", "You're at or over carb target. Nothing to bank."); return; }
                if (bankHistory.find((h) => h.date === todayKey())) { Alert.alert("ALREADY BANKED", "Today's deficit is already in the vault."); return; }
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
      <WeightCheckIn
        visible={weightModal}
        onClose={() => setWeightModal(false)}
        weights={weights}
        onSave={async (kg) => {
          const next = [{ date: todayKey(), weight: kg }, ...weights.filter((w) => w.date !== todayKey())];
          await saveWeights(next);
          if (profile) await saveProfile(buildProfile({
            sex: profile.sex, weight: kg, height: profile.height, bodyFat: profile.bodyFat,
            bfMode: profile.bfMode, goal: profile.goal, tier: profile.tier,
          }));
          setWeightModal(false);
        }}
      />
    </SafeAreaView>
  );
}

/* =========================================================
   HEADER
   ========================================================= */
function Header({ profile, onReset, onWeight }: { profile: Profile; onReset: () => void; onWeight: () => void }) {
  const goalLabel = GOALS.find((g) => g.id === profile.goal)?.label || "—";
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Text style={styles.brand}>PRIMALFORGE</Text>
        <Text style={styles.brandSub}>
          {goalLabel} · {profile.tier.label} · {profile.calories} kcal
        </Text>
      </View>
      <TouchableOpacity testID="header-weight-btn" onPress={onWeight} style={[styles.iconBtn, { marginRight: 8 }]}>
        <Ionicons name="trending-down" size={18} color={C.textDim} />
      </TouchableOpacity>
      <TouchableOpacity
        testID="header-reset-btn"
        onPress={() => confirmAction("WIPE PROTOCOL", "Reset profile, logs, and bank?", onReset)}
        style={styles.iconBtn}
      >
        <Ionicons name="power" size={18} color={C.textDim} />
      </TouchableOpacity>
    </View>
  );
}

/* =========================================================
   ONBOARDING (multi-step)
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

  /* derived BF */
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

  /* live preview */
  const preview = useMemo(() => {
    if (!allValid || !goal || !sex || !tier) return null;
    return buildProfile({
      sex, weight: parseFloat(weight), height: parseFloat(height),
      bodyFat: computedBF, bfMode, goal, tier,
    });
  }, [allValid, goal, sex, weight, height, computedBF, bfMode, tier]);

  const submit = () => { if (preview) onComplete(preview); };

  const next = () => {
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

          {/* STEP 1 — GOAL */}
          {step === 1 && (
            <View>
              <Text style={styles.stepTitle}>WHAT'S THE MISSION?</Text>
              <Text style={styles.stepSub}>Pick a primary objective. We'll calibrate the math to match.</Text>
              {GOALS.map((g) => {
                const active = goal === g.id;
                return (
                  <TouchableOpacity
                    key={g.id}
                    testID={`goal-${g.id}`}
                    onPress={() => !g.locked && setGoal(g.id)}
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

          {/* STEP 2 — VITALS */}
          {step === 2 && (
            <View>
              <Text style={styles.stepTitle}>VITALS</Text>
              <Text style={styles.stepSub}>Sex, weight, and height drive every calculation.</Text>

              <Text style={styles.label}>SEX</Text>
              <View style={styles.segRow}>
                {(["m", "f"] as Sex[]).map((s) => {
                  const active = sex === s;
                  return (
                    <TouchableOpacity
                      key={s}
                      testID={`sex-${s}`}
                      onPress={() => setSex(s)}
                      style={[styles.segBtn, active && styles.segBtnActive]}
                    >
                      <Text style={[styles.segText, active && { color: C.bg }]}>
                        {s === "m" ? "MALE" : "FEMALE"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.hint}>Required for the Navy Tape Method &amp; protein scaling.</Text>

              <View style={styles.onboardField}>
                <Text style={styles.label}>BODY WEIGHT · KG</Text>
                <TextInput
                  testID="onboard-weight-input"
                  value={weight} onChangeText={setWeight} placeholder="84" placeholderTextColor={C.textMute}
                  keyboardType="decimal-pad" style={styles.input}
                />
              </View>
              <View style={styles.onboardField}>
                <Text style={styles.label}>HEIGHT · CM</Text>
                <TextInput
                  testID="onboard-height-input"
                  value={height} onChangeText={setHeight} placeholder="178" placeholderTextColor={C.textMute}
                  keyboardType="decimal-pad" style={styles.input}
                />
              </View>
            </View>
          )}

          {/* STEP 3 — BODY FAT */}
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
                    <TouchableOpacity
                      key={m.id}
                      testID={`bfmode-${m.id}`}
                      onPress={() => setBfMode(m.id)}
                      style={[styles.modeBtn, active && styles.modeBtnActive]}
                    >
                      <Text style={[styles.modeText, active && { color: C.bg }]}>{m.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {bfMode === "manual" && (
                <View style={styles.onboardField}>
                  <Text style={styles.label}>BODY FAT · %</Text>
                  <TextInput
                    testID="onboard-bf-input"
                    value={bfManual} onChangeText={setBfManual} placeholder="15" placeholderTextColor={C.textMute}
                    keyboardType="decimal-pad" style={styles.input}
                  />
                  <Text style={styles.hint}>DEXA &gt; calipers &gt; mirror.</Text>
                </View>
              )}

              {bfMode === "tape" && (
                <View>
                  <Text style={styles.hint}>
                    US Navy circumference method. Soft tape, no compression. Results within ±3% of DEXA.
                  </Text>
                  {!sex && (
                    <View style={styles.warnBox}>
                      <Ionicons name="warning" size={16} color={C.warning} />
                      <Text style={styles.warnText}>Set sex in Step 2 first.</Text>
                    </View>
                  )}
                  <View style={styles.onboardField}>
                    <Text style={styles.label}>NECK · CM (below larynx)</Text>
                    <TextInput
                      testID="tape-neck-input"
                      value={neck} onChangeText={setNeck} placeholder="38" placeholderTextColor={C.textMute}
                      keyboardType="decimal-pad" style={styles.input}
                    />
                  </View>
                  <View style={styles.onboardField}>
                    <Text style={styles.label}>WAIST · CM (at navel)</Text>
                    <TextInput
                      testID="tape-waist-input"
                      value={waist} onChangeText={setWaist} placeholder="84" placeholderTextColor={C.textMute}
                      keyboardType="decimal-pad" style={styles.input}
                    />
                  </View>
                  {sex === "f" && (
                    <View style={styles.onboardField}>
                      <Text style={styles.label}>HIP · CM (widest point)</Text>
                      <TextInput
                        testID="tape-hip-input"
                        value={hip} onChangeText={setHip} placeholder="98" placeholderTextColor={C.textMute}
                        keyboardType="decimal-pad" style={styles.input}
                      />
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
                      <TouchableOpacity
                        key={v.id}
                        testID={`visual-${v.id}`}
                        onPress={() => setVisualBf(v.bf)}
                        style={[styles.visualCard, active && styles.visualCardActive]}
                      >
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

          {/* STEP 4 — ACTIVITY + REVIEW */}
          {step === 4 && (
            <View>
              <Text style={styles.stepTitle}>TRAINING LOAD</Text>
              <Text style={styles.stepSub}>Your true daily output. Be honest.</Text>
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

          {/* NAV BUTTONS */}
          <View style={styles.navRow}>
            {step > 1 && (
              <TouchableOpacity
                testID="onboard-back-btn"
                onPress={() => setStep(step - 1)}
                style={styles.secondaryBtn}
              >
                <Ionicons name="arrow-back" size={16} color={C.text} />
                <Text style={styles.secondaryBtnText}>BACK</Text>
              </TouchableOpacity>
            )}
            {step < 4 ? (
              <TouchableOpacity
                testID="onboard-next-btn"
                disabled={
                  (step === 1 && !step1Valid) ||
                  (step === 2 && !step2Valid) ||
                  (step === 3 && !step3Valid)
                }
                onPress={next}
                style={[
                  styles.primaryBtn,
                  { flex: 1 },
                  ((step === 1 && !step1Valid) || (step === 2 && !step2Valid) || (step === 3 && !step3Valid)) && styles.primaryBtnDisabled,
                ]}
              >
                <Text style={styles.primaryBtnText}>NEXT →</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                testID="onboard-submit-btn"
                disabled={!allValid}
                onPress={submit}
                style={[styles.primaryBtn, { flex: 1 }, !allValid && styles.primaryBtnDisabled]}
              >
                <Text style={styles.primaryBtnText}>FORGE PROFILE →</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.onboardFooter}>
            LBM = W × (1 − BF/100) · BMR = 370 + 21.6 × LBM · TDEE = BMR × Activity
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.previewStat}>
      <Text style={styles.previewStatLabel}>{label}</Text>
      <Text style={styles.previewStatValue}>{value}</Text>
    </View>
  );
}
function PreviewMacro({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.previewMacro, { borderColor: color }]}>
      <Text style={[styles.previewMacroLabel, { color }]}>{label}</Text>
      <Text style={styles.previewMacroValue}>{value}</Text>
    </View>
  );
}

/* =========================================================
   HUD VIEW
   ========================================================= */
function HUDView({
  profile, totals, waterMl, waterTarget, addWater, weights,
}: {
  profile: Profile;
  totals: { kcal: number; p: number; f: number; c: number };
  waterMl: number;
  waterTarget: number;
  addWater: (delta: number) => void;
  weights: WeightEntry[];
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

      <View style={styles.macroGrid}>
        <MacroBar label="CALORIES" unit="kcal" value={totals.kcal} target={profile.calories} color={C.text} />
        <MacroBar label="PROTEIN" unit="g" value={totals.p} target={profile.protein} color={C.science} />
        <MacroBar label="FAT" unit="g" value={totals.f} target={profile.fat} color={C.warning} />
        <MacroBar
          label="CARBS"
          unit="g"
          value={totals.c}
          target={profile.carbs}
          color={
            carbStatus === "optimal" ? C.optimal : carbStatus === "warning" ? C.warning : C.penalty
          }
        />
      </View>

      <CarbStatusCard status={carbStatus} delta={carbDelta} target={profile.carbs} consumed={totals.c} />
      {burpees > 0 && <BurpeePenalty burpees={burpees} />}

      {/* Water tracker */}
      <View style={styles.waterCard} testID="water-card">
        <View style={styles.waterHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.waterLabel}>HYDRATION · WATER</Text>
            <Text style={styles.waterValue}>
              {waterMl} <Text style={styles.waterTarget}>/ {waterTarget} ml</Text>
            </Text>
          </View>
          <Ionicons name="water" size={28} color={C.science} />
        </View>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.min(100, (waterMl / waterTarget) * 100)}%`, backgroundColor: C.science },
            ]}
          />
        </View>
        <View style={styles.waterBtnRow}>
          <TouchableOpacity testID="water-minus-btn" onPress={() => addWater(-250)} style={styles.waterBtn}>
            <Ionicons name="remove" size={18} color={C.text} />
            <Text style={styles.waterBtnText}>250ml</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="water-plus-btn" onPress={() => addWater(250)} style={[styles.waterBtn, styles.waterBtnPrimary]}>
            <Ionicons name="add" size={18} color={C.bg} />
            <Text style={[styles.waterBtnText, { color: C.bg }]}>250ml</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="water-500-btn" onPress={() => addWater(500)} style={[styles.waterBtn, styles.waterBtnPrimary]}>
            <Ionicons name="add" size={18} color={C.bg} />
            <Text style={[styles.waterBtnText, { color: C.bg }]}>500ml</Text>
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
              <Text
                style={[
                  styles.weightTrendDelta,
                  { color: trend < 0 ? C.optimal : trend > 0 ? C.warning : C.textDim },
                ]}
              >
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
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function CarbStatusCard({ status, delta, target, consumed }: { status: "optimal" | "warning" | "penalty"; delta: number; target: number; consumed: number }) {
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
    return Array.from({ length: 6 }, (_, i) => ({ idx: i + 1, offset: i * 30, reps: per }));
  }, [burpees]);
  return (
    <View style={styles.penaltyCard} testID="burpee-penalty">
      <Text style={styles.penaltyTag}>EXCESS CARB DEBT</Text>
      <Text style={styles.penaltyValue} testID="burpee-count">🔴 {burpees} BURPEES REQUIRED</Text>
      <Text style={styles.penaltyFormula}>((excess × 4 kcal) ÷ 1.4) — repay glycogen surplus or store as adipose.</Text>
      {burpees > 50 && (
        <TouchableOpacity testID="siphon-alarm-btn" onPress={() => setSiphon(true)} style={styles.siphonBtn}>
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
  log, recents, onLog, onWipe,
}: {
  log: LogEntry[];
  recents: string[];
  onLog: (e: LogEntry) => void;
  onWipe: () => void;
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
      id: `${Date.now()}`,
      foodId: selected.id,
      name: selected.name,
      amount: n,
      unit: unit.label,
      grams: round(grams, 1),
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

  /* live preview while typing */
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

        {/* Recents */}
        {recentFoods.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.subKicker}>RECENT</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {recentFoods.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  testID={`recent-${f.id}`}
                  onPress={() => pickFood(f)}
                  style={styles.recentChip}
                >
                  <Text style={styles.recentChipText} numberOfLines={1}>{f.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <TouchableOpacity testID="open-food-picker" onPress={() => setPicker(true)} style={styles.foodPickerBtn}>
          <View style={{ flex: 1 }}>
            <Text style={styles.foodPickerLabel}>FOOD</Text>
            <Text style={styles.foodPickerValue}>{selected ? selected.name : "Tap to select…"}</Text>
            {selected && (
              <Text style={styles.foodPickerMeta}>
                {selected.kcal} kcal · {selected.p}P / {selected.f}F / {selected.c}C per 100g
              </Text>
            )}
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
                  <TouchableOpacity
                    key={u.id}
                    testID={`unit-${u.id}`}
                    onPress={() => setUnit(u)}
                    style={[styles.unitChip, active && styles.unitChipActive]}
                  >
                    <Text style={[styles.unitChipText, active && { color: C.bg }]}>{u.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.onboardField}>
          <Text style={styles.label}>{unit.id === "g" ? "GRAMS" : `AMOUNT · ${unit.label.toUpperCase()}`}</Text>
          <TextInput
            testID="fuel-amount-input"
            value={amount} onChangeText={setAmount} placeholder={unit.id === "g" ? "200" : "1"}
            placeholderTextColor={C.textMute} keyboardType="decimal-pad" style={styles.input}
          />
          {preview && (
            <Text style={styles.previewInline} testID="fuel-preview">
              ≈ {preview.kcal} kcal · {preview.p}P / {preview.f}F / {preview.c}C
            </Text>
          )}
        </View>

        <TouchableOpacity
          testID="fuel-log-btn"
          onPress={submit}
          disabled={!selected || !amount}
          style={[styles.primaryBtn, (!selected || !amount) && styles.primaryBtnDisabled]}
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
                  {e.amount} {e.unit}{e.unit !== "g" ? ` (${e.grams}g)` : ""} · {e.time}
                </Text>
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
              <TextInput
                testID="food-search-input"
                value={search} onChangeText={setSearch} placeholder="ribeye, kippers, honey…"
                placeholderTextColor={C.textMute} style={styles.searchInput}
              />
            </View>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
              {filtered.map((f) => (
                <Pressable
                  key={f.id}
                  testID={`food-option-${f.id}`}
                  onPress={() => pickFood(f)}
                  style={({ pressed }) => [styles.foodRow, pressed && { backgroundColor: C.cardHi }]}
                >
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
   LEDGER VIEW
   ========================================================= */
function LedgerView({
  profile, consumedCarbs, bank, history, onBank, onReset,
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
        <TouchableOpacity
          testID="bank-deficit-btn"
          onPress={onBank}
          disabled={todayDeficit <= 0 || alreadyBanked}
          style={[styles.bankBtn, (todayDeficit <= 0 || alreadyBanked) && styles.bankBtnDisabled]}
        >
          <Text style={styles.bankBtnText}>{alreadyBanked ? "BANKED" : "BANK IT"}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.todayLogHeader}>
        <Text style={styles.sectionKicker}>HISTORY · {history.length}</Text>
        {history.length > 0 && (
          <TouchableOpacity
            testID="reset-bank-btn"
            onPress={() => confirmAction("RESET BANK", "Clear all banked surplus and history?", onReset)}
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
      <Text style={styles.arsenalLead}>Peer-reviewed protocols. No bro-science. Citations included.</Text>
      {TIPS.map((t, i) => (
        <View key={i} style={styles.tipCard} testID={`tip-${i}`}>
          <View style={styles.tipHeader}>
            <Text style={styles.tipIdx}>{String(i + 1).padStart(2, "0")}</Text>
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
   WEIGHT CHECK-IN MODAL
   ========================================================= */
function WeightCheckIn({
  visible, onClose, weights, onSave,
}: {
  visible: boolean;
  onClose: () => void;
  weights: WeightEntry[];
  onSave: (kg: number) => void;
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
          <Text style={styles.modalSub}>
            Daily weigh-in. Same time, same scale. Trend &gt; absolute.
          </Text>
          <Text style={styles.label}>WEIGHT · KG</Text>
          <TextInput
            testID="weight-input"
            value={kg} onChangeText={setKg} placeholder="84.2" placeholderTextColor={C.textMute}
            keyboardType="decimal-pad" style={styles.input} autoFocus
          />
          <TouchableOpacity
            testID="weight-save-btn"
            onPress={submit}
            disabled={!kg}
            style={[styles.primaryBtn, !kg && styles.primaryBtnDisabled, { marginTop: 14 }]}
          >
            <Text style={styles.primaryBtnText}>LOG WEIGHT</Text>
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
function TabBar({ tab, setTab }: { tab: "hud" | "fuel" | "ledger" | "arsenal"; setTab: (t: "hud" | "fuel" | "ledger" | "arsenal") => void }) {
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

/* =========================================================
   STYLES
   ========================================================= */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  shell: {
    flex: 1, width: "100%",
    maxWidth: Platform.OS === "web" ? 480 : undefined,
    alignSelf: "center", backgroundColor: C.bg,
  },

  /* Header */
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderColor: C.border,
  },
  brand: { fontSize: 22, fontWeight: "900", color: C.text, letterSpacing: 4 },
  brandSmall: { color: C.text, letterSpacing: 6, fontWeight: "900" },
  brandSub: { color: C.textDim, fontSize: 11, letterSpacing: 2, marginTop: 2, fontWeight: "700" },
  iconBtn: {
    width: 40, height: 40, borderRadius: 8,
    borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center", backgroundColor: C.card,
  },

  /* Onboarding */
  onboardScroll: { padding: 20, paddingBottom: 60 },
  onboardHero: { marginTop: 12, marginBottom: 28 },
  onboardKicker: { color: C.science, letterSpacing: 6, fontWeight: "900", fontSize: 11, marginBottom: 8 },
  progressTrack: {
    height: 3, backgroundColor: C.border, borderRadius: 2, marginTop: 14, overflow: "hidden",
  },
  progressFill: { height: 3, backgroundColor: C.text },
  stepTitle: { color: C.text, fontSize: 22, fontWeight: "900", letterSpacing: 1, marginBottom: 8 },
  stepSub: { color: C.textDim, fontSize: 13, lineHeight: 19, marginBottom: 20, maxWidth: 340 },

  /* Goals */
  goalCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    padding: 18, borderRadius: 12, marginBottom: 10,
  },
  goalCardActive: { borderColor: C.optimal, backgroundColor: C.cardHi },
  goalCardLocked: { opacity: 0.55 },
  goalLabel: { color: C.textDim, fontWeight: "900", letterSpacing: 2, fontSize: 14 },
  goalSub: { color: C.textMute, fontSize: 12, marginTop: 6, lineHeight: 17 },
  lockTag: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(14,165,233,0.1)",
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  lockText: { color: C.science, fontSize: 9, fontWeight: "900", letterSpacing: 2 },

  /* Segmented */
  segRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  segBtn: {
    flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    paddingVertical: 14, borderRadius: 10, alignItems: "center",
  },
  segBtnActive: { backgroundColor: C.text, borderColor: C.text },
  segText: { color: C.textDim, letterSpacing: 2, fontWeight: "900", fontSize: 12 },

  /* BF mode */
  modeRow: { flexDirection: "row", gap: 6, marginBottom: 16 },
  modeBtn: {
    flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    paddingVertical: 12, borderRadius: 8, alignItems: "center",
  },
  modeBtnActive: { backgroundColor: C.text, borderColor: C.text },
  modeText: { color: C.textDim, letterSpacing: 1, fontWeight: "900", fontSize: 11 },
  warnBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(245,158,11,0.08)",
    borderColor: C.warning, borderWidth: 1, borderRadius: 8,
    padding: 12, marginBottom: 12,
  },
  warnText: { color: C.warning, fontSize: 12, fontWeight: "700" },
  computedBox: {
    backgroundColor: "rgba(34,197,94,0.08)",
    borderWidth: 1, borderColor: C.optimal,
    borderRadius: 10, padding: 14, marginTop: 4,
  },
  computedLabel: { color: C.optimal, letterSpacing: 3, fontSize: 10, fontWeight: "900" },
  computedValue: { color: C.optimal, fontSize: 30, fontWeight: "900", marginTop: 4 },

  /* Visual cards */
  visualCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    padding: 16, borderRadius: 10, marginBottom: 8,
  },
  visualCardActive: { borderColor: C.text, backgroundColor: C.cardHi },
  visualLabel: { color: C.textDim, fontWeight: "900", letterSpacing: 2, fontSize: 13 },
  visualSub: { color: C.textMute, fontSize: 12, marginTop: 4 },
  visualBf: { color: C.text, fontSize: 18, fontWeight: "900" },

  /* Onboarding shared */
  onboardField: { marginBottom: 18 },
  label: { color: C.textDim, letterSpacing: 3, fontSize: 10, fontWeight: "800", marginBottom: 8 },
  input: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    color: C.text, fontSize: 22, fontWeight: "700",
    paddingHorizontal: 16, paddingVertical: 16, borderRadius: 10,
  },
  hint: { color: C.textMute, fontSize: 11, marginTop: 6, letterSpacing: 1 },
  tierBtn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    padding: 16, borderRadius: 10, marginBottom: 8,
  },
  tierBtnActive: { borderColor: C.text, backgroundColor: C.cardHi },
  tierLabel: { color: C.textDim, fontWeight: "900", letterSpacing: 2, fontSize: 13 },
  tierSub: { color: C.textMute, fontSize: 12, marginTop: 4 },
  tierMeta: { alignItems: "flex-end" },
  tierMetaTop: { color: C.text, fontWeight: "900", fontSize: 14 },
  tierMetaBot: { color: C.textDim, fontSize: 11, fontWeight: "700", marginTop: 2 },

  /* Preview card */
  previewCard: {
    backgroundColor: C.cardHi, borderWidth: 1, borderColor: C.borderHi,
    borderRadius: 14, padding: 18, marginTop: 8,
  },
  previewKicker: { color: C.science, letterSpacing: 4, fontSize: 10, fontWeight: "900", marginBottom: 12 },
  previewRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  previewStat: {
    flex: 1, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
    borderRadius: 8, padding: 10, alignItems: "center",
  },
  previewStatLabel: { color: C.textMute, fontSize: 9, letterSpacing: 2, fontWeight: "800" },
  previewStatValue: { color: C.text, fontSize: 14, fontWeight: "900", marginTop: 2 },
  previewBig: {
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, padding: 14, alignItems: "center",
  },
  previewBigLabel: { color: C.textDim, letterSpacing: 3, fontSize: 10, fontWeight: "900" },
  previewBigValue: { color: C.text, fontSize: 38, fontWeight: "900", marginTop: 4 },
  previewMacros: { flexDirection: "row", gap: 8, marginTop: 12 },
  previewMacro: {
    flex: 1, borderWidth: 1.5, borderRadius: 8,
    paddingVertical: 10, alignItems: "center",
  },
  previewMacroLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  previewMacroValue: { color: C.text, fontSize: 16, fontWeight: "900", marginTop: 2 },

  navRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  primaryBtn: {
    backgroundColor: C.text, paddingVertical: 18, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  primaryBtnDisabled: { backgroundColor: C.border },
  primaryBtnText: { color: C.bg, fontWeight: "900", letterSpacing: 3, fontSize: 13 },
  secondaryBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    paddingVertical: 18, paddingHorizontal: 18, borderRadius: 10,
  },
  secondaryBtnText: { color: C.text, fontWeight: "900", letterSpacing: 2, fontSize: 12 },
  onboardFooter: {
    color: C.textMute, fontSize: 10, textAlign: "center",
    marginTop: 24, letterSpacing: 1, lineHeight: 16,
  },

  /* Sections */
  scrollPad: { padding: 20, paddingBottom: 100 },
  sectionKicker: { color: C.textDim, letterSpacing: 4, fontSize: 11, fontWeight: "900", marginBottom: 14 },
  subKicker: { color: C.textMute, letterSpacing: 3, fontSize: 10, fontWeight: "900", marginBottom: 10 },

  /* Macros */
  macroGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  macroCard: {
    width: "48%", backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14,
  },
  macroLabel: { color: C.textDim, fontSize: 10, letterSpacing: 2, fontWeight: "800", marginBottom: 8 },
  macroValueRow: { flexDirection: "row", alignItems: "baseline" },
  macroValue: { color: C.text, fontSize: 24, fontWeight: "900" },
  macroTarget: { color: C.textMute, fontSize: 11, fontWeight: "700" },
  barTrack: { height: 4, backgroundColor: C.border, borderRadius: 2, marginTop: 10, overflow: "hidden" },
  barFill: { height: 4, borderRadius: 2 },

  /* Status */
  statusCard: { borderWidth: 1.5, borderRadius: 12, padding: 16, backgroundColor: C.card, marginBottom: 14 },
  statusHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  statusTag: { fontSize: 11, fontWeight: "900", letterSpacing: 3 },
  statusDetail: { color: C.text, fontSize: 14, lineHeight: 20 },

  /* Penalty */
  penaltyCard: {
    backgroundColor: "#1a0808", borderWidth: 1.5, borderColor: C.penalty,
    borderRadius: 12, padding: 18, marginBottom: 14,
  },
  penaltyTag: { color: C.penalty, fontSize: 11, letterSpacing: 3, fontWeight: "900", marginBottom: 8 },
  penaltyValue: { color: C.text, fontSize: 24, fontWeight: "900", letterSpacing: 1, marginBottom: 8 },
  penaltyFormula: { color: C.textDim, fontSize: 12, lineHeight: 18, marginBottom: 12 },
  siphonBtn: {
    backgroundColor: C.penalty, paddingVertical: 14, borderRadius: 8,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  siphonBtnText: { color: C.bg, fontWeight: "900", letterSpacing: 2, fontSize: 12 },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", padding: 20 },
  modalCard: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.borderHi,
    borderRadius: 16, padding: 22,
  },
  modalTitle: { color: C.penalty, letterSpacing: 4, fontWeight: "900", fontSize: 14 },
  modalTitleLight: { color: C.text, letterSpacing: 4, fontWeight: "900", fontSize: 14 },
  modalSub: { color: C.textDim, fontSize: 13, lineHeight: 19, marginTop: 8, marginBottom: 18 },
  block: {
    flexDirection: "row", alignItems: "center", backgroundColor: C.bg2,
    borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 12, marginBottom: 8,
  },
  blockIdx: { color: C.penalty, fontWeight: "900", fontSize: 18, width: 40 },
  blockTime: { color: C.textDim, fontSize: 10, letterSpacing: 2, fontWeight: "700" },
  blockReps: { color: C.text, fontWeight: "900", fontSize: 16, marginTop: 2 },

  /* Water */
  waterCard: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 16, marginBottom: 14,
  },
  waterHeader: { flexDirection: "row", alignItems: "center" },
  waterLabel: { color: C.textDim, fontSize: 10, letterSpacing: 2, fontWeight: "800" },
  waterValue: { color: C.text, fontSize: 22, fontWeight: "900", marginTop: 4 },
  waterTarget: { color: C.textMute, fontSize: 13, fontWeight: "700" },
  waterBtnRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  waterBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4,
    backgroundColor: C.bg2, borderWidth: 1, borderColor: C.border,
    paddingVertical: 12, borderRadius: 8,
  },
  waterBtnPrimary: { backgroundColor: C.science, borderColor: C.science },
  waterBtnText: { color: C.text, fontWeight: "900", fontSize: 12, letterSpacing: 1 },

  /* Mini stats */
  miniStats: { flexDirection: "row", gap: 10, marginTop: 4 },
  miniStatBox: {
    flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, padding: 12, alignItems: "center",
  },
  miniStatLabel: { color: C.textMute, fontSize: 10, letterSpacing: 2, fontWeight: "800" },
  miniStatValue: { color: C.text, fontSize: 16, fontWeight: "900", marginTop: 4 },

  /* Weight trend on HUD */
  weightTrendCard: {
    flexDirection: "row", backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 16, marginTop: 14, gap: 12,
  },
  weightTrendLabel: { color: C.textMute, fontSize: 10, letterSpacing: 2, fontWeight: "800" },
  weightTrendValue: { color: C.text, fontSize: 22, fontWeight: "900", marginTop: 4 },
  weightTrendDelta: { fontSize: 18, fontWeight: "900", marginTop: 4 },
  weightTrendDate: { color: C.textMute, fontSize: 11, marginTop: 2 },

  /* Recents */
  recentChip: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999,
    maxWidth: 200,
  },
  recentChipText: { color: C.text, fontWeight: "700", fontSize: 12 },

  /* Fuel */
  foodPickerBtn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, padding: 16, marginBottom: 16,
  },
  foodPickerLabel: { color: C.textDim, fontSize: 10, letterSpacing: 3, fontWeight: "800" },
  foodPickerValue: { color: C.text, fontSize: 16, fontWeight: "700", marginTop: 6 },
  foodPickerMeta: { color: C.textMute, fontSize: 11, marginTop: 4 },

  unitRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  unitChip: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8,
  },
  unitChipActive: { backgroundColor: C.text, borderColor: C.text },
  unitChipText: { color: C.textDim, fontWeight: "900", fontSize: 11, letterSpacing: 1 },

  previewInline: { color: C.science, fontSize: 12, marginTop: 8, fontWeight: "700" },

  todayLogHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginTop: 24, marginBottom: 10,
  },
  wipeText: { color: C.penalty, fontSize: 11, letterSpacing: 2, fontWeight: "900" },
  emptyBox: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderStyle: "dashed", borderRadius: 10, padding: 24, alignItems: "center",
  },
  emptyText: { color: C.textMute, fontSize: 13 },

  logCard: {
    flexDirection: "row", backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, padding: 14, marginBottom: 8,
  },
  logName: { color: C.text, fontWeight: "700", fontSize: 14 },
  logMeta: { color: C.textMute, fontSize: 11, marginTop: 4 },
  logMacros: { alignItems: "flex-end" },
  logKcal: { color: C.text, fontWeight: "900", fontSize: 14 },
  logBreak: { color: C.textDim, fontSize: 11, marginTop: 4 },

  /* Picker modal */
  pickerHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderColor: C.border,
  },
  searchWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, paddingHorizontal: 14, marginHorizontal: 16, marginTop: 12, gap: 10,
  },
  searchInput: { flex: 1, color: C.text, fontSize: 15, paddingVertical: 14 },
  foodRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, padding: 14, marginBottom: 8,
  },
  foodRowName: { color: C.text, fontWeight: "700", fontSize: 14 },
  foodRowCat: { color: C.textMute, fontSize: 10, letterSpacing: 2, fontWeight: "800", marginTop: 4 },
  foodRowMeta: { alignItems: "flex-end" },
  foodRowKcal: { color: C.text, fontWeight: "900", fontSize: 14 },
  foodRowMacros: { color: C.textDim, fontSize: 11, marginTop: 4 },

  /* Ledger */
  bankCard: {
    backgroundColor: "#06180c", borderWidth: 1.5, borderColor: C.optimal,
    borderRadius: 14, padding: 22, marginBottom: 16,
  },
  bankLabel: { color: C.optimal, letterSpacing: 4, fontSize: 11, fontWeight: "900", marginBottom: 8 },
  bankValue: { color: C.optimal, fontSize: 56, fontWeight: "900", letterSpacing: -2 },
  bankSub: { color: C.textDim, fontSize: 12, marginTop: 8, lineHeight: 18 },
  todayDeficitCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 16, gap: 14,
  },
  deficitValue: { fontSize: 28, fontWeight: "900", marginTop: 4 },
  bankBtn: {
    backgroundColor: C.optimal, paddingVertical: 16, paddingHorizontal: 18,
    borderRadius: 10, alignItems: "center",
  },
  bankBtnDisabled: { backgroundColor: C.border },
  bankBtnText: { color: C.bg, fontWeight: "900", letterSpacing: 2, fontSize: 12 },
  historyRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, padding: 14, marginBottom: 6,
  },
  historyDate: { color: C.textDim, fontSize: 13, fontWeight: "700" },
  historyDeficit: { color: C.optimal, fontWeight: "900", fontSize: 16 },

  /* Arsenal */
  arsenalLead: { color: C.textDim, fontSize: 13, lineHeight: 19, marginBottom: 14 },
  tipCard: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 18, marginBottom: 12,
  },
  tipHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  tipIdx: { color: C.textMute, fontWeight: "900", fontSize: 14, letterSpacing: 2, marginRight: 10 },
  tipTag: {
    color: C.science, fontSize: 10, fontWeight: "900", letterSpacing: 3,
    backgroundColor: "rgba(14,165,233,0.1)",
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4,
  },
  tipTitle: { color: C.text, fontWeight: "900", fontSize: 18, letterSpacing: 0.5, marginBottom: 8 },
  tipBody: { color: C.textDim, fontSize: 13, lineHeight: 20 },
  citationBar: {
    flexDirection: "row", alignItems: "center",
    marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderColor: C.border, gap: 8,
  },
  tipCitation: { color: C.science, fontSize: 11, fontWeight: "700", flex: 1 },

  /* Weight modal extras */
  weightModalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  weightRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  weightRowDate: { color: C.textDim, fontSize: 11, fontWeight: "700", width: 78 },
  weightRowBarTrack: { flex: 1, height: 6, backgroundColor: C.bg2, borderRadius: 3, overflow: "hidden" },
  weightRowBarFill: { height: 6, backgroundColor: C.science, borderRadius: 3 },
  weightRowValue: { color: C.text, fontSize: 12, fontWeight: "900", width: 56, textAlign: "right" },

  /* Tab Bar */
  tabBar: {
    flexDirection: "row", borderTopWidth: 1, borderColor: C.border,
    backgroundColor: C.bg2,
  },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 12, paddingBottom: 14, position: "relative" },
  tabLabel: { color: C.textMute, fontSize: 10, letterSpacing: 2, fontWeight: "900", marginTop: 4 },
  tabIndicator: { position: "absolute", top: 0, width: 28, height: 2, backgroundColor: C.text },
});
