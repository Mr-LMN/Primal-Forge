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
} from "../data";
import { styles } from "../styles";
import { haptic, confirmAction } from "../utils";
import type { LogEntry } from "../types";

type FuelMode = "foods" | "recipes";

const MEAL_FILTERS: { id: RecipeMeal | "all"; label: string }[] = [
  { id: "all", label: "ALL" },
  { id: "BREAKFAST", label: "BREAKFAST" },
  { id: "LUNCH", label: "LUNCH" },
  { id: "DINNER", label: "DINNER" },
  { id: "POST-WO", label: "POST-WO" },
  { id: "SNACK", label: "SNACK" },
];

export function FuelView({
  log,
  recents,
  onLog,
  onWipe,
}: {
  log: LogEntry[];
  recents: string[];
  onLog: (e: LogEntry) => void;
  onWipe: () => void;
}) {
  const [mode, setMode] = useState<FuelMode>("foods");
  const [picker, setPicker] = useState(false);
  const [selected, setSelected] = useState<Food | null>(null);
  const [unit, setUnit] = useState<Unit>({ id: "g", label: "g", g: 1 });
  const [amount, setAmount] = useState("");
  const [search, setSearch] = useState("");

  // Recipes state
  const [mealFilter, setMealFilter] = useState<RecipeMeal | "all">("all");
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null);

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

  const filteredRecipes = useMemo(() => {
    if (mealFilter === "all") return RECIPES;
    return RECIPES.filter((r) => r.meal === mealFilter);
  }, [mealFilter]);

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

  const logRecipe = (r: Recipe) => {
    haptic("medium");
    const entry: LogEntry = {
      id: `${Date.now()}`,
      foodId: r.id,
      name: `${r.name} (recipe)`,
      amount: 1,
      unit: "serving",
      grams: 0,
      kcal: r.kcal,
      p: r.p,
      f: r.f,
      c: r.c,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      dateKey: todayKey(),
    };
    onLog(entry);
    setOpenRecipe(null);
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

            <Text style={[styles.subKicker, { marginTop: 4 }]}>{filteredRecipes.length} RECIPES</Text>

            {filteredRecipes.map((r) => (
              <View key={r.id} style={styles.recipeCard} testID={`recipe-${r.id}`}>
                <View style={styles.recipeHeadRow}>
                  <View style={styles.recipeMealBadge}>
                    <Text style={styles.recipeMealBadgeText}>{r.meal}</Text>
                  </View>
                  <View style={styles.recipeTimeBadge}>
                    <Ionicons name="time-outline" size={10} color={C.textDim} />
                    <Text style={styles.recipeTimeBadgeText}>{r.prepMin} MIN</Text>
                  </View>
                </View>
                <Text style={styles.recipeName}>{r.name}</Text>
                <Text style={styles.recipeDesc} numberOfLines={2}>{r.description}</Text>

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
                    onPress={() => { haptic(); setOpenRecipe(r); }}
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
                </View>
              </View>
            ))}

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
      <Modal visible={openRecipe !== null} animationType="slide" onRequestClose={() => setOpenRecipe(null)}>
        {openRecipe && (
          <SafeAreaView style={[styles.root, { flex: 1 }]} edges={["top", "bottom"]}>
            <View style={styles.shell}>
              <View style={styles.pickerHeader}>
                <Text style={styles.brand}>RECIPE</Text>
                <TouchableOpacity onPress={() => setOpenRecipe(null)} testID="close-recipe">
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
                    <Text style={styles.recipeDetailMacroN}>{openRecipe.kcal}</Text>
                    <Text style={styles.recipeDetailMacroL}>KCAL</Text>
                  </View>
                  <View style={styles.recipeDetailMacroCol}>
                    <Text style={[styles.recipeDetailMacroN, { color: C.science }]}>{openRecipe.p}g</Text>
                    <Text style={styles.recipeDetailMacroL}>PROTEIN</Text>
                  </View>
                  <View style={styles.recipeDetailMacroCol}>
                    <Text style={[styles.recipeDetailMacroN, { color: C.warning }]}>{openRecipe.f}g</Text>
                    <Text style={styles.recipeDetailMacroL}>FAT</Text>
                  </View>
                  <View style={styles.recipeDetailMacroCol}>
                    <Text style={[styles.recipeDetailMacroN, { color: C.optimal }]}>{openRecipe.c}g</Text>
                    <Text style={styles.recipeDetailMacroL}>CARBS</Text>
                  </View>
                </View>

                <Text style={[styles.subKicker, { paddingHorizontal: 20 }]}>INGREDIENTS</Text>
                <View style={styles.recipeIngList}>
                  {openRecipe.ingredients.map((ing, i) => (
                    <View key={i} style={[styles.recipeIngRow, i === openRecipe.ingredients.length - 1 && { borderBottomWidth: 0 }]}>
                      <Text style={styles.recipeIngQty}>{ing.qty}</Text>
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
                  onPress={() => logRecipe(openRecipe)}
                  style={styles.recipeLogBig}
                >
                  <Ionicons name="checkmark-circle" size={18} color={C.bg} />
                  <Text style={styles.recipeLogBigText}>LOG MEAL · +{XP_RULES.mealLogged} XP</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </SafeAreaView>
        )}
      </Modal>
    </KeyboardAvoidingView>
  );
}
