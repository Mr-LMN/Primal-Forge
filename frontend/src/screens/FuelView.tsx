import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  C,
  FOODS,
  RECIPES,
  XP_RULES,
  todayKey,
  round,
  type Food,
  type Unit,
  type Recipe,
  type RecipeMeal,
  type RecipeIngredient,
} from "../data";
import { styles } from "../styles";
import {
  haptic,
  confirmAction,
  fitScore,
  fitReason,
  buildDayPlan,
  type MacroRem,
  type PlannedMeal,
} from "../utils";
import type { LogEntry } from "../types";

type FuelMode = "foods" | "recipes";
type RecipeSort = "default" | "fit";

const MEAL_FILTERS: { id: RecipeMeal | "all"; label: string }[] = [
  { id: "all", label: "ALL" },
  { id: "BREAKFAST", label: "BREAKFAST" },
  { id: "LUNCH", label: "LUNCH" },
  { id: "DINNER", label: "DINNER" },
  { id: "POST-WO", label: "POST-WO" },
  { id: "SNACK", label: "SNACK" },
];

const SCALE_OPTIONS: number[] = [0.5, 0.75, 1, 1.25, 1.5, 2];

const scaleQty = (qty: string, factor: number): string => {
  if (factor === 1) return qty;
  const m = qty.match(/^([\d.]+)\s*(.*)$/);
  if (!m) return qty;
  const n = parseFloat(m[1]);
  if (!isFinite(n)) return qty;
  const scaled = n * factor;
  const formatted = scaled >= 10 ? Math.round(scaled).toString() : scaled.toFixed(1).replace(/\.0$/, "");
  return `${formatted} ${m[2]}`.trim();
};

export function FuelView({
  log,
  recents,
  onLog,
  onWipe,
  remaining,
  favourites,
  onToggleFavourite,
  customRecipes,
  onSaveCustomRecipe,
  onDeleteCustomRecipe,
}: {
  log: LogEntry[];
  recents: string[];
  onLog: (e: LogEntry) => void;
  onWipe: () => void;
  remaining: MacroRem;
  favourites: string[];
  onToggleFavourite: (recipeId: string) => void;
  customRecipes: Recipe[];
  onSaveCustomRecipe: (r: Recipe) => void;
  onDeleteCustomRecipe: (id: string) => void;
}) {
  const [mode, setMode] = useState<FuelMode>("foods");
  const [recipeSort, setRecipeSort] = useState<RecipeSort>("default");
  const [picker, setPicker] = useState(false);
  const [selected, setSelected] = useState<Food | null>(null);
  const [unit, setUnit] = useState<Unit>({ id: "g", label: "g", g: 1 });
  const [amount, setAmount] = useState("");
  const [search, setSearch] = useState("");

  // Recipes state
  const [mealFilter, setMealFilter] = useState<RecipeMeal | "all">("all");
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null);
  const [scale, setScale] = useState(1);
  const [planVisible, setPlanVisible] = useState(false);
  const [plan, setPlan] = useState<PlannedMeal<Recipe>[]>([]);
  const [recipeFormVisible, setRecipeFormVisible] = useState(false);
  const [formName, setFormName] = useState("");
  const [formMeal, setFormMeal] = useState<RecipeMeal>("BREAKFAST");
  const [formPrep, setFormPrep] = useState("10");
  const [formKcal, setFormKcal] = useState("");
  const [formP, setFormP] = useState("");
  const [formF, setFormF] = useState("");
  const [formC, setFormC] = useState("");
  const [formIngredients, setFormIngredients] = useState("");
  const [formSteps, setFormSteps] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return FOODS;
    return FOODS.filter(
      (f) => f.name.toLowerCase().includes(q) || f.cat.toLowerCase().includes(q)
    );
  }, [search]);

  const recentFoods = useMemo(
    () => recents.map((id) => FOODS.find((f) => f.id === id)).filter(Boolean) as Food[],
    [recents]
  );

  const favSet = useMemo(() => new Set(favourites), [favourites]);

  const allRecipes = useMemo<Recipe[]>(
    () => [...customRecipes, ...RECIPES],
    [customRecipes]
  );
  const customIds = useMemo(() => new Set(customRecipes.map((r) => r.id)), [customRecipes]);

  const filteredRecipes = useMemo(() => {
    const base = mealFilter === "all" ? allRecipes : allRecipes.filter((r) => r.meal === mealFilter);
    if (recipeSort === "fit") {
      return [...base]
        .map((r) => ({ r, score: fitScore(r, remaining) }))
        .sort((a, b) => b.score - a.score)
        .map((x) => x.r);
    }
    // default: favourites float to top, then custom recipes, otherwise original order
    return [...base].sort((a, b) => {
      const af = favSet.has(a.id) ? 1 : 0;
      const bf = favSet.has(b.id) ? 1 : 0;
      if (bf !== af) return bf - af;
      const ac = customIds.has(a.id) ? 1 : 0;
      const bc = customIds.has(b.id) ? 1 : 0;
      return bc - ac;
    });
  }, [mealFilter, recipeSort, remaining, favSet, allRecipes, customIds]);

  const fitBadgeColor = (score: number) =>
    score >= 75 ? C.optimal : score >= 50 ? C.warning : C.penalty;

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

  const logRecipe = (r: Recipe, factor = 1) => {
    haptic("medium");
    const suffix = factor !== 1 ? ` ×${factor}` : "";
    const entry: LogEntry = {
      id: `${Date.now()}`,
      foodId: r.id,
      name: `${r.name} (recipe)${suffix}`,
      amount: factor,
      unit: "serving",
      grams: 0,
      kcal: round(r.kcal * factor, 1),
      p: round(r.p * factor, 1),
      f: round(r.f * factor, 1),
      c: round(r.c * factor, 1),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      dateKey: todayKey(),
    };
    onLog(entry);
    setOpenRecipe(null);
    setScale(1);
  };

  const openDetail = (r: Recipe) => {
    setOpenRecipe(r);
    setScale(1);
  };

  const generatePlan = () => {
    haptic("medium");
    const next = buildDayPlan(allRecipes, remaining);
    setPlan(next);
    setPlanVisible(true);
  };

  const logPlan = () => {
    if (plan.length === 0) return;
    haptic("success");
    plan.forEach((m) => logRecipe(m.recipe));
    setPlanVisible(false);
    setPlan([]);
  };

  const resetForm = () => {
    setFormName("");
    setFormMeal("BREAKFAST");
    setFormPrep("10");
    setFormKcal("");
    setFormP("");
    setFormF("");
    setFormC("");
    setFormIngredients("");
    setFormSteps("");
    setFormDescription("");
  };

  const saveCustomRecipe = () => {
    const name = formName.trim();
    const kcal = parseFloat(formKcal);
    const p = parseFloat(formP);
    const f = parseFloat(formF);
    const c = parseFloat(formC);
    if (!name || !isFinite(kcal) || !isFinite(p) || !isFinite(f) || !isFinite(c)) return;
    const ingredients: RecipeIngredient[] = formIngredients
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const m = line.match(/^([^—\-:]+?)\s*[—\-:]\s*(.+)$/);
        if (m) return { qty: m[2].trim(), item: m[1].trim() };
        return { qty: "", item: line };
      });
    const steps = formSteps.split("\n").map((s) => s.trim()).filter(Boolean);
    const recipe: Recipe = {
      id: `custom-${Date.now()}`,
      name,
      meal: formMeal,
      prepMin: Math.max(1, parseInt(formPrep, 10) || 10),
      description: formDescription.trim() || "Your recipe.",
      tags: ["high-protein"],
      kcal: Math.round(kcal),
      p: Math.round(p),
      f: Math.round(f),
      c: Math.round(c),
      ingredients,
      steps: steps.length > 0 ? steps : ["Combine ingredients to taste."],
    };
    onSaveCustomRecipe(recipe);
    setRecipeFormVisible(false);
    resetForm();
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
        <Text style={styles.sectionKicker}>FUEL · LOG INTAKE</Text>

        {/* MODE TOGGLE */}
        <View style={styles.modeToggleRow} testID="fuel-mode-toggle">
          <TouchableOpacity
            testID="mode-foods"
            onPress={() => { haptic("light"); setMode("foods"); }}
            style={[styles.modeToggleBtn, mode === "foods" && styles.modeToggleBtnActive]}
          >
            <Text style={[styles.modeToggleText, mode === "foods" && styles.modeToggleTextActive]}>FOODS · {FOODS.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="mode-recipes"
            onPress={() => { haptic("light"); setMode("recipes"); }}
            style={[styles.modeToggleBtn, mode === "recipes" && styles.modeToggleBtnActive]}
          >
            <Text style={[styles.modeToggleText, mode === "recipes" && styles.modeToggleTextActive]}>RECIPES · {RECIPES.length}</Text>
          </TouchableOpacity>
        </View>

        {/* ============== FOODS MODE ============== */}
        {mode === "foods" && (
          <>
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
                        onPress={() => { haptic(); setUnit(u); }}
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
                value={amount}
                onChangeText={setAmount}
                placeholder={unit.id === "g" ? "200" : "1"}
                placeholderTextColor={C.textMute}
                keyboardType="decimal-pad"
                style={styles.input}
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
              <Text style={styles.primaryBtnText}>LOG INTAKE · +{XP_RULES.mealLogged} XP</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ============== RECIPES MODE ============== */}
        {mode === "recipes" && (
          <>
            <Text style={styles.subKicker}>FILTER BY MEAL</Text>
            <View style={styles.recipeFilterRow} testID="recipe-meal-filters">
              {MEAL_FILTERS.map((m) => {
                const active = mealFilter === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    testID={`recipe-filter-${m.id}`}
                    onPress={() => { haptic("light"); setMealFilter(m.id); }}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, active && { color: C.bg }]}>{m.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.subKicker, { marginTop: 4 }]}>SORT</Text>
            <View style={styles.recipeSortRow} testID="recipe-sort-toggle">
              <TouchableOpacity
                testID="recipe-sort-default"
                onPress={() => { haptic("light"); setRecipeSort("default"); }}
                style={[styles.recipeSortBtn, recipeSort === "default" && styles.recipeSortBtnActive]}
              >
                <Ionicons name="star" size={11} color={recipeSort === "default" ? C.bg : C.gold} />
                <Text style={[styles.recipeSortText, recipeSort === "default" && { color: C.bg }]}>FAVES TOP</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="recipe-sort-fit"
                onPress={() => { haptic("light"); setRecipeSort("fit"); }}
                style={[styles.recipeSortBtn, recipeSort === "fit" && styles.recipeSortBtnActive]}
              >
                <Ionicons name="flash" size={11} color={recipeSort === "fit" ? C.bg : C.science} />
                <Text style={[styles.recipeSortText, recipeSort === "fit" && { color: C.bg }]}>FIT MY MACROS</Text>
              </TouchableOpacity>
            </View>

            {recipeSort === "fit" && (
              <View style={styles.fitHeaderBox} testID="fit-remaining">
                <Text style={styles.subKicker}>REMAINING TODAY</Text>
                <View style={styles.fitRemainRow}>
                  <Text style={styles.fitRemainKcal}>{Math.round(remaining.kcal)} kcal</Text>
                  <Text style={[styles.fitRemainMacro, { color: C.science }]}>{Math.round(remaining.p)}P</Text>
                  <Text style={[styles.fitRemainMacro, { color: C.warning }]}>{Math.round(remaining.f)}F</Text>
                  <Text style={[styles.fitRemainMacro, { color: C.optimal }]}>{Math.round(remaining.c)}C</Text>
                </View>
                <Text style={styles.fitRemainHint}>
                  {remaining.kcal <= 0
                    ? "Goal hit. Below shows leftover-friendly picks."
                    : "Recipes ranked by closeness — higher = better fit."}
                </Text>
              </View>
            )}

            <View style={styles.planBtnRow}>
              <TouchableOpacity
                testID="recipe-plan-btn"
                onPress={generatePlan}
                style={styles.planBtn}
                disabled={remaining.kcal <= 100}
              >
                <Ionicons name="layers-outline" size={14} color={C.text} />
                <Text style={styles.planBtnText}>BUILD A FULL DAY</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="recipe-add-btn"
                onPress={() => { haptic(); resetForm(); setRecipeFormVisible(true); }}
                style={styles.planBtn}
              >
                <Ionicons name="add" size={14} color={C.text} />
                <Text style={styles.planBtnText}>ADD RECIPE</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.subKicker, { marginTop: 4 }]}>{filteredRecipes.length} RECIPES</Text>

            {filteredRecipes.map((r) => {
              const isFav = favSet.has(r.id);
              const isCustom = customIds.has(r.id);
              const score = recipeSort === "fit" ? fitScore(r, remaining) : null;
              return (
              <View key={r.id} style={styles.recipeCard} testID={`recipe-${r.id}`}>
                <View style={styles.recipeHeadRow}>
                  <View style={styles.recipeMealBadge}>
                    <Text style={styles.recipeMealBadgeText}>{r.meal}</Text>
                  </View>
                  <View style={styles.recipeTimeBadge}>
                    <Ionicons name="time-outline" size={10} color={C.textDim} />
                    <Text style={styles.recipeTimeBadgeText}>{r.prepMin} MIN</Text>
                  </View>
                  {isCustom && (
                    <View style={styles.customBadge} testID={`recipe-custom-${r.id}`}>
                      <Ionicons name="person" size={9} color={C.gold} />
                      <Text style={styles.customBadgeText}>YOURS</Text>
                    </View>
                  )}
                  {score !== null && (
                    <View
                      style={[styles.fitBadge, { borderColor: fitBadgeColor(score) }]}
                      testID={`fit-badge-${r.id}`}
                    >
                      <Ionicons name="flash" size={9} color={fitBadgeColor(score)} />
                      <Text style={[styles.fitBadgeText, { color: fitBadgeColor(score) }]}>
                        FIT {score}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    testID={`recipe-fav-${r.id}`}
                    onPress={() => onToggleFavourite(r.id)}
                    hitSlop={10}
                    style={styles.recipeFavBtn}
                  >
                    <Ionicons
                      name={isFav ? "star" : "star-outline"}
                      size={18}
                      color={isFav ? C.gold : C.textDim}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.recipeName}>{r.name}</Text>
                <Text style={styles.recipeDesc} numberOfLines={2}>{r.description}</Text>
                {score !== null && (
                  <Text style={styles.fitExplainer} testID={`fit-reason-${r.id}`}>
                    {fitReason(r, remaining)}
                  </Text>
                )}

                <View style={styles.recipeMacroRow}>
                  <View style={[styles.recipeMacroChip, styles.recipeMacroChipKcal]}>
                    <Text style={styles.recipeMacroValue}>{r.kcal}</Text>
                    <Text style={[styles.recipeMacroLabel, { color: C.text }]}>kcal</Text>
                  </View>
                  <View style={[styles.recipeMacroChip, styles.recipeMacroChipP]}>
                    <Text style={styles.recipeMacroValue}>{r.p}</Text>
                    <Text style={[styles.recipeMacroLabel, { color: C.science }]}>P</Text>
                  </View>
                  <View style={[styles.recipeMacroChip, styles.recipeMacroChipF]}>
                    <Text style={styles.recipeMacroValue}>{r.f}</Text>
                    <Text style={[styles.recipeMacroLabel, { color: C.warning }]}>F</Text>
                  </View>
                  <View style={[styles.recipeMacroChip, styles.recipeMacroChipC]}>
                    <Text style={styles.recipeMacroValue}>{r.c}</Text>
                    <Text style={[styles.recipeMacroLabel, { color: C.optimal }]}>C</Text>
                  </View>
                </View>

                {r.tags.length > 0 && (
                  <View style={styles.recipeTagsRow}>
                    {r.tags.map((t) => (
                      <View key={t} style={styles.recipeTag}>
                        <Text style={styles.recipeTagText}>{t.toUpperCase()}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.recipeBtnRow}>
                  <TouchableOpacity
                    testID={`recipe-open-${r.id}`}
                    onPress={() => { haptic(); openDetail(r); }}
                    style={styles.recipeOpenBtn}
                  >
                    <Ionicons name="document-text-outline" size={13} color={C.text} />
                    <Text style={styles.recipeOpenText}>RECIPE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    testID={`recipe-log-${r.id}`}
                    onPress={() => logRecipe(r)}
                    style={styles.recipeLogBtn}
                  >
                    <Ionicons name="add-circle" size={14} color={C.bg} />
                    <Text style={styles.recipeLogText}>LOG +{XP_RULES.mealLogged} XP</Text>
                  </TouchableOpacity>
                  {isCustom && (
                    <TouchableOpacity
                      testID={`recipe-delete-${r.id}`}
                      onPress={() =>
                        confirmAction("DELETE RECIPE", `Remove "${r.name}"?`, () => onDeleteCustomRecipe(r.id))
                      }
                      style={styles.customDeleteBtn}
                      hitSlop={10}
                    >
                      <Ionicons name="trash-outline" size={16} color={C.penalty} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              );
            })}

            {filteredRecipes.length === 0 && (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No recipes match. Loosen the filter.</Text>
              </View>
            )}
          </>
        )}

        {/* ============== TODAY LOG (shared) ============== */}
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
                  {e.amount} {e.unit}{e.grams && e.unit !== "g" && e.unit !== "serving" ? ` (${e.grams}g)` : ""} · {e.time}
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

      {/* FOOD PICKER MODAL */}
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
                placeholder="ribeye, kippers, honey…"
                placeholderTextColor={C.textMute}
                style={styles.searchInput}
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

      {/* RECIPE DETAIL MODAL */}
      <Modal
        visible={openRecipe !== null}
        animationType="slide"
        onRequestClose={() => { setOpenRecipe(null); setScale(1); }}
      >
        {openRecipe && (
          <SafeAreaView style={[styles.root, { flex: 1 }]} edges={["top", "bottom"]}>
            <View style={styles.shell}>
              <View style={styles.pickerHeader}>
                <Text style={styles.brand}>RECIPE</Text>
                <TouchableOpacity onPress={() => { setOpenRecipe(null); setScale(1); }} testID="close-recipe">
                  <Ionicons name="close" size={26} color={C.text} />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={{ paddingBottom: 30 }} testID="recipe-detail">
                <View style={styles.recipeDetailHero}>
                  <View style={styles.recipeHeadRow}>
                    <View style={styles.recipeMealBadge}>
                      <Text style={styles.recipeMealBadgeText}>{openRecipe.meal}</Text>
                    </View>
                    <View style={styles.recipeTimeBadge}>
                      <Ionicons name="time-outline" size={10} color={C.textDim} />
                      <Text style={styles.recipeTimeBadgeText}>{openRecipe.prepMin} MIN</Text>
                    </View>
                    <TouchableOpacity
                      testID={`recipe-detail-fav-${openRecipe.id}`}
                      onPress={() => onToggleFavourite(openRecipe.id)}
                      hitSlop={10}
                      style={styles.recipeFavBtn}
                    >
                      <Ionicons
                        name={favSet.has(openRecipe.id) ? "star" : "star-outline"}
                        size={20}
                        color={favSet.has(openRecipe.id) ? C.gold : C.textDim}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.recipeDetailTitle}>{openRecipe.name}</Text>
                  <Text style={styles.recipeDetailDesc}>{openRecipe.description}</Text>
                  {openRecipe.tags.length > 0 && (
                    <View style={styles.recipeTagsRow}>
                      {openRecipe.tags.map((t) => (
                        <View key={t} style={styles.recipeTag}>
                          <Text style={styles.recipeTagText}>{t.toUpperCase()}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.recipeDetailMacroBlock}>
                  <View style={styles.recipeDetailMacroCol}>
                    <Text style={styles.recipeDetailMacroN}>{Math.round(openRecipe.kcal * scale)}</Text>
                    <Text style={styles.recipeDetailMacroL}>KCAL</Text>
                  </View>
                  <View style={styles.recipeDetailMacroCol}>
                    <Text style={[styles.recipeDetailMacroN, { color: C.science }]}>{Math.round(openRecipe.p * scale)}g</Text>
                    <Text style={styles.recipeDetailMacroL}>PROTEIN</Text>
                  </View>
                  <View style={styles.recipeDetailMacroCol}>
                    <Text style={[styles.recipeDetailMacroN, { color: C.warning }]}>{Math.round(openRecipe.f * scale)}g</Text>
                    <Text style={styles.recipeDetailMacroL}>FAT</Text>
                  </View>
                  <View style={styles.recipeDetailMacroCol}>
                    <Text style={[styles.recipeDetailMacroN, { color: C.optimal }]}>{Math.round(openRecipe.c * scale)}g</Text>
                    <Text style={styles.recipeDetailMacroL}>CARBS</Text>
                  </View>
                </View>

                <Text style={[styles.subKicker, { paddingHorizontal: 20 }]}>PORTION · {scale}× SERVINGS</Text>
                <View style={styles.scaleRow} testID="recipe-scale-row">
                  {SCALE_OPTIONS.map((s) => {
                    const active = scale === s;
                    return (
                      <TouchableOpacity
                        key={s}
                        testID={`recipe-scale-${s}`}
                        onPress={() => { haptic("light"); setScale(s); }}
                        style={[styles.scaleChip, active && styles.scaleChipActive]}
                      >
                        <Text style={[styles.scaleChipText, active && styles.scaleChipTextActive]}>
                          {s}×
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[styles.subKicker, { paddingHorizontal: 20 }]}>INGREDIENTS</Text>
                <View style={styles.recipeIngList}>
                  {openRecipe.ingredients.map((ing, i) => (
                    <View key={i} style={[styles.recipeIngRow, i === openRecipe.ingredients.length - 1 && { borderBottomWidth: 0 }]}>
                      <Text style={styles.recipeIngQty}>{scaleQty(ing.qty, scale)}</Text>
                      <Text style={styles.recipeIngItem}>{ing.item}</Text>
                    </View>
                  ))}
                </View>

                <Text style={[styles.subKicker, { paddingHorizontal: 20 }]}>METHOD</Text>
                {openRecipe.steps.map((s, i) => (
                  <View key={i} style={styles.recipeStepRow}>
                    <Text style={styles.recipeStepIdx}>{String(i + 1).padStart(2, "0")}</Text>
                    <Text style={styles.recipeStepText}>{s}</Text>
                  </View>
                ))}

                {openRecipe.why && (
                  <View style={styles.recipeWhyBox}>
                    <Text style={[styles.scienceKicker, { marginBottom: 6 }]}>WHY IT WORKS</Text>
                    <Text style={styles.scienceBody}>{openRecipe.why}</Text>
                  </View>
                )}

                <TouchableOpacity
                  testID="recipe-detail-log"
                  onPress={() => logRecipe(openRecipe, scale)}
                  style={styles.recipeLogBig}
                >
                  <Ionicons name="checkmark-circle" size={18} color={C.bg} />
                  <Text style={styles.recipeLogBigText}>
                    LOG {scale !== 1 ? `${scale}× · ` : ""}MEAL · +{XP_RULES.mealLogged} XP
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </SafeAreaView>
        )}
      </Modal>

      {/* DAY PLAN MODAL */}
      <Modal visible={planVisible} animationType="slide" onRequestClose={() => setPlanVisible(false)}>
        <SafeAreaView style={[styles.root, { flex: 1 }]} edges={["top", "bottom"]}>
          <View style={styles.shell}>
            <View style={styles.pickerHeader}>
              <Text style={styles.brand}>DAY PLAN</Text>
              <TouchableOpacity onPress={() => setPlanVisible(false)} testID="close-plan">
                <Ionicons name="close" size={26} color={C.text} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} testID="plan-detail">
              {(() => {
                const totals = plan.reduce(
                  (a, m) => ({
                    kcal: a.kcal + m.recipe.kcal,
                    p: a.p + m.recipe.p,
                    f: a.f + m.recipe.f,
                    c: a.c + m.recipe.c,
                  }),
                  { kcal: 0, p: 0, f: 0, c: 0 }
                );
                return (
                  <View style={styles.planSummary}>
                    <Text style={styles.subKicker}>PLAN TOTAL · {plan.length} MEAL{plan.length === 1 ? "" : "S"}</Text>
                    <View style={styles.planSummaryRow}>
                      <Text style={styles.planSummaryKcal}>{Math.round(totals.kcal)} kcal</Text>
                      <Text style={[styles.planSummaryMacro, { color: C.science }]}>{Math.round(totals.p)}P</Text>
                      <Text style={[styles.planSummaryMacro, { color: C.warning }]}>{Math.round(totals.f)}F</Text>
                      <Text style={[styles.planSummaryMacro, { color: C.optimal }]}>{Math.round(totals.c)}C</Text>
                    </View>
                    <Text style={styles.fitRemainHint}>
                      vs remaining {Math.round(remaining.kcal)} kcal · {Math.round(remaining.p)}P / {Math.round(remaining.f)}F / {Math.round(remaining.c)}C
                    </Text>
                  </View>
                );
              })()}

              {plan.length === 0 && (
                <Text style={styles.planEmpty}>
                  No clean fit found — your remaining macros are too tight for the recipe set.
                  Try logging a smaller snack or loosening the day.
                </Text>
              )}

              {plan.map((m, i) => (
                <View key={`${m.recipe.id}-${i}`} style={styles.planMealCard} testID={`plan-meal-${i}`}>
                  <View style={styles.planMealHead}>
                    <Text style={styles.planMealSlot}>{m.slot}</Text>
                    <Text style={styles.planMealName} numberOfLines={1}>{m.recipe.name}</Text>
                  </View>
                  <Text style={styles.planMealMacro}>
                    {m.recipe.kcal} kcal · {m.recipe.p}P / {m.recipe.f}F / {m.recipe.c}C · {m.recipe.prepMin} min
                  </Text>
                </View>
              ))}

              {plan.length > 0 && (
                <TouchableOpacity testID="plan-log-all" onPress={logPlan} style={styles.recipeLogBig}>
                  <Ionicons name="checkmark-done" size={18} color={C.bg} />
                  <Text style={styles.recipeLogBigText}>LOG ALL · +{XP_RULES.mealLogged * plan.length} XP</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* CUSTOM RECIPE FORM MODAL */}
      <Modal visible={recipeFormVisible} animationType="slide" onRequestClose={() => setRecipeFormVisible(false)}>
        <SafeAreaView style={[styles.root, { flex: 1 }]} edges={["top", "bottom"]}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
            <View style={styles.shell}>
              <View style={styles.pickerHeader}>
                <Text style={styles.brand}>NEW RECIPE</Text>
                <TouchableOpacity onPress={() => setRecipeFormVisible(false)} testID="close-recipe-form">
                  <Ionicons name="close" size={26} color={C.text} />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} keyboardShouldPersistTaps="handled" testID="recipe-form">
                <View style={styles.recipeFormField}>
                  <Text style={styles.recipeFormLabel}>NAME</Text>
                  <TextInput
                    testID="form-name"
                    value={formName}
                    onChangeText={setFormName}
                    placeholder="My ribeye stack"
                    placeholderTextColor={C.textMute}
                    style={styles.input}
                  />
                </View>

                <View style={styles.recipeFormField}>
                  <Text style={styles.recipeFormLabel}>MEAL</Text>
                  <View style={styles.mealPickRow}>
                    {(["BREAKFAST", "LUNCH", "DINNER", "POST-WO", "SNACK"] as RecipeMeal[]).map((m) => {
                      const active = formMeal === m;
                      return (
                        <TouchableOpacity
                          key={m}
                          testID={`form-meal-${m}`}
                          onPress={() => { haptic("light"); setFormMeal(m); }}
                          style={[styles.filterChip, active && styles.filterChipActive]}
                        >
                          <Text style={[styles.filterChipText, active && { color: C.bg }]}>{m}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.recipeFormField}>
                  <Text style={styles.recipeFormLabel}>DESCRIPTION (optional)</Text>
                  <TextInput
                    testID="form-description"
                    value={formDescription}
                    onChangeText={setFormDescription}
                    placeholder="Quick notes on what this is"
                    placeholderTextColor={C.textMute}
                    style={styles.input}
                  />
                </View>

                <View style={styles.recipeFormField}>
                  <Text style={styles.recipeFormLabel}>PREP MIN</Text>
                  <TextInput
                    testID="form-prep"
                    value={formPrep}
                    onChangeText={setFormPrep}
                    placeholder="10"
                    keyboardType="number-pad"
                    placeholderTextColor={C.textMute}
                    style={styles.input}
                  />
                </View>

                <View style={styles.recipeFormMacroRow}>
                  <View style={styles.recipeFormMacroCol}>
                    <Text style={styles.recipeFormLabel}>KCAL</Text>
                    <TextInput
                      testID="form-kcal"
                      value={formKcal}
                      onChangeText={setFormKcal}
                      placeholder="600"
                      keyboardType="decimal-pad"
                      placeholderTextColor={C.textMute}
                      style={styles.input}
                    />
                  </View>
                  <View style={styles.recipeFormMacroCol}>
                    <Text style={styles.recipeFormLabel}>PROTEIN g</Text>
                    <TextInput
                      testID="form-p"
                      value={formP}
                      onChangeText={setFormP}
                      placeholder="45"
                      keyboardType="decimal-pad"
                      placeholderTextColor={C.textMute}
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.recipeFormMacroRow}>
                  <View style={styles.recipeFormMacroCol}>
                    <Text style={styles.recipeFormLabel}>FAT g</Text>
                    <TextInput
                      testID="form-f"
                      value={formF}
                      onChangeText={setFormF}
                      placeholder="30"
                      keyboardType="decimal-pad"
                      placeholderTextColor={C.textMute}
                      style={styles.input}
                    />
                  </View>
                  <View style={styles.recipeFormMacroCol}>
                    <Text style={styles.recipeFormLabel}>CARBS g</Text>
                    <TextInput
                      testID="form-c"
                      value={formC}
                      onChangeText={setFormC}
                      placeholder="10"
                      keyboardType="decimal-pad"
                      placeholderTextColor={C.textMute}
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.recipeFormField}>
                  <Text style={styles.recipeFormLabel}>INGREDIENTS · ONE PER LINE · ITEM — QTY</Text>
                  <TextInput
                    testID="form-ingredients"
                    value={formIngredients}
                    onChangeText={setFormIngredients}
                    placeholder={"Ribeye — 200g\nWhole eggs — 3 medium\nButter — 14g"}
                    placeholderTextColor={C.textMute}
                    multiline
                    style={[styles.scanInputBox, { minHeight: 100 }]}
                  />
                </View>

                <View style={styles.recipeFormField}>
                  <Text style={styles.recipeFormLabel}>METHOD · ONE STEP PER LINE</Text>
                  <TextInput
                    testID="form-steps"
                    value={formSteps}
                    onChangeText={setFormSteps}
                    placeholder={"Sear ribeye 3 min/side\nFry eggs in butter\nPlate and salt"}
                    placeholderTextColor={C.textMute}
                    multiline
                    style={[styles.scanInputBox, { minHeight: 100 }]}
                  />
                </View>

                <TouchableOpacity
                  testID="form-save"
                  onPress={saveCustomRecipe}
                  disabled={!formName.trim() || !formKcal}
                  style={[
                    styles.primaryBtn,
                    (!formName.trim() || !formKcal) && styles.primaryBtnDisabled,
                  ]}
                >
                  <Text style={styles.primaryBtnText}>SAVE RECIPE</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </KeyboardAvoidingView>
  );
}
